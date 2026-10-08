// @vitest-environment node
import { computeUptime, mergeIntervals } from "./uptime";

const H = 60 * 60 * 1000;
const end = Date.UTC(2026, 9, 5, 12);
const start = end - 24 * H;
const at = (hoursAgo: number) => new Date(end - hoursAgo * H);

describe("computeUptime", () => {
  it("1 h caído en 24 h ≈ 95,8 %", () => {
    const uptime = computeUptime({
      periodStart: start,
      periodEnd: end,
      transitions: [
        { toStatus: "operativo", changedAt: at(48) }, // estado previo al período
        { toStatus: "caido", changedAt: at(10) },
        { toStatus: "operativo", changedAt: at(9) },
      ],
    });
    expect(uptime).toBeCloseTo(95.833, 2);
  });

  it("degradado no cuenta como operativo (BR-07: tiempo en estado operativo)", () => {
    const uptime = computeUptime({
      periodStart: start,
      periodEnd: end,
      transitions: [
        { toStatus: "operativo", changedAt: at(30) },
        { toStatus: "degradado", changedAt: at(6) },
      ],
    });
    expect(uptime).toBeCloseTo(75, 5);
  });

  it("excluye el tiempo sin datos antes de la primera evaluación", () => {
    const uptime = computeUptime({
      periodStart: start,
      periodEnd: end,
      transitions: [
        { toStatus: "operativo", changedAt: at(4) },
        { toStatus: "caido", changedAt: at(1) },
      ],
    });
    expect(uptime).toBeCloseTo(75, 5); // 3 h de 4 h observadas
  });

  it("excluye los intervalos sin verificación por falla del monitor", () => {
    const uptime = computeUptime({
      periodStart: start,
      periodEnd: end,
      transitions: [
        { toStatus: "operativo", changedAt: at(48) },
        { toStatus: "caido", changedAt: at(2) },
      ],
      // El monitor no pudo verificar durante 1 de las 2 horas "caídas".
      excluded: [{ start: end - 2 * H, end: end - 1 * H }],
    });
    expect(uptime).toBeCloseTo((22 / 23) * 100, 5);
  });

  it("devuelve null sin datos en el período", () => {
    expect(computeUptime({ periodStart: start, periodEnd: end, transitions: [] })).toBeNull();
  });
});

describe("mergeIntervals", () => {
  it("une intervalos solapados", () => {
    expect(mergeIntervals([{ start: 5, end: 8 }, { start: 0, end: 3 }, { start: 2, end: 6 }])).toEqual([{ start: 0, end: 8 }]);
  });
});
