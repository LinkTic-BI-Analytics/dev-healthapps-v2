import "server-only";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import { ROLES, isRoleCode, type RoleCode } from "../constants/roles";
import type { AuthUser, ChangePasswordPayload, LoginPayload, RegisterPayload } from "../types/auth.types";
import { getAuthConfig, type AuthConfig } from "./config";
import { generateRefreshToken, hashPassword, hashToken, verifyPassword } from "./crypto";
import { signAccessToken, verifyAccessToken } from "./jwt";
import { computeEffectivePermissions } from "./permissions";

/** Datos del cliente que se guardan con la sesión. */
export type RequestMeta = { userAgent?: string | null; ipAddress?: string | null };

export type IssuedTokens = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
};

export type AuthResult = { user: AuthUser; tokens: IssuedTokens; sessionId: string };

export type RevokeReason =
  | "logout"
  | "logout_all"
  | "rotation"
  | "reuse_detected"
  | "password_change"
  | "user_disabled";

/** Mismo mensaje para email/usuario inexistente y contraseña errónea: no revela qué usuarios existen. */
export const INVALID_CREDENTIALS = "Email, usuario o contraseña incorrectos.";

/**
 * Margen para refrescos concurrentes (p. ej. dos pestañas a la vez): reutilizar un refresh token
 * rotado hace menos de esto no se considera robo; simplemente se rechaza.
 */
const REUSE_GRACE_MS = 30_000;

const userWithAccess = {
  role: { include: { permissions: { include: { permission: { select: { code: true } } } } } },
  revokedPermissions: { include: { permission: { select: { code: true } } } },
} as const;

type UserWithAccess = {
  id: string;
  email: string;
  username: string;
  role: { code: string; permissions: { permission: { code: string } }[] };
  revokedPermissions: { permission: { code: string } }[];
};

async function toAuthUser(user: UserWithAccess): Promise<AuthUser> {
  const role = user.role.code;
  if (!isRoleCode(role)) throw new HttpError(500, "El usuario tiene un rol desconocido.");
  const allPermissions =
    role === ROLES.SUPERADMIN ? (await db.permission.findMany({ select: { code: true } })).map((p) => p.code) : [];
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role,
    permissions: computeEffectivePermissions({
      role,
      rolePermissions: user.role.permissions.map((rp) => rp.permission.code),
      revokedPermissions: user.revokedPermissions.map((rp) => rp.permission.code),
      allPermissions,
    }),
  };
}

function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60_000);
}

async function issueSession(
  user: { id: string; role: RoleCode },
  meta: RequestMeta,
  config: AuthConfig,
): Promise<{ sessionId: string; tokens: IssuedTokens }> {
  const refreshToken = generateRefreshToken();
  const refreshExpiresAt = minutesFromNow(config.refreshTtlMinutes);
  const session = await db.userSession.create({
    data: {
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      userAgent: meta.userAgent?.slice(0, 512) ?? null,
      ipAddress: meta.ipAddress?.slice(0, 64) ?? null,
      expiresAt: refreshExpiresAt,
    },
  });
  const accessToken = await signAccessToken(
    { userId: user.id, sessionId: session.id, role: user.role },
    config.accessSecret,
    config.accessTtlMinutes,
  );
  return {
    sessionId: session.id,
    tokens: { accessToken, refreshToken, accessExpiresAt: minutesFromNow(config.accessTtlMinutes), refreshExpiresAt },
  };
}

export async function revokeSession(sessionId: string, reason: RevokeReason): Promise<void> {
  await db.userSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
}

export async function revokeAllUserSessions(userId: string, reason: RevokeReason): Promise<number> {
  const { count } = await db.userSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
  return count;
}

/** Hash con el que se compara cuando el usuario no existe, para igualar el tiempo de respuesta. */
let dummyHash: Promise<string> | undefined;

export async function register(payload: RegisterPayload, meta: RequestMeta = {}): Promise<AuthResult> {
  const config = getAuthConfig();
  const role = await db.role.findUnique({ where: { code: ROLES.NUEVO } });
  if (!role) throw new HttpError(500, "Falta el rol 'nuevo'. Ejecuta `pnpm db:seed`.");
  const user = await createUserRecord({ ...payload, roleId: role.id, createdById: null });
  const { sessionId, tokens } = await issueSession({ id: user.id, role: ROLES.NUEVO }, meta, config);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { user: await toAuthUser(user), tokens, sessionId };
}

/** Crea el registro del usuario y traduce los duplicados a 409 con un mensaje claro. */
export async function createUserRecord(input: RegisterPayload & { roleId: string; createdById: string | null }) {
  const existing = await db.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    const messages = [];
    if (existing.email === input.email) messages.push("Ya existe una cuenta con ese email.");
    if (existing.username === input.username) messages.push("Ese nombre de usuario ya está en uso.");
    throw new HttpError(409, messages);
  }
  try {
    return await db.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash: await hashPassword(input.password),
        roleId: input.roleId,
        createdById: input.createdById,
      },
      include: userWithAccess,
    });
  } catch (err) {
    // Carrera entre la verificación y la inserción: el índice único decide.
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002") {
      throw new HttpError(409, "Ya existe una cuenta con ese email o usuario.");
    }
    throw err;
  }
}

export async function login(payload: LoginPayload, meta: RequestMeta = {}): Promise<AuthResult> {
  const config = getAuthConfig();
  const user = await db.user.findFirst({
    where: { OR: [{ email: payload.identifier }, { username: payload.identifier }] },
    include: userWithAccess,
  });

  if (!user) {
    dummyHash ??= hashPassword("contraseña-de-relleno");
    await verifyPassword(await dummyHash, payload.password);
    throw new HttpError(401, INVALID_CREDENTIALS);
  }
  if (!(await verifyPassword(user.passwordHash, payload.password))) throw new HttpError(401, INVALID_CREDENTIALS);
  if (!user.isActive) throw new HttpError(403, "Tu cuenta está desactivada. Contacta a un administrador.");

  const authUser = await toAuthUser(user);
  const { sessionId, tokens } = await issueSession({ id: user.id, role: authUser.role }, meta, config);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { user: authUser, tokens, sessionId };
}

/**
 * Rota el refresh token: crea una sesión nueva y revoca la anterior (`rotation`).
 * Si llega un refresh token ya rotado (fuera del margen de concurrencia), se asume robo y se
 * revocan todas las sesiones del usuario (`reuse_detected`).
 */
export async function refresh(refreshToken: string, meta: RequestMeta = {}): Promise<AuthResult> {
  const config = getAuthConfig();
  const session = await db.userSession.findUnique({
    where: { refreshTokenHash: hashToken(refreshToken) },
    include: { user: { include: userWithAccess } },
  });
  const expired = new HttpError(401, "Tu sesión expiró. Inicia sesión de nuevo.");
  if (!session) throw expired;

  if (session.revokedAt) {
    const withinGrace =
      session.revokedReason === "rotation" && Date.now() - session.revokedAt.getTime() < REUSE_GRACE_MS;
    if (session.revokedReason === "rotation" && !withinGrace) {
      await revokeAllUserSessions(session.userId, "reuse_detected");
    }
    throw expired;
  }
  if (session.expiresAt.getTime() <= Date.now() || !session.user.isActive) throw expired;

  // Revocación condicional: si otra petición rotó esta sesión al mismo tiempo, solo una gana.
  const { count } = await db.userSession.updateMany({
    where: { id: session.id, revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: "rotation", lastUsedAt: new Date() },
  });
  if (count === 0) throw expired;

  const authUser = await toAuthUser(session.user);
  const { sessionId, tokens } = await issueSession(
    { id: session.userId, role: authUser.role },
    { userAgent: meta.userAgent ?? session.userAgent, ipAddress: meta.ipAddress ?? session.ipAddress },
    config,
  );
  return { user: authUser, tokens, sessionId };
}

/**
 * Verificación segura del access token: firma y expiración del JWT **y** sesión vigente
 * (no revocada ni expirada) de un usuario activo. Devuelve el usuario con sus permisos efectivos.
 */
export async function authenticate(accessToken: string | undefined): Promise<(AuthUser & { sessionId: string }) | null> {
  if (!accessToken) return null;
  const claims = await verifyAccessToken(accessToken, getAuthConfig().accessSecret);
  if (!claims) return null;
  const session = await db.userSession.findUnique({
    where: { id: claims.sessionId },
    include: { user: { include: userWithAccess } },
  });
  if (
    !session ||
    session.userId !== claims.userId ||
    session.revokedAt ||
    session.expiresAt.getTime() <= Date.now() ||
    !session.user.isActive
  ) {
    return null;
  }
  return { ...(await toAuthUser(session.user)), sessionId: session.id };
}

/** Cambia la contraseña, revoca todas las sesiones y abre una nueva para quien la cambió. */
export async function changePassword(
  userId: string,
  payload: ChangePasswordPayload,
  meta: RequestMeta = {},
): Promise<AuthResult> {
  const config = getAuthConfig();
  const user = await db.user.findUnique({ where: { id: userId }, include: userWithAccess });
  if (!user) throw new HttpError(404, "El usuario no existe.");
  if (!(await verifyPassword(user.passwordHash, payload.currentPassword))) {
    throw new HttpError(400, "La contraseña actual no es correcta.");
  }
  await db.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(payload.newPassword), passwordChangedAt: new Date() },
  });
  await revokeAllUserSessions(userId, "password_change");
  const authUser = await toAuthUser(user);
  const { sessionId, tokens } = await issueSession({ id: userId, role: authUser.role }, meta, config);
  return { user: authUser, tokens, sessionId };
}

/** Activa o desactiva un usuario; al desactivarlo se revocan todas sus sesiones. */
export async function setUserActive(userId: string, isActive: boolean): Promise<void> {
  await db.user.update({ where: { id: userId }, data: { isActive } });
  if (!isActive) await revokeAllUserSessions(userId, "user_disabled");
}
