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

/**
 * Esquema único de la app: tablas, migraciones, seed y worker viven siempre aquí. No es configurable,
 * para que ningún entorno termine apuntando a otro esquema (en Supabase la base es compartida).
 */
export const APP_SCHEMA = "app_health";

/** `DB_SCHEMA` ya no se usa; si un `.env` viejo la define con otro valor, se falla en vez de ignorarla. */
function assertNoOtherSchema(env: Env) {
  const schema = env.DB_SCHEMA?.trim();
  if (schema && schema !== APP_SCHEMA) {
    throw new Error(
      `DB_SCHEMA="${schema}" ya no se admite: la app usa siempre el esquema ${APP_SCHEMA}. Quita DB_SCHEMA del .env.`,
    );
  }
}

/** Hosts donde se permiten comandos destructivos de Prisma (migrate dev/reset, db push). */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "db", "host.docker.internal"]);

export function isLocalDatabase(url: string): boolean {
  return LOCAL_HOSTS.has(new URL(url).hostname.toLowerCase());
}

/**
 * Devuelve la configuración o `null` si faltan variables (p. ej. durante `prisma generate`
 * en el build de Docker, que no necesita conexión).
 * `DATABASE_URL`, si está definida, tiene prioridad sobre las variables DB_*.
 */
export function getDatabaseConfig(env: Env = process.env): DatabaseConfig | null {
  assertNoOtherSchema(env);
  const schema = APP_SCHEMA;

  const sslMode = resolveSslMode(env);

  if (env.DATABASE_URL?.trim()) {
    const url = new URL(env.DATABASE_URL.trim());
    url.searchParams.set("schema", schema);
    applySslMode(url, sslMode);
    return { url: url.toString(), schema };
  }

  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = env;
  if (!DB_HOST || !DB_NAME || !DB_USER) return null;

  const auth = `${encodeURIComponent(DB_USER)}${DB_PASSWORD ? `:${encodeURIComponent(DB_PASSWORD)}` : ""}`;
  const url = new URL(`postgresql://${auth}@${DB_HOST}:${DB_PORT || "5432"}/${encodeURIComponent(DB_NAME)}`);
  url.searchParams.set("schema", schema);
  applySslMode(url, sslMode);
  return { url: url.toString(), schema };
}

type SslMode = "disable" | "require";

function resolveSslMode(env: Env): SslMode | undefined {
  const mode = env.DB_SSLMODE?.trim().toLowerCase();
  if (!mode) return undefined;
  if (mode !== "disable" && mode !== "require") {
    throw new Error(`DB_SSLMODE="${env.DB_SSLMODE}" no es válido. Usa "require" (Supabase) o "disable" (local).`);
  }
  return mode;
}

/**
 * `require` cifra la conexión sin validar el certificado (semántica de libpq): la CA de Supabase no
 * está en el almacén de Node. `uselibpqcompat` hace que `pg` lo interprete así en vez de como
 * `verify-full`; el CLI de Prisma lo ignora y entiende `sslmode=require` igual.
 */
function applySslMode(url: URL, mode: SslMode | undefined) {
  if (!mode) return;
  url.searchParams.set("sslmode", mode);
  if (mode === "require") url.searchParams.set("uselibpqcompat", "true");
}

/** Igual que `getDatabaseConfig`, pero falla con un mensaje accionable si falta configuración. */
export function requireDatabaseConfig(env: Env = process.env): DatabaseConfig {
  const config = getDatabaseConfig(env);
  if (!config) {
    throw new Error(
      "Falta la configuración de la base de datos. Define DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD en .env (ver .env.example).",
    );
  }
  return config;
}
