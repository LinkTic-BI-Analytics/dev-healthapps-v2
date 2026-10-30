import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { requireDatabaseConfig } from "../src/lib/db/config";
import { seedRolesAndPermissions, seedSuperadmin } from "../src/features/auth/server/seed-auth";

/** `pnpm db:seed`: roles, permisos y el primer superadmin. Se puede ejecutar varias veces. */
async function main() {
  const { url, schema } = requireDatabaseConfig();
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url, options: `-c search_path=${schema}` }, { schema }),
  });
  try {
    await seedRolesAndPermissions(db);
    console.log("✔ Roles y permisos sembrados.");

    const { SEED_SUPERADMIN_EMAIL: email, SEED_SUPERADMIN_USERNAME: username, SEED_SUPERADMIN_PASSWORD: password } =
      process.env;
    if (email && username && password) {
      const { created } = await seedSuperadmin(db, { email, username, password });
      console.log(created ? `✔ Superadmin "${username}" creado.` : "• El superadmin ya existe; no se modificó.");
    } else {
      console.log("• SEED_SUPERADMIN_* no definidas: no se creó el superadmin.");
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
