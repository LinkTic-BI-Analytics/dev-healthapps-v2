// @vitest-environment node
import { DEFAULT_SCHEMA, getDatabaseConfig, requireDatabaseConfig, resolveSchema } from "./config";

const base = { DB_HOST: "localhost", DB_PORT: "5432", DB_NAME: "health_apps", DB_USER: "postgres", DB_PASSWORD: "postgres" };

describe("configuración de base de datos", () => {
  it("usa public cuando DB_SCHEMA no está definida", () => {
    expect(resolveSchema({})).toBe(DEFAULT_SCHEMA);
    expect(getDatabaseConfig(base)?.url).toBe("postgresql://postgres:postgres@localhost:5432/health_apps?schema=public");
  });

  it("compone la URL con el esquema de DB_SCHEMA", () => {
    expect(getDatabaseConfig({ ...base, DB_SCHEMA: "health_extern" })).toEqual({
      url: "postgresql://postgres:postgres@localhost:5432/health_apps?schema=health_extern",
      schema: "health_extern",
    });
  });

  it("codifica caracteres especiales de la contraseña", () => {
    expect(getDatabaseConfig({ ...base, DB_PASSWORD: "p@ss:w/rd" })?.url).toContain("postgres:p%40ss%3Aw%2Frd@");
  });

  it("da prioridad a DATABASE_URL y le aplica DB_SCHEMA", () => {
    const config = getDatabaseConfig({ DATABASE_URL: "postgresql://u:p@db:5432/x", DB_SCHEMA: "health_extern" });
    expect(config?.url).toBe("postgresql://u:p@db:5432/x?schema=health_extern");
  });

  it("rechaza nombres de esquema inválidos", () => {
    expect(() => resolveSchema({ DB_SCHEMA: "public; DROP TABLE x" })).toThrow(/no es un nombre de esquema válido/);
  });

  it("devuelve null sin variables y requireDatabaseConfig explica qué falta", () => {
    expect(getDatabaseConfig({})).toBeNull();
    expect(() => requireDatabaseConfig({})).toThrow(/DB_HOST/);
  });
});
