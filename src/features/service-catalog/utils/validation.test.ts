import { createServiceSchema, updateServiceSchema } from "./validation";

describe("validación de servicios", () => {
  it("acepta nombre y URL http(s) y normaliza la descripción vacía a null", () => {
    expect(createServiceSchema.parse({ name: " API ", checkUrl: "https://api.x.com/health", description: "" })).toEqual({
      name: "API",
      checkUrl: "https://api.x.com/health",
      description: null,
    });
  });

  it.each(["", "no-es-url", "ftp://x.com", "javascript:alert(1)"])("rechaza la URL %j con un mensaje claro", (checkUrl) => {
    const r = createServiceSchema.safeParse({ name: "API", checkUrl });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toMatch(/URL/);
  });

  it("rechaza el nombre vacío", () => {
    expect(createServiceSchema.safeParse({ name: "  ", checkUrl: "https://x.com" }).error?.issues[0].message).toBe(
      "El nombre es obligatorio.",
    );
  });

  it("la edición acepta cambios parciales pero no un cuerpo vacío", () => {
    expect(updateServiceSchema.parse({ isActive: false })).toEqual({ isActive: false });
    expect(updateServiceSchema.safeParse({}).success).toBe(false);
  });
});

describe("parámetros esperados", () => {
  const base = { name: "API", checkUrl: "https://x.com" };

  it("son opcionales al crear (la base aplica los valores por defecto)", () => {
    const r = createServiceSchema.parse(base);
    expect(r.degradedResponseTimeMs).toBeUndefined();
    expect(r.downAfterFailures).toBeUndefined();
  });

  it("convierten el texto del formulario a número", () => {
    expect(createServiceSchema.parse({ ...base, degradedResponseTimeMs: "600", downAfterFailures: "5" })).toMatchObject({
      degradedResponseTimeMs: 600,
      downAfterFailures: 5,
    });
  });

  it.each([
    [{ degradedResponseTimeMs: "0" }, /mayor o igual a 1/],
    [{ degradedResponseTimeMs: "-5" }, /mayor o igual a 1/],
    [{ downAfterFailures: "1.5" }, /entero/],
    [{ downAfterFailures: "abc" }, /número/],
  ])("rechazan valores no positivos o inválidos %j", (extra, message) => {
    const r = createServiceSchema.safeParse({ ...base, ...extra });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toMatch(message);
  });
});
