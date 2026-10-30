// @vitest-environment node
import { getAuthConfig, resolveCookieSecure } from "./config";

const secret = "s".repeat(32);

describe("getAuthConfig", () => {
  it("usa 60 min para el access token y 7 días para el refresh por defecto", () => {
    const c = getAuthConfig({ JWT_ACCESS_SECRET: secret });
    expect(c.accessTtlMinutes).toBe(60);
    expect(c.refreshTtlMinutes).toBe(10080);
    expect(c.cookieSecure).toBe("auto");
  });

  it("lee duraciones independientes del .env", () => {
    const c = getAuthConfig({ JWT_ACCESS_SECRET: secret, JWT_ACCESS_TTL_MINUTES: "15", REFRESH_TOKEN_TTL_MINUTES: "120" });
    expect([c.accessTtlMinutes, c.refreshTtlMinutes]).toEqual([15, 120]);
  });

  it("valida el secreto y las duraciones", () => {
    expect(() => getAuthConfig({ JWT_ACCESS_SECRET: "corto" })).toThrow(/al menos 32/);
    expect(() => getAuthConfig({ JWT_ACCESS_SECRET: secret, JWT_ACCESS_TTL_MINUTES: "0" })).toThrow(/mayor que 0/);
    expect(() =>
      getAuthConfig({ JWT_ACCESS_SECRET: secret, JWT_ACCESS_TTL_MINUTES: "60", REFRESH_TOKEN_TTL_MINUTES: "30" }),
    ).toThrow(/no puede ser menor/);
  });

  it("acepta auto, true y false", () => {
    expect(getAuthConfig({ JWT_ACCESS_SECRET: secret, AUTH_COOKIE_SECURE: "false" }).cookieSecure).toBe(false);
    expect(getAuthConfig({ JWT_ACCESS_SECRET: secret, AUTH_COOKIE_SECURE: "true" }).cookieSecure).toBe(true);
    expect(() => getAuthConfig({ JWT_ACCESS_SECRET: secret, AUTH_COOKIE_SECURE: "si" })).toThrow(/auto/);
  });

  it("en auto, Secure solo si la petición llegó por HTTPS (también detrás de un proxy)", () => {
    expect(resolveCookieSecure("auto", "https")).toBe(true);
    expect(resolveCookieSecure("auto", "https,http")).toBe(true);
    expect(resolveCookieSecure("auto", "http")).toBe(false);
    expect(resolveCookieSecure("auto", null)).toBe(false);
    expect(resolveCookieSecure(true, "http")).toBe(true);
  });
});
