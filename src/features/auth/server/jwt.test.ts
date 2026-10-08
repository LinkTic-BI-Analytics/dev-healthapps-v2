// @vitest-environment node
import { SignJWT } from "jose";
import { signAccessToken, verifyAccessToken } from "./jwt";

const secret = new TextEncoder().encode("x".repeat(48));
const claims = { userId: "u1", sessionId: "s1", role: "admin" as const };

describe("access token", () => {
  it("firma y verifica los claims", async () => {
    const token = await signAccessToken(claims, secret, 60);
    expect(await verifyAccessToken(token, secret)).toEqual(claims);
  });

  it("rechaza un token firmado con otro secreto", async () => {
    const token = await signAccessToken(claims, new TextEncoder().encode("y".repeat(48)), 60);
    expect(await verifyAccessToken(token, secret)).toBeNull();
  });

  it("rechaza un token expirado", async () => {
    const token = await new SignJWT({ sid: "s1", role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("u1")
      .setIssuer("health-apps")
      .setAudience("health-apps")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 120)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(secret);
    expect(await verifyAccessToken(token, secret)).toBeNull();
  });

  it("rechaza basura", async () => {
    expect(await verifyAccessToken("no-es-un-jwt", secret)).toBeNull();
  });
});
