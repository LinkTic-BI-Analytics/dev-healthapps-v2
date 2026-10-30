import { safeCallbackUrl } from "./callback-url";

describe("safeCallbackUrl", () => {
  it("acepta rutas internas con query", () => {
    expect(safeCallbackUrl("/alertas?x=1")).toBe("/alertas?x=1");
  });

  it.each([null, "", "https://evil.com", "//evil.com", "/\\evil.com", "/login", "/api/auth/session"])(
    "rechaza %s",
    (value) => {
      expect(safeCallbackUrl(value)).toBe("/");
    },
  );
});
