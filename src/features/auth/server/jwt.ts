import { jwtVerify, SignJWT } from "jose";
import type { RoleCode } from "../constants/roles";

/**
 * Access token (JWT HS256). Sin "server-only" ni Prisma: lo usa también proxy.ts para la
 * verificación optimista (firma y expiración). La verificación segura (sesión no revocada)
 * la hace `authenticate()` contra la base de datos.
 */

const ISSUER = "health-apps";
const AUDIENCE = "health-apps";

export type AccessTokenClaims = { userId: string; sessionId: string; role: RoleCode };

export async function signAccessToken(
  claims: AccessTokenClaims,
  secret: Uint8Array,
  ttlMinutes: number,
): Promise<string> {
  return new SignJWT({ sid: claims.sessionId, role: claims.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.userId)
    .setJti(crypto.randomUUID())
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttlMinutes}m`)
    .sign(secret);
}

/** Devuelve los claims si la firma y la expiración son válidas; si no, `null`. */
export async function verifyAccessToken(token: string, secret: Uint8Array): Promise<AccessTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { issuer: ISSUER, audience: AUDIENCE, algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.sid !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return { userId: payload.sub, sessionId: payload.sid, role: payload.role as RoleCode };
  } catch {
    return null;
  }
}
