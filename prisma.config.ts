import "dotenv/config";
import { defineConfig } from "prisma/config";
import { getDatabaseConfig } from "./src/lib/db/config";

// La URL se compone a partir de DB_* (o DATABASE_URL si está definida) con ?schema=DB_SCHEMA.
// Puede no existir durante `prisma generate`, que no necesita conexión.
const database = getDatabaseConfig();

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
