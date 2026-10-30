// @vitest-environment node
import { APP_SCHEMA, getDatabaseConfig, isLocalDatabase, requireDatabaseConfig } from "./config";

const base = { DB_HOST: "localhost", DB_PORT: "5432", DB_NAME: "health_apps", DB_USER: "postgres", DB_PASSWORD: "postgres" };

describe("configuración de base de datos", () => {
  it("usa siempre el esquema auth-direction", () => {
    expect(APP_SCHEMA).toBe("auth-direction");
    expect(getDatabaseConfig(base)).toEqual({
      url: "postgresql://postgres:postgres@localhost:5432/health_apps?schema=auth-direction",
      schema: "auth-direction",
    });
    expect(getDatabaseConfig({ ...base, DB_SCHEMA: "auth-direction" })?.schema).toBe("auth-direction");
  });

  it("rechaza DB_SCHEMA con cualquier otro esquema", () => {
    for (const schema of ["public", "auth", "app_health", "health_extern", "auth-direction; DROP TABLE x"]) {
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

  it("da prioridad a DATABASE_URL y le impone el esquema auth-direction", () => {
    const config = getDatabaseConfig({ DATABASE_URL: "postgresql://u:p@db:5432/x?schema=public" });
    expect(config?.url).toBe("postgresql://u:p@db:5432/x?schema=auth-direction");
  });

  it("aplica DB_SSLMODE=require con semántica de libpq", () => {
    expect(getDatabaseConfig({ ...base, DB_SSLMODE: "require" })?.url).toBe(
      "postgresql://postgres:postgres@localhost:5432/health_apps?schema=auth-direction&sslmode=require&uselibpqcompat=true",
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
