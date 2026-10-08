/**
 * Configuración de conexión a PostgreSQL a partir de las variables DB_*.
 * La usan el CLI de Prisma (prisma.config.ts) y el cliente de la aplicación,
 * para que ambos apunten a la misma base y al mismo esquema.
 */

type Env = Record<string, string | undefined>;

export type DatabaseConfig = {
  /** URL de conexión con `?schema=` (la usa Prisma Migrate). */
  url: string;
  /** Esquema de PostgreSQL donde viven las tablas. */
  schema: string;
};

export const DEFAULT_SCHEMA = "public";

/** Solo identificadores simples: el esquema se interpola en `search_path`. */
const SCHEMA_PATTERN = /^[A-Za-z_][A-Za-z0-9_]{0,62}$/;

export function resolveSchema(env: Env = process.env): string {
  const schema = env.DB_SCHEMA?.trim() || DEFAULT_SCHEMA;
  if (!SCHEMA_PATTERN.test(schema)) {
    throw new Error(
      `DB_SCHEMA="${schema}" no es un nombre de esquema válido. Usa solo letras, números y guion bajo (p. ej. health_extern).`,
    );
  }
  return schema;
}

/**
 * Devuelve la configuración o `null` si faltan variables (p. ej. durante `prisma generate`
 * en el build de Docker, que no necesita conexión).
 * `DATABASE_URL`, si está definida, tiene prioridad sobre las variables DB_*.
 */
export function getDatabaseConfig(env: Env = process.env): DatabaseConfig | null {
  const schema = resolveSchema(env);

  if (env.DATABASE_URL?.trim()) {
    const url = new URL(env.DATABASE_URL.trim());
    url.searchParams.set("schema", schema);
    return { url: url.toString(), schema };
  }

  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = env;
  if (!DB_HOST || !DB_NAME || !DB_USER) return null;

  const auth = `${encodeURIComponent(DB_USER)}${DB_PASSWORD ? `:${encodeURIComponent(DB_PASSWORD)}` : ""}`;
  const url = `postgresql://${auth}@${DB_HOST}:${DB_PORT || "5432"}/${encodeURIComponent(DB_NAME)}?schema=${schema}`;
  return { url, schema };
}

/** Igual que `getDatabaseConfig`, pero falla con un mensaje accionable si falta configuración. */
export function requireDatabaseConfig(env: Env = process.env): DatabaseConfig {
  const config = getDatabaseConfig(env);
  if (!config) {
    throw new Error(
      "Falta la configuración de la base de datos. Define DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD y DB_SCHEMA en .env (ver .env.example).",
    );
  }
  return config;
}
