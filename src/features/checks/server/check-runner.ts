import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { CheckResult, ManualCheckSummary } from "../types/check.types";
import { evaluateHealthStatus } from "@/features/health-status/server/evaluate";
import type { HealthStatus } from "@/types/health-status.type";
import { performHttpCheck, resolveCheckUrl } from "./http-check";

/** Servicio reclamado para verificar. */
export type DueService = { id: string; name: string; checkUrl: string; timeoutMs: number };

/**
 * Reclama hasta `limit` servicios activos con la verificación vencida y programa la siguiente
 * (`next_check_at = now() + intervalo`) en la misma sentencia. `FOR UPDATE SKIP LOCKED` evita que
 * dos workers verifiquen el mismo servicio a la vez (ADR-004). Los inactivos nunca se reclaman.
 */
export async function claimDueServices(limit: number): Promise<DueService[]> {
  if (limit <= 0) return [];
  const rows = await db.$queryRaw<{ id: string; name: string; check_url: string; timeout_ms: number }[]>`
    WITH due AS (
      SELECT id FROM services
      WHERE is_active AND next_check_at <= now()
      ORDER BY next_check_at
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE services s
    SET next_check_at = now() + make_interval(secs => s.check_interval_seconds)
    FROM due
    WHERE s.id = due.id
    RETURNING s.id, s.name, s.check_url, s.timeout_ms`;
  return rows.map((r) => ({ id: r.id, name: r.name, checkUrl: r.check_url, timeoutMs: r.timeout_ms }));
}

export type RecordedCheck = {
  previousStatus: HealthStatus | null;
  status: HealthStatus | null;
  changed: boolean;
};

/** El servicio se eliminó mientras se verificaba (WI-022): la verificación se descarta. */
export class ServiceDeletedError extends Error {
  constructor(serviceId: string) {
    super(`El servicio ${serviceId} ya no existe; se descartó su verificación.`);
  }
}

/**
 * Guarda el resultado, actualiza el estado de verificación y evalúa el estado de salud del
 * servicio (WI-011) en una sola transacción. Los `skipped` no cuentan como fallo ni cambian la
 * latencia ni el estado (BR-08).
 */
export async function recordCheckResult(
  serviceId: string,
  result: CheckResult,
  checkedAt = new Date(),
): Promise<RecordedCheck> {
  return db.$transaction(async (tx) => {
    // FOR UPDATE: si se elimina en paralelo, la eliminación espera a que termine esta transacción.
    const locked = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM services WHERE id = ${serviceId}::uuid FOR UPDATE`;
    if (locked.length === 0) throw new ServiceDeletedError(serviceId);
    const service = await tx.service.findUniqueOrThrow({
      where: { id: serviceId },
      select: { healthStatus: true, consecutiveFailures: true, degradedResponseTimeMs: true, downAfterFailures: true },
    });
    const { components, ...check } = result;
    await tx.serviceCheck.create({ data: { serviceId, checkedAt, ...check } });

    const consecutiveFailures =
      result.outcome === "failure" ? service.consecutiveFailures + 1 : result.outcome === "success" ? 0 : service.consecutiveFailures;
    const status = evaluateHealthStatus({
      outcome: result.outcome,
      responseTimeMs: result.responseTimeMs,
      consecutiveFailures,
      degradedResponseTimeMs: service.degradedResponseTimeMs,
      downAfterFailures: service.downAfterFailures,
      current: service.healthStatus,
      bodyDegraded: !!result.degradedReason,
    });
    const changed = status !== service.healthStatus;

    await tx.service.update({
      where: { id: serviceId },
      data: {
        lastCheckedAt: checkedAt,
        ...(result.outcome !== "skipped" && {
          lastResponseTimeMs: result.responseTimeMs,
          consecutiveFailures,
          // Último estado de los componentes del /health (WI-021); sin componentes, se limpia.
          lastComponents: components ? (components as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
        }),
        ...(changed && { healthStatus: status, statusChangedAt: checkedAt }),
      },
    });
    // Historial (WI-014, BR-06): una fila por transición; sin cambio, no se registra nada.
    if (changed && status) {
      await tx.serviceStatusChange.create({
        data: { serviceId, fromStatus: service.healthStatus, toStatus: status, changedAt: checkedAt },
      });
    }
    return { previousStatus: service.healthStatus, status, changed };
  });
}

/** Comprueba la conectividad del propio monitor; se memoriza por ciclo. */
export function createCanary(canaryUrl: string | null, fetchImpl?: typeof fetch) {
  let cached: Promise<boolean> | null = null;
  return {
    isMonitorOnline(): Promise<boolean> {
      if (!canaryUrl) return Promise.resolve(true);
      cached ??= performHttpCheck(canaryUrl, 5000, fetchImpl).then((r) => r.outcome === "success");
      return cached;
    },
    reset() {
      cached = null;
    },
  };
}

/** Verifica un servicio y registra el resultado. Un fallo con el monitor sin conexión se guarda como `skipped`. */
export async function runServiceCheck(
  service: DueService,
  canary: ReturnType<typeof createCanary>,
  fetchImpl?: typeof fetch,
  localhostAlias: string | null = null,
): Promise<CheckResult> {
  let result = await performHttpCheck(resolveCheckUrl(service.checkUrl, localhostAlias), service.timeoutMs, fetchImpl);
  if (result.outcome === "failure" && !(await canary.isMonitorOnline())) {
    result = {
      outcome: "skipped",
      httpStatus: null,
      responseTimeMs: null,
      errorMessage: "Verificación omitida: el monitor no tiene conectividad (falló MONITOR_CANARY_URL).",
    };
  }
  await recordCheckResult(service.id, result);
  return result;
}

/** Borra transiciones de estado más antiguas que la retención, por lotes (ADR-005). */
export async function purgeOldStatusChanges(retentionDays: number, batchSize = 5000): Promise<number> {
  let total = 0;
  for (;;) {
    const deleted = await db.$executeRaw`
      DELETE FROM service_status_changes
      WHERE id IN (
        SELECT id FROM service_status_changes
        WHERE changed_at < now() - make_interval(days => ${retentionDays})
        LIMIT ${batchSize}
      )`;
    total += deleted;
    if (deleted < batchSize) return total;
  }
}

/** Borra resultados más antiguos que la retención, por lotes (ADR-005). Devuelve las filas borradas. */
export async function purgeOldChecks(retentionDays: number, batchSize = 5000): Promise<number> {
  let total = 0;
  for (;;) {
    const deleted = await db.$executeRaw`
      DELETE FROM service_checks
      WHERE id IN (
        SELECT id FROM service_checks
        WHERE checked_at < now() - make_interval(days => ${retentionDays})
        LIMIT ${batchSize}
      )`;
    total += deleted;
    if (deleted < batchSize) return total;
  }
}

/** Segundos mínimos entre verificaciones manuales del mismo servicio: evita repetirlas con varios clics. */
export const MANUAL_CHECK_COOLDOWN_SECONDS = 15;

/**
 * Verifica ahora todos los servicios activos (modo `manual`, sin worker). Corre con concurrencia
 * limitada y registra cada resultado igual que el worker; también aplica la retención, que en este
 * modo no tiene otro momento para ejecutarse.
 */
export async function checkAllServices(options: {
  concurrency: number;
  canaryUrl: string | null;
  checkResultsRetentionDays: number;
  statusHistoryRetentionDays: number;
}): Promise<ManualCheckSummary> {
  const active = await db.service.findMany({
    where: { isActive: true },
    select: { id: true, name: true, checkUrl: true, timeoutMs: true, lastCheckedAt: true },
    orderBy: { name: "asc" },
  });
  const cutoff = Date.now() - MANUAL_CHECK_COOLDOWN_SECONDS * 1000;
  const due = active.filter((s) => !s.lastCheckedAt || s.lastCheckedAt.getTime() < cutoff);
  const summary: ManualCheckSummary = { total: due.length, success: 0, failure: 0, skipped: 0, recent: active.length - due.length };

  const canary = createCanary(options.canaryUrl);
  const queue = [...due];
  const runNext = async (): Promise<void> => {
    for (let service = queue.shift(); service; service = queue.shift()) {
      try {
        const result = await runServiceCheck(service, canary);
        summary[result.outcome] += 1;
      } catch (err) {
        if (!(err instanceof ServiceDeletedError)) throw err;
        summary.total -= 1;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(options.concurrency, due.length) }, runNext));

  await purgeOldChecks(options.checkResultsRetentionDays);
  await purgeOldStatusChanges(options.statusHistoryRetentionDays);
  return summary;
}
