import { parseBearerToken, tokenResponse } from "./request";

describe("tokens para apps externas", () => {
  it("lee el access token de Authorization: Bearer", () => {
    expect(parseBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(parseBearerToken("bearer   abc ")).toBe("abc");
    expect(parseBearerToken("Basic abc")).toBeUndefined();
    expect(parseBearerToken("Bearer ")).toBeUndefined();
    expect(parseBearerToken(null)).toBeUndefined();
  });

  it("devuelve los tokens con su vigencia en segundos y sin datos de sesión", () => {
    const now = Date.UTC(2026, 0, 1);
    const user = { id: "u1", email: "a@b.co", username: "ana", role: "admin" as const, permissions: [] };
    const body = tokenResponse(
      {
        user,
        sessionId: "s1",
        tokens: {
          accessToken: "at",
          refreshToken: "rt",
          accessExpiresAt: new Date(now + 3_600_000),
          refreshExpiresAt: new Date(now + 604_800_000),
        },
      },
      now,
    );
    expect(body).toEqual({
      tokenType: "Bearer",
      accessToken: "at",
      expiresIn: 3600,
      refreshToken: "rt",
      refreshExpiresIn: 604800,
      user,
    });
  });
});
