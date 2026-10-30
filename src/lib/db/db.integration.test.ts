import { db } from "@/lib/db";
import { APP_SCHEMA } from "@/lib/db/config";

afterAll(async () => {
  await db.$disconnect();
});

describe("conexión a PostgreSQL", () => {
  it("se conecta y usa el esquema app_health", async () => {
    const [row] = await db.$queryRaw<{ schema: string | null }[]>`SELECT current_schema() AS schema`;
    expect(row.schema).toBe(APP_SCHEMA);
  });
});
