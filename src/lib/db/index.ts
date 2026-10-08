import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { requireDatabaseConfig } from "./config";

function createPrismaClient(): PrismaClient {
  const { url, schema } = requireDatabaseConfig();
  // `schema` califica las consultas de Prisma; `search_path` cubre el SQL crudo y current_schema().
  const adapter = new PrismaPg({ connectionString: url, options: `-c search_path=${schema}` }, { schema });
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
