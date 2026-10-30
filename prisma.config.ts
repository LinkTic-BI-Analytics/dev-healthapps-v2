import "dotenv/config";
import { defineConfig } from "prisma/config";
import { getDatabaseConfig, isLocalDatabase } from "./src/lib/db/config";

// La URL se compone a partir de DB_* (o DATABASE_URL si está definida) con ?schema=app_health.
// Puede no existir durante `prisma generate`, que no necesita conexión.
const database = getDatabaseConfig();

// Contra una base compartida (Supabase) solo se permite `prisma migrate deploy`: `migrate dev` crea
// una base sombra en el servidor, `migrate reset` borra el esquema, `db push` puede borrar datos y
// `db execute` corre SQL arbitrario que podría tocar otros esquemas.
const DESTRUCTIVE_COMMANDS = [
  ["migrate", "dev"],
  ["migrate", "reset"],
  ["db", "push"],
  ["db", "execute"],
];
const args = process.argv.slice(2);
const destructive = DESTRUCTIVE_COMMANDS.find(([cmd, sub]) => args.includes(cmd) && args.includes(sub));
if (destructive && database && !isLocalDatabase(database.url)) {
  throw new Error(
    `\`prisma ${destructive.join(" ")}\` está bloqueado contra una base remota (${new URL(database.url).hostname}). ` +
      "Crea las migraciones contra la base local y aplícalas en el entorno con `pnpm db:deploy`.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: database?.url,
  },
});
