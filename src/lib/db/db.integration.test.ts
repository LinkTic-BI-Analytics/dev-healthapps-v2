import { db } from "@/lib/db";
import { resolveSchema } from "@/lib/db/config";

afterAll(async () => {
  await db.$disconnect();
});

describe("conexión a PostgreSQL", () => {
  it("se conecta y usa el esquema definido en DB_SCHEMA", async () => {
    const [row] = await db.$queryRaw<{ schema: string | null }[]>`SELECT current_schema() AS schema`;
    expect(row.schema).toBe(resolveSchema());
  });
});
