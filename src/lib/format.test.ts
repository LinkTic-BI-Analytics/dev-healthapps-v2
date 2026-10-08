import { formatLatency, formatRelativeTime } from "@/lib/format";

describe("formatLatency", () => {
  it("muestra milisegundos por debajo de un segundo", () => {
    expect(formatLatency(840)).toBe("840 ms");
  });

  it("muestra segundos con un decimal y coma decimal", () => {
    expect(formatLatency(1200)).toBe("1,2 s");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-10-05T12:00:00Z");
  it.each([
    ["2026-10-05T11:59:50Z", "hace 10 segundos"],
    ["2026-10-05T11:57:00Z", "hace 3 minutos"],
    ["2026-10-05T10:00:00Z", "hace 2 horas"],
    ["2026-10-04T12:00:00Z", "ayer"],
  ])("%s → %s", (date, expected) => {
    expect(formatRelativeTime(date, now)).toBe(expected);
  });
});
