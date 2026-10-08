// Lógica pura (sin Prisma): se prueba de forma aislada.
import type { HealthStatus } from "@/types/health-status.type";

export type UptimePeriod = "24h" | "7d" | "30d";
export const UPTIME_PERIODS: Record<UptimePeriod, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export type Transition = { toStatus: HealthStatus; changedAt: Date };
export type Interval = { start: number; end: number };

/** Une intervalos solapados (entrada en cualquier orden). */
export function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].filter((i) => i.end > i.start).sort((a, b) => a.start - b.start);
  const out: Interval[] = [];
  for (const i of sorted) {
    const last = out[out.length - 1];
    if (last && i.start <= last.end) last.end = Math.max(last.end, i.end);
    else out.push({ ...i });
  }
  return out;
}

function overlap(a: Interval, b: Interval): number {
  return Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
}

/**
 * Uptime del período (BR-07): porcentaje del tiempo **observado** en estado `operativo`.
 * - El estado de cada tramo se reconstruye con las transiciones (incluida la última anterior al período).
 * - Se excluye el tiempo sin datos (antes de la primera evaluación) y los intervalos `excluded`
 *   (verificaciones omitidas por falla del monitor, BR-08).
 * Devuelve `null` si no hay tiempo observado.
 */
export function computeUptime(input: {
  transitions: Transition[];
  periodStart: number;
  periodEnd: number;
  excluded?: Interval[];
}): number | null {
  const transitions = [...input.transitions].sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime());
  const excluded = mergeIntervals(input.excluded ?? []);
  let observed = 0;
  let operational = 0;

  transitions.forEach((t, i) => {
    const segment = {
      start: Math.max(t.changedAt.getTime(), input.periodStart),
      end: Math.min(i + 1 < transitions.length ? transitions[i + 1].changedAt.getTime() : input.periodEnd, input.periodEnd),
    };
    if (segment.end <= segment.start) return;
    const length = segment.end - segment.start - excluded.reduce((sum, e) => sum + overlap(segment, e), 0);
    observed += length;
    if (t.toStatus === "operativo") operational += length;
  });

  return observed > 0 ? (operational / observed) * 100 : null;
}
