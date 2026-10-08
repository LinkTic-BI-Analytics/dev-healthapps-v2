// @vitest-environment node
import { DEFAULT_SCHEMA, getDatabaseConfig, isLocalDatabase, requireDatabaseConfig, resolveSchema } from "./config";

const base = { DB_HOST: "localhost", DB_PORT: "5432", DB_NAME: "health_apps", DB_USER: "postgres", DB_PASSWORD: "postgres" };

describe("configuración de base de datos", () => {
  it("usa app_health cuando DB_SCHEMA no está definida", () => {
    expect(resolveSchema({})).toBe("app_health");
    expect(DEFAULT_SCHEMA).toBe("app_health");
    expect(getDatabaseConfig(base)?.url).toBe("postgresql://postgres:postgres@localhost:5432/health_apps?schema=app_health");
  });

  it("rechaza public y los esquemas reservados de Supabase/PostgreSQL", () => {
    for (const schema of ["public", "PUBLIC", "auth", "storage", "extensions", "pg_catalog", "information_schema"]) {
      expect(() => resolveSchema({ DB_SCHEMA: schema })).toThrow(/está reservado/);
    }
  });

  it("distingue bases locales de remotas", () => {
    expect(isLocalDatabase("postgresql://u:p@localhost:5432/x")).toBe(true);
    expect(isLocalDatabase("postgresql://u:p@db:5432/x")).toBe(true);
    expect(isLocalDatabase("postgresql://u:p@db.abcd.supabase.co:5432/postgres")).toBe(false);
    expect(isLocalDatabase("postgresql://u:p@aws-0-us-east-1.pooler.supabase.com:6543/postgres")).toBe(false);
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

  it("aplica DB_SSLMODE=require con semántica de libpq", () => {
    expect(getDatabaseConfig({ ...base, DB_SSLMODE: "require" })?.url).toBe(
      "postgresql://postgres:postgres@localhost:5432/health_apps?schema=app_health&sslmode=require&uselibpqcompat=true",
    );
    expect(getDatabaseConfig({ DATABASE_URL: "postgresql://u:p@db:5432/x", DB_SSLMODE: "require" })?.url).toContain(
      "sslmode=require&uselibpqcompat=true",
    );
    expect(() => getDatabaseConfig({ ...base, DB_SSLMODE: "verify" })).toThrow(/DB_SSLMODE/);
  });

  it("rechaza nombres de esquema inválidos", () => {
    expect(() => resolveSchema({ DB_SCHEMA: "app_health; DROP TABLE x" })).toThrow(/no es un nombre de esquema válido/);
  });

  it("devuelve null sin variables y requireDatabaseConfig explica qué falta", () => {
    expect(getDatabaseConfig({})).toBeNull();
    expect(() => requireDatabaseConfig({})).toThrow(/DB_HOST/);
  });
});
