import "server-only";
import { db } from "@/lib/db";
import type { HealthStatus } from "@/types/health-status.type";
import { computeUptime, UPTIME_PERIODS, type Interval, type Transition, type UptimePeriod } from "./uptime";

export type UptimeByPeriod = Record<UptimePeriod, number | null>;

const LONGEST = UPTIME_PERIODS["30d"];

/**
 * Uptime de 24 h, 7 días y 30 días por servicio, a partir del historial de estados (ADR-005).
 * Usa tres consultas en total, sin importar cuántos servicios se pidan.
 */
export async function getUptimeForServices(serviceIds: string[], now = new Date()): Promise<Map<string, UptimeByPeriod>> {
  const result = new Map<string, UptimeByPeriod>();
  if (serviceIds.length === 0) return result;
  const since = new Date(now.getTime() - LONGEST);

  const [recent, previous, skipped] = await Promise.all([
    db.serviceStatusChange.findMany({
      where: { serviceId: { in: serviceIds }, changedAt: { gte: since, lte: now } },
      select: { serviceId: true, toStatus: true, changedAt: true },
    }),
    // Estado vigente al inicio de la ventana: la última transición anterior a ella.
    db.$queryRaw<{ service_id: string; to_status: HealthStatus; changed_at: Date }[]>`
      SELECT DISTINCT ON (service_id) service_id, to_status, changed_at
      FROM service_status_changes
      WHERE service_id = ANY(${serviceIds}::uuid[]) AND changed_at < ${since}
      ORDER BY service_id, changed_at DESC`,
    // Intervalos sin verificación por falla del monitor (BR-08): se excluyen del cálculo.
    db.$queryRaw<{ service_id: string; checked_at: Date; check_interval_seconds: number }[]>`
      SELECT c.service_id, c.checked_at, s.check_interval_seconds
      FROM service_checks c JOIN services s ON s.id = c.service_id
      WHERE c.service_id = ANY(${serviceIds}::uuid[]) AND c.outcome = 'skipped' AND c.checked_at >= ${since}`,
  ]);

  const transitions = new Map<string, Transition[]>();
  const add = (id: string, t: Transition) => transitions.set(id, [...(transitions.get(id) ?? []), t]);
  for (const p of previous) add(p.service_id, { toStatus: p.to_status, changedAt: p.changed_at });
  for (const r of recent) add(r.serviceId, { toStatus: r.toStatus, changedAt: r.changedAt });

  const excluded = new Map<string, Interval[]>();
  for (const s of skipped) {
    const start = s.checked_at.getTime();
    excluded.set(s.service_id, [...(excluded.get(s.service_id) ?? []), { start, end: start + s.check_interval_seconds * 1000 }]);
  }

  for (const id of serviceIds) {
    const periods = {} as UptimeByPeriod;
    for (const [period, ms] of Object.entries(UPTIME_PERIODS) as [UptimePeriod, number][]) {
      periods[period] = computeUptime({
        transitions: transitions.get(id) ?? [],
        periodStart: now.getTime() - ms,
        periodEnd: now.getTime(),
        excluded: excluded.get(id),
      });
    }
    result.set(id, periods);
  }
  return result;
}
