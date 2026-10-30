import "server-only";
import { toMonitoredService } from "@/features/service-catalog/server/service.service";
import type { HealthComponent } from "@/features/checks/server/health-body";
import { getUptimeForServices } from "@/features/uptime/server/uptime.service";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import type { DetailRange, ServiceDetailData } from "../types/service-detail.types";

const RANGE_MS: Record<DetailRange, number> = { "1h": 60 * 60 * 1000, "24h": 24 * 60 * 60 * 1000 };
/** Tope de puntos para la gráfica (24 h a 1 verificación/min = 1 440). */
const MAX_CHECKS = 1500;
/** Cambios de estado que se muestran en el detalle. */
const MAX_STATUS_CHANGES = 50;

export async function getServiceDetail(id: string, range: DetailRange): Promise<ServiceDetailData> {
  const service = await db.service.findUnique({ where: { id } });
  if (!service) throw new HttpError(404, "El servicio no existe.");

  const since = new Date(Date.now() - RANGE_MS[range]);
  const checks = await db.serviceCheck.findMany({
    where: { serviceId: id, checkedAt: { gte: since } },
    orderBy: { checkedAt: "desc" },
    take: MAX_CHECKS,
  });

  const statusChanges = await db.serviceStatusChange.findMany({
    where: { serviceId: id },
    orderBy: { changedAt: "desc" },
    take: MAX_STATUS_CHANGES,
  });

  const uptime = (await getUptimeForServices([id])).get(id) ?? { "24h": null, "7d": null, "30d": null };

  return {
    generatedAt: new Date().toISOString(),
    range,
    uptime,
    statusChanges: statusChanges.map((c) => ({
      id: c.id,
      fromStatus: c.fromStatus,
      toStatus: c.toStatus,
      changedAt: c.changedAt.toISOString(),
    })),
    service: {
      ...toMonitoredService(service),
      healthStatus: service.healthStatus,
      statusChangedAt: service.statusChangedAt?.toISOString() ?? null,
      lastCheckedAt: service.lastCheckedAt?.toISOString() ?? null,
      lastResponseTimeMs: service.lastResponseTimeMs,
      consecutiveFailures: service.consecutiveFailures,
      components: Array.isArray(service.lastComponents) ? (service.lastComponents as unknown as HealthComponent[]) : null,
    },
    checks: checks.reverse().map((c) => ({
      id: c.id,
      checkedAt: c.checkedAt.toISOString(),
      outcome: c.outcome,
      httpStatus: c.httpStatus,
      responseTimeMs: c.responseTimeMs,
      errorMessage: c.errorMessage,
      degradedReason: c.degradedReason,
      bodyExcerpt: c.bodyExcerpt,
    })),
  };
}
