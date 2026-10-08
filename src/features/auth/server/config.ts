/**
 * Configuración de autenticación desde variables de servidor (sin prefijo NEXT_PUBLIC_).
 * No importa "server-only" para poder usarse también desde proxy.ts.
 */

type Env = Record<string, string | undefined>;

export type AuthConfig = {
  accessSecret: Uint8Array;
  accessTtlMinutes: number;
  refreshTtlMinutes: number;
  /**
   * `Secure` en las cookies. `auto` (por defecto): solo si la petición llegó por HTTPS.
   * Safari (y cualquier navegador fuera de localhost) descarta cookies `Secure` recibidas por HTTP.
   */
  cookieSecure: boolean | "auto";
};

export const DEFAULT_ACCESS_TTL_MINUTES = 60;
/** Supuesto (WI-019): 7 días, pendiente de confirmar. */
export const DEFAULT_REFRESH_TTL_MINUTES = 10080;
const MIN_SECRET_LENGTH = 32;

function positiveInt(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined || value.trim() === "") return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`${name} debe ser un número entero de minutos mayor que 0.`);
  return n;
}

function parseCookieSecure(value: string | undefined): boolean | "auto" {
  const v = value?.trim().toLowerCase();
  if (!v || v === "auto") return "auto";
  if (v === "true") return true;
  if (v === "false") return false;
  throw new Error('AUTH_COOKIE_SECURE debe ser "auto", "true" o "false".');
}

/** Decide `Secure` para la petición actual según la configuración y el protocolo. */
export function resolveCookieSecure(setting: AuthConfig["cookieSecure"], forwardedProto: string | null): boolean {
  if (setting !== "auto") return setting;
  return forwardedProto?.split(",")[0]?.trim().toLowerCase() === "https";
}

export function getAuthConfig(env: Env = process.env): AuthConfig {
  const secret = env.JWT_ACCESS_SECRET ?? "";
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_ACCESS_SECRET debe tener al menos ${MIN_SECRET_LENGTH} caracteres. Genera uno con: openssl rand -base64 48`,
    );
  }
  const accessTtlMinutes = positiveInt(env.JWT_ACCESS_TTL_MINUTES, DEFAULT_ACCESS_TTL_MINUTES, "JWT_ACCESS_TTL_MINUTES");
  const refreshTtlMinutes = positiveInt(
    env.REFRESH_TOKEN_TTL_MINUTES,
    DEFAULT_REFRESH_TTL_MINUTES,
    "REFRESH_TOKEN_TTL_MINUTES",
  );
  if (refreshTtlMinutes < accessTtlMinutes) {
    throw new Error("REFRESH_TOKEN_TTL_MINUTES no puede ser menor que JWT_ACCESS_TTL_MINUTES.");
  }
  return {
    accessSecret: new TextEncoder().encode(secret),
    accessTtlMinutes,
    refreshTtlMinutes,
    cookieSecure: parseCookieSecure(env.AUTH_COOKIE_SECURE),
  };
}
