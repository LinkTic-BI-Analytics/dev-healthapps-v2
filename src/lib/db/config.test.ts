// @vitest-environment node
import { APP_SCHEMA, getDatabaseConfig, isLocalDatabase, requireDatabaseConfig } from "./config";

const base = { DB_HOST: "localhost", DB_PORT: "5432", DB_NAME: "health_apps", DB_USER: "postgres", DB_PASSWORD: "postgres" };

describe("configuración de base de datos", () => {
  it("usa siempre el esquema app_health", () => {
    expect(APP_SCHEMA).toBe("app_health");
    expect(getDatabaseConfig(base)).toEqual({
      url: "postgresql://postgres:postgres@localhost:5432/health_apps?schema=app_health",
      schema: "app_health",
    });
    expect(getDatabaseConfig({ ...base, DB_SCHEMA: "app_health" })?.schema).toBe("app_health");
  });

  it("rechaza DB_SCHEMA con cualquier otro esquema", () => {
    for (const schema of ["public", "auth", "health_extern", "app_health; DROP TABLE x"]) {
      expect(() => getDatabaseConfig({ ...base, DB_SCHEMA: schema })).toThrow(/ya no se admite/);
    }
  });

  it("distingue bases locales de remotas", () => {
    expect(isLocalDatabase("postgresql://u:p@localhost:5432/x")).toBe(true);
    expect(isLocalDatabase("postgresql://u:p@db:5432/x")).toBe(true);
    expect(isLocalDatabase("postgresql://u:p@db.abcd.supabase.co:5432/postgres")).toBe(false);
    expect(isLocalDatabase("postgresql://u:p@aws-0-us-east-1.pooler.supabase.com:6543/postgres")).toBe(false);
  });

  it("codifica caracteres especiales de la contraseña", () => {
    expect(getDatabaseConfig({ ...base, DB_PASSWORD: "p@ss:w/rd" })?.url).toContain("postgres:p%40ss%3Aw%2Frd@");
  });

  it("da prioridad a DATABASE_URL y le impone el esquema app_health", () => {
    const config = getDatabaseConfig({ DATABASE_URL: "postgresql://u:p@db:5432/x?schema=public" });
    expect(config?.url).toBe("postgresql://u:p@db:5432/x?schema=app_health");
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

  it("devuelve null sin variables y requireDatabaseConfig explica qué falta", () => {
    expect(getDatabaseConfig({})).toBeNull();
    expect(() => requireDatabaseConfig({})).toThrow(/DB_HOST/);
  });
});
