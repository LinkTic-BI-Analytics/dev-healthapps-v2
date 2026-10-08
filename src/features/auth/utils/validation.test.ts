import { createUserSchema, loginSchema, registerSchema } from "./validation";

describe("validación de autenticación", () => {
  it("normaliza email, username e identificador a minúsculas", () => {
    expect(registerSchema.parse({ email: " Ana@Mail.COM ", username: "Ana.Dev", password: "x" })).toEqual({
      email: "ana@mail.com",
      username: "ana.dev",
      password: "x",
    });
    expect(loginSchema.parse({ identifier: "ANA", password: "x" }).identifier).toBe("ana");
  });

  it("no impone reglas de contraseña salvo que no esté vacía", () => {
    expect(registerSchema.safeParse({ email: "a@b.co", username: "abc", password: "1" }).success).toBe(true);
    expect(registerSchema.safeParse({ email: "a@b.co", username: "abc", password: "" }).success).toBe(false);
  });

  it("rechaza email y username inválidos con mensajes en español", () => {
    const r = registerSchema.safeParse({ email: "no-email", username: "a b", password: "x" });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.message)).toEqual(
      expect.arrayContaining(["Ingresa un email válido."]),
    );
  });

  it("solo acepta roles conocidos al crear usuarios", () => {
    expect(createUserSchema.safeParse({ email: "a@b.co", username: "abc", password: "x", role: "root" }).success).toBe(false);
  });
});
