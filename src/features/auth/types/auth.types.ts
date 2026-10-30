import type { PermissionCode } from "../constants/permissions";
import type { RoleCode } from "../constants/roles";

/** Usuario autenticado tal como lo ve la aplicación (nunca incluye hashes). */
export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: RoleCode;
  /** Permisos efectivos: los del rol menos los revocados (superadmin: todos). */
  permissions: PermissionCode[];
};

export type LoginPayload = { identifier: string; password: string };
export type RegisterPayload = { email: string; username: string; password: string };
export type CreateUserPayload = RegisterPayload & { role: RoleCode };
export type ChangePasswordPayload = { currentPassword: string; newPassword: string };

export type RefreshTokenPayload = { refreshToken: string };

/** Tokens para apps externas (respuesta de POST /api/auth/token y /api/auth/token/refresh). */
export type TokenResponse = {
  tokenType: "Bearer";
  accessToken: string;
  /** Segundos hasta que vence el access token. */
  expiresIn: number;
  refreshToken: string;
  /** Segundos hasta que vence el refresh token. */
  refreshExpiresIn: number;
  user: AuthUser;
};

/** Usuario creado (respuesta de POST /api/users). */
export type CreatedUser = Pick<AuthUser, "id" | "email" | "username" | "role">;
