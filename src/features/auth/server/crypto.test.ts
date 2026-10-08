// @vitest-environment node
import { generateRefreshToken, hashPassword, hashToken, verifyPassword } from "./crypto";

describe("crypto", () => {
  it("hashea con argon2id y verifica", async () => {
    const hash = await hashPassword("secreta");
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain("secreta");
    expect(await verifyPassword(hash, "secreta")).toBe(true);
    expect(await verifyPassword(hash, "otra")).toBe(false);
  });

  it("verifyPassword devuelve false con un hash inválido", async () => {
    expect(await verifyPassword("no-es-un-hash", "x")).toBe(false);
  });

  it("genera refresh tokens aleatorios y guarda solo su SHA-256", () => {
    const a = generateRefreshToken();
    expect(a).not.toBe(generateRefreshToken());
    expect(hashToken(a)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(a)).toBe(hashToken(a));
  });
});
