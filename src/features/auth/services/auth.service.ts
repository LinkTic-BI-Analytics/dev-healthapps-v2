import { apiFetch } from "@/lib/api-fetch";
import type { AuthUser, LoginPayload, RegisterPayload } from "../types/auth.types";

const base = "/api/auth";
// Los endpoints de autenticación no deben disparar la renovación automática ante un 401.
const noRetry = { retryOnUnauthorized: false } as const;

/** Cliente HTTP de autenticación (las cookies las gestiona el servidor). */
export const AuthService = {
  login: async (payload: LoginPayload): Promise<AuthUser> =>
    (await apiFetch<{ user: AuthUser }>(`${base}/login`, { method: "POST", json: payload, ...noRetry })).user,

  register: async (payload: RegisterPayload): Promise<AuthUser> =>
    (await apiFetch<{ user: AuthUser }>(`${base}/register`, { method: "POST", json: payload, ...noRetry })).user,

  refresh: async (): Promise<AuthUser> =>
    (await apiFetch<{ user: AuthUser }>(`${base}/refresh`, { method: "POST", ...noRetry })).user,

  logout: (): Promise<void> => apiFetch<void>(`${base}/logout`, { method: "POST", ...noRetry }),

  logoutAll: (): Promise<void> => apiFetch<void>(`${base}/logout-all`, { method: "POST" }),

  me: async (): Promise<AuthUser> => (await apiFetch<{ user: AuthUser }>(`${base}/me`)).user,
};
