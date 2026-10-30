import { hash, verify } from "@node-rs/argon2";
import { createHash, randomBytes } from "node:crypto";

/** Hash argon2id (algoritmo por defecto de @node-rs/argon2). */
export function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/** Refresh token opaco: 256 bits aleatorios. */
export function generateRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

/** En la base solo se guarda el SHA-256 del refresh token. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
