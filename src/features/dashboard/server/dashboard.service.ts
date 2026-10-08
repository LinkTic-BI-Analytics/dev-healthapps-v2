import "server-only";
import { describeComponentIssues, type HealthComponent } from "@/features/checks/server/health-body";
import { getUptimeForServices } from "@/features/uptime/server/uptime.service";
import { db } from "@/lib/db";
import type { HealthStatus } from "@/types/health-status.type";
import type { DashboardData, ServiceHealthSummary, StatusCounts } from "../types/dashboard.types";

/** Cantidad de verificaciones recientes que alimentan la mini gráfica de cada tarjeta. */
const SPARKLINE_POINTS = 20;

/** Orden del panel: lo que requiere atención primero. */
const ORDER: Record<HealthStatus | "sinDatos", number> = { caido: 0, degradado: 1, sinDatos: 2, operativo: 3 };

/** Estado de todos los servicios activos, con conteos globales y latencias recientes. */
export async function getDashboard(): Promise<DashboardData> {
  const services = await db.service.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      healthStatus: true,
      lastResponseTimeMs: true,
      lastCheckedAt: true,
      statusChangedAt: true,
      degradedResponseTimeMs: true,
      lastComponents: true,
    },
  });

  // Últimas N verificaciones por servicio en una sola consulta (índice service_id, checked_at DESC).
  const recent = await db.$queryRaw<{ service_id: string; response_time_ms: number | null }[]>`
    SELECT service_id, response_time_ms FROM (
      SELECT c.service_id, c.response_time_ms, c.checked_at,
             row_number() OVER (PARTITION BY c.service_id ORDER BY c.checked_at DESC) AS rn
      FROM service_checks c
      JOIN services s ON s.id = c.service_id AND s.is_active
      WHERE c.outcome <> 'skipped' AND c.checked_at > now() - interval '1 day'
    ) t
    WHERE rn <= ${SPARKLINE_POINTS}
    ORDER BY service_id, checked_at ASC`;
  const latencies = new Map<string, (number | null)[]>();
  for (const r of recent) latencies.set(r.service_id, [...(latencies.get(r.service_id) ?? []), r.response_time_ms]);

  const uptime = await getUptimeForServices(services.map((s) => s.id));
  const empty = { "24h": null, "7d": null, "30d": null };

  const counts: StatusCounts = { operativo: 0, degradado: 0, caido: 0, sinDatos: 0 };
  const summaries: ServiceHealthSummary[] = services.map((s) => {
    counts[s.healthStatus ?? "sinDatos"] += 1;
    return {
      id: s.id,
      name: s.name,
      healthStatus: s.healthStatus,
      lastResponseTimeMs: s.lastResponseTimeMs,
      lastCheckedAt: s.lastCheckedAt?.toISOString() ?? null,
      statusChangedAt: s.statusChangedAt?.toISOString() ?? null,
      degradedResponseTimeMs: s.degradedResponseTimeMs,
      recentLatencies: latencies.get(s.id) ?? [],
      uptime: uptime.get(s.id) ?? empty,
      components: Array.isArray(s.lastComponents)
        ? {
            total: s.lastComponents.length,
            issue: describeComponentIssues(s.lastComponents as unknown as HealthComponent[]),
          }
        : null,
    };
  });
  summaries.sort(
    (a, b) => ORDER[a.healthStatus ?? "sinDatos"] - ORDER[b.healthStatus ?? "sinDatos"] || a.name.localeCompare(b.name, "es"),
  );

  return { generatedAt: new Date().toISOString(), counts, services: summaries };
}
