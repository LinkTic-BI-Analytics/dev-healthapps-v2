import { recordCheckResult } from "@/features/checks/server/check-runner";
import { db } from "@/lib/db";
import { getServiceDetail } from "./service-detail.service";

const run = Date.now().toString(36);
afterAll(async () => {
  await db.service.deleteMany({ where: { name: { endsWith: run } } });
  await db.$disconnect();
});

describe("getServiceDetail", () => {
  it("devuelve el estado y las verificaciones del rango en orden cronológico", async () => {
    const s = await db.service.create({ data: { name: `Detalle ${run}`, checkUrl: "https://x", degradedResponseTimeMs: 500 } });
    await recordCheckResult(s.id, { outcome: "success", httpStatus: 200, responseTimeMs: 900, errorMessage: null }, new Date(Date.now() - 3 * 60 * 60 * 1000));
    await recordCheckResult(s.id, { outcome: "success", httpStatus: 200, responseTimeMs: 100, errorMessage: null }, new Date(Date.now() - 60_000));
    await recordCheckResult(s.id, { outcome: "success", httpStatus: 200, responseTimeMs: 800, errorMessage: null });

    const hour = await getServiceDetail(s.id, "1h");
    expect(hour.checks.map((c) => c.responseTimeMs)).toEqual([100, 800]);
    expect(hour.service).toMatchObject({ healthStatus: "degradado", lastResponseTimeMs: 800, degradedResponseTimeMs: 500 });
    expect((await getServiceDetail(s.id, "24h")).checks).toHaveLength(3);
  });

  it("responde 404 si el servicio no existe", async () => {
    await expect(getServiceDetail("00000000-0000-4000-8000-000000000000", "1h")).rejects.toMatchObject({ statusCode: 404 });
  });
});
