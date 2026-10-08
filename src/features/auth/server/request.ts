import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { HttpError } from "@/lib/http-error";
import { ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_COOKIE_PATH } from "../constants/cookies";
import type { PermissionCode } from "../constants/permissions";
import type { AuthUser } from "../types/auth.types";
import { authenticate, type IssuedTokens, type RequestMeta } from "./auth.service";
import { getAuthConfig, resolveCookieSecure } from "./config";

/** Usuario de la petición actual (sesión validada en base de datos). Memorizado por petición. */
export const getCurrentUser = cache(async (): Promise<(AuthUser & { sessionId: string }) | null> => {
  const store = await cookies();
  return authenticate(store.get(ACCESS_COOKIE)?.value);
});

/** Exige una sesión válida: 401 si no la hay. */
export async function requireUser(): Promise<AuthUser & { sessionId: string }> {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Tu sesión no es válida o expiró. Inicia sesión de nuevo.");
  return user;
}

/** Exige sesión y permiso: 401 sin sesión, 403 sin el permiso. Lo usa todo Route Handler protegido. */
export async function requirePermission(permission: PermissionCode): Promise<AuthUser & { sessionId: string }> {
  const user = await requireUser();
  if (!user.permissions.includes(permission)) {
    throw new HttpError(403, "No tienes permiso para realizar esta acción.");
  }
  return user;
}

export function hasPermission(user: Pick<AuthUser, "permissions"> | null, permission: PermissionCode): boolean {
  return !!user?.permissions.includes(permission);
}

export async function getRequestMeta(): Promise<RequestMeta> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return { userAgent: h.get("user-agent"), ipAddress: forwarded || h.get("x-real-ip") };
}

export async function setAuthCookies(tokens: IssuedTokens): Promise<void> {
  const { cookieSecure } = getAuthConfig();
  const store = await cookies();
  const secure = resolveCookieSecure(cookieSecure, (await headers()).get("x-forwarded-proto"));
  const base = { httpOnly: true, secure, sameSite: "lax" as const };
  store.set(ACCESS_COOKIE, tokens.accessToken, { ...base, path: "/", expires: tokens.accessExpiresAt });
  store.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    path: REFRESH_COOKIE_PATH,
    expires: tokens.refreshExpiresAt,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete({ name: ACCESS_COOKIE, path: "/" });
  store.delete({ name: REFRESH_COOKIE, path: REFRESH_COOKIE_PATH });
}

export async function getRefreshTokenCookie(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}
