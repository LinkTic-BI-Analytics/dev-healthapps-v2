import { db } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import { createUser } from "@/features/users/server/user.service";
import { PERMISSIONS } from "../constants/permissions";
import {
  INVALID_CREDENTIALS,
  authenticate,
  changePassword,
  login,
  refresh,
  register,
  revokeAllUserSessions,
  revokeSession,
  setUserActive,
} from "./auth.service";
import { seedRolesAndPermissions, seedSuperadmin } from "./seed-auth";

/** Datos únicos por ejecución para no chocar con datos existentes. */
const run = Date.now().toString(36);
const u = (name: string) => ({
  email: `${name}.${run}@test.local`,
  username: `${name}_${run}`,
  password: "clave",
});

async function expectHttpError(promise: Promise<unknown>, status: number, message?: RegExp | string) {
  const err = await promise.then(
    () => {
      throw new Error("Se esperaba un error");
    },
    (e: unknown) => e,
  );
  expect(err).toBeInstanceOf(HttpError);
  expect((err as HttpError).statusCode).toBe(status);
  if (message) expect((err as HttpError).message).toMatch(message);
}

const superadminData = u("root");

beforeAll(async () => {
  await seedRolesAndPermissions(db);
  await seedSuperadmin(db, superadminData);
});

afterAll(async () => {
  await db.user.deleteMany({ where: { email: { endsWith: `${run}@test.local` } } });
  await db.$disconnect();
});

describe("registro y login", () => {
  it("el autorregistro crea un usuario con rol nuevo, sin permisos, y con sesión", async () => {
    const data = u("ana");
    const { user, tokens } = await register(data);
    expect(user).toMatchObject({ email: data.email, username: data.username, role: "nuevo", permissions: [] });
    expect(await authenticate(tokens.accessToken)).toMatchObject({ id: user.id, role: "nuevo" });
    const row = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row.passwordHash).toMatch(/^\$argon2id\$/);
  });

  it("rechaza email o username duplicados con 409", async () => {
    await expectHttpError(register(u("ana")), 409);
  });

  it("acepta email o username, sin distinguir mayúsculas (normalizados por la validación)", async () => {
    const data = u("ana");
    await expect(login({ identifier: data.email, password: "clave" })).resolves.toBeTruthy();
    await expect(login({ identifier: data.username, password: "clave" })).resolves.toBeTruthy();
  });

  it("usa el mismo mensaje para usuario inexistente y contraseña errónea", async () => {
    await expectHttpError(login({ identifier: "no-existe", password: "x" }), 401, INVALID_CREDENTIALS);
    await expectHttpError(login({ identifier: u("ana").username, password: "mala" }), 401, INVALID_CREDENTIALS);
  });

  it("un usuario inactivo no puede iniciar sesión y pierde sus sesiones", async () => {
    const { user, tokens } = await register(u("inactivo"));
    await setUserActive(user.id, false);
    expect(await authenticate(tokens.accessToken)).toBeNull();
    await expectHttpError(login({ identifier: u("inactivo").username, password: "clave" }), 403);
  });
});

describe("revocación de tokens", () => {
  it("tras logout, el access token que aún no expira es rechazado", async () => {
    const { tokens, sessionId } = await login({ identifier: u("ana").username, password: "clave" });
    expect(await authenticate(tokens.accessToken)).not.toBeNull();
    await revokeSession(sessionId, "logout");
    expect(await authenticate(tokens.accessToken)).toBeNull();
  });

  it("logout-all invalida los tokens de todas las sesiones", async () => {
    const a = await login({ identifier: u("ana").username, password: "clave" });
    const b = await login({ identifier: u("ana").email, password: "clave" });
    await revokeAllUserSessions(a.user.id, "logout_all");
    expect(await authenticate(a.tokens.accessToken)).toBeNull();
    expect(await authenticate(b.tokens.accessToken)).toBeNull();
  });

  it("refresh rota el refresh token y revoca la sesión anterior", async () => {
    const first = await login({ identifier: u("ana").username, password: "clave" });
    const second = await refresh(first.tokens.refreshToken);
    expect(second.tokens.refreshToken).not.toBe(first.tokens.refreshToken);
    expect(await authenticate(first.tokens.accessToken)).toBeNull();
    expect(await authenticate(second.tokens.accessToken)).not.toBeNull();
    const old = await db.userSession.findUniqueOrThrow({ where: { id: first.sessionId } });
    expect(old.revokedReason).toBe("rotation");
  });

  it("reutilizar un refresh token rotado (fuera del margen) revoca todas las sesiones", async () => {
    const first = await login({ identifier: u("ana").username, password: "clave" });
    const second = await refresh(first.tokens.refreshToken);
    // Simula que la rotación ocurrió hace más que el margen de concurrencia.
    await db.userSession.update({
      where: { id: first.sessionId },
      data: { revokedAt: new Date(Date.now() - 60_000) },
    });
    await expectHttpError(refresh(first.tokens.refreshToken), 401);
    expect(await authenticate(second.tokens.accessToken)).toBeNull();
    const current = await db.userSession.findUniqueOrThrow({ where: { id: second.sessionId } });
    expect(current.revokedReason).toBe("reuse_detected");
  });

  it("cambiar la contraseña revoca todas las sesiones y abre una nueva", async () => {
    const data = u("cambio");
    const reg = await register(data);
    const other = await login({ identifier: data.username, password: "clave" });
    const result = await changePassword(reg.user.id, { currentPassword: "clave", newPassword: "nueva" });
    expect(await authenticate(reg.tokens.accessToken)).toBeNull();
    expect(await authenticate(other.tokens.accessToken)).toBeNull();
    expect(await authenticate(result.tokens.accessToken)).not.toBeNull();
    await expectHttpError(login({ identifier: data.username, password: "clave" }), 401);
    await expect(login({ identifier: data.username, password: "nueva" })).resolves.toBeTruthy();
  });
});

describe("roles y permisos", () => {
  it("superadmin tiene todos los permisos aunque se le revoquen", async () => {
    const { user } = await login({ identifier: superadminData.username, password: "clave" });
    const perm = await db.permission.findUniqueOrThrow({ where: { code: PERMISSIONS.USERS_CREATE } });
    await db.userRevokedPermission.create({ data: { userId: user.id, permissionId: perm.id } });
    const again = await login({ identifier: superadminData.username, password: "clave" });
    expect(again.user.permissions).toEqual(expect.arrayContaining([PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_READ]));
  });

  it("superadmin crea un admin; el admin crea usuarios pero no superadmins", async () => {
    const root = (await login({ identifier: superadminData.username, password: "clave" })).user;
    const adminData = u("admin");
    await expect(createUser(root, { ...adminData, role: "admin" })).resolves.toMatchObject({ role: "admin" });

    const admin = (await login({ identifier: adminData.username, password: "clave" })).user;
    expect(admin.permissions).toEqual(expect.arrayContaining([PERMISSIONS.USERS_CREATE]));
    await expect(createUser(admin, { ...u("creado"), role: "nuevo" })).resolves.toMatchObject({ role: "nuevo" });
    await expectHttpError(createUser(admin, { ...u("otroroot"), role: "superadmin" }), 403);

    const created = await db.user.findUniqueOrThrow({ where: { email: u("creado").email } });
    expect(created.createdById).toBe(admin.id);
  });

  it("a un admin se le puede revocar un permiso de forma individual", async () => {
    const adminData = u("admin");
    const admin = (await login({ identifier: adminData.username, password: "clave" })).user;
    const perm = await db.permission.findUniqueOrThrow({ where: { code: PERMISSIONS.USERS_CREATE } });
    await db.userRevokedPermission.create({ data: { userId: admin.id, permissionId: perm.id } });
    const after = (await login({ identifier: adminData.username, password: "clave" })).user;
    expect(after.permissions).not.toContain(PERMISSIONS.USERS_CREATE);
    expect(after.permissions).toContain(PERMISSIONS.USERS_READ);
  });
});
