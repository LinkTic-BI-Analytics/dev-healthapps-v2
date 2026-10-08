import { db } from "@/lib/db";
import { getUptimeForServices } from "./uptime.service";

const run = Date.now().toString(36);
const H = 60 * 60 * 1000;
const now = new Date();
const ago = (h: number) => new Date(now.getTime() - h * H);

afterAll(async () => {
  await db.service.deleteMany({ where: { name: { endsWith: run } } });
  await db.$disconnect();
});

describe("getUptimeForServices", () => {
  it("calcula 24 h / 7 d / 30 d con el historial, incluida la transición anterior a la ventana", async () => {
    const s = await db.service.create({ data: { name: `Uptime ${run}`, checkUrl: "https://x" } });
    await db.serviceStatusChange.createMany({
      data: [
        { serviceId: s.id, toStatus: "operativo", changedAt: ago(40 * 24) }, // antes de la ventana de 30 d
        { serviceId: s.id, toStatus: "caido", changedAt: ago(10) },
        { serviceId: s.id, toStatus: "operativo", changedAt: ago(9) },
      ],
    });
    const uptime = (await getUptimeForServices([s.id], now)).get(s.id)!;
    expect(uptime["24h"]).toBeCloseTo((23 / 24) * 100, 2); // ≈ 95,83 %
    expect(uptime["7d"]).toBeCloseTo((167 / 168) * 100, 2);
    expect(uptime["30d"]).toBeCloseTo((719 / 720) * 100, 2);
  });

  it("excluye los intervalos de verificaciones omitidas por falla del monitor", async () => {
    const s = await db.service.create({ data: { name: `Skipped ${run}`, checkUrl: "https://x", checkIntervalSeconds: 3600 } });
    await db.serviceStatusChange.createMany({
      data: [
        { serviceId: s.id, toStatus: "operativo", changedAt: ago(48) },
        { serviceId: s.id, toStatus: "caido", changedAt: ago(2) },
      ],
    });
    await db.serviceCheck.create({ data: { serviceId: s.id, checkedAt: ago(2), outcome: "skipped" } });
    const uptime = (await getUptimeForServices([s.id], now)).get(s.id)!;
    expect(uptime["24h"]).toBeCloseTo((22 / 23) * 100, 2);
  });

  it("devuelve null sin historial", async () => {
    const s = await db.service.create({ data: { name: `Vacio ${run}`, checkUrl: "https://x" } });
    expect((await getUptimeForServices([s.id], now)).get(s.id)).toEqual({ "24h": null, "7d": null, "30d": null });
  });
});
