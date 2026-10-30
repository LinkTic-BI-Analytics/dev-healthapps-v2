import { db } from "@/lib/db";
import { recordCheckResult } from "@/features/checks/server/check-runner";
import { getDashboard } from "./dashboard.service";

const run = Date.now().toString(36);
const ok = (ms: number) => ({ outcome: "success" as const, httpStatus: 200, responseTimeMs: ms, errorMessage: null });
const fail = { outcome: "failure" as const, httpStatus: 503, responseTimeMs: 20, errorMessage: "Respondió HTTP 503." };

afterAll(async () => {
  await db.service.deleteMany({ where: { name: { endsWith: run } } });
  await db.$disconnect();
});

describe("getDashboard", () => {
  it("incluye solo servicios activos, cuenta por estado, ordena por gravedad y trae latencias recientes", async () => {
    const mk = (name: string, extra = {}) =>
      db.service.create({ data: { name: `${name} ${run}`, checkUrl: "https://x", downAfterFailures: 1, ...extra } });
    const up = await mk("Arriba");
    const down = await mk("Caido");
    const fresh = await mk("Nuevo");
    await mk("Inactivo", { isActive: false });

    await recordCheckResult(up.id, ok(100));
    await recordCheckResult(up.id, ok(140));
    await recordCheckResult(down.id, fail);

    const dash = await getDashboard();
    const ours = dash.services.filter((s) => s.name.endsWith(run));
    expect(ours.map((s) => s.name)).toEqual([`Caido ${run}`, `Nuevo ${run}`, `Arriba ${run}`]);
    expect(ours.find((s) => s.id === up.id)).toMatchObject({ healthStatus: "operativo", lastResponseTimeMs: 140, recentLatencies: [100, 140] });
    expect(ours.find((s) => s.id === down.id)?.healthStatus).toBe("caido");
    expect(ours.find((s) => s.id === fresh.id)?.healthStatus).toBeNull();
    expect(dash.counts.caido).toBeGreaterThanOrEqual(1);
    expect(dash.counts.sinDatos).toBeGreaterThanOrEqual(1);
  });
});
