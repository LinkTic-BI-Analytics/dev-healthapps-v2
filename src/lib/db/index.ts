import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { requireDatabaseConfig } from "./config";

/**
 * Conexiones por instancia. En Vercel cada instancia abre su propio pool, y el pooler de Supabase
 * limita los clientes (15 en modo sesión): por eso allí el pool es pequeño. Se ajusta con DB_POOL_MAX.
 */
function resolvePoolMax(): number {
  const value = Number(process.env.DB_POOL_MAX);
  if (Number.isInteger(value) && value > 0) return value;
  return process.env.VERCEL ? 2 : 10;
}

function createPrismaClient(): PrismaClient {
  const { url, schema } = requireDatabaseConfig();
  // `schema` califica las consultas de Prisma; `search_path` cubre el SQL crudo y current_schema().
  // Las conexiones ociosas se cierran pronto para liberar el cupo del pooler entre invocaciones.
  const adapter = new PrismaPg(
    { connectionString: url, options: `-c search_path=${schema}`, max: resolvePoolMax(), idleTimeoutMillis: 10_000 },
    { schema },
  );
  return new PrismaClient({ adapter });
}

/**
 * Cliente único por proceso, guardado en `globalThis` para que el hot reload de `next dev`
 * no abra un pool de conexiones nuevo en cada recarga.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getClient(): PrismaClient {
  globalForPrisma.prisma ??= createPrismaClient();
  return globalForPrisma.prisma;
}

/**
 * Acceso a la base de datos. Se crea en el primer uso (no al importar), para que `next build`
 * no necesite las variables DB_*: en producción se inyectan en tiempo de ejecución.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
