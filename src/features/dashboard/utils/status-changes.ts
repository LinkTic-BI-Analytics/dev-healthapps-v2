import type { HealthStatus } from "@/types/health-status.type";
import type { ServiceHealthSummary } from "../types/dashboard.types";

export type StatusChangeKind = "recovered" | "changed";
export type StatusChange = { kind: StatusChangeKind; name: string };

/**
 * Servicios cuyo estado cambió entre dos actualizaciones del panel.
 * `recovered`: pasó a operativo desde degradado o caído. `changed`: cualquier otro cambio.
 * Los servicios nuevos o sin estado previo no cuentan como cambio.
 */
export function diffStatuses(
  previous: Map<string, HealthStatus | null>,
  next: ServiceHealthSummary[],
): Map<string, StatusChange> {
  const changes = new Map<string, StatusChange>();
  for (const s of next) {
    if (!previous.has(s.id)) continue;
    const before = previous.get(s.id) ?? null;
    if (before === null || s.healthStatus === null || before === s.healthStatus) continue;
    changes.set(s.id, { kind: s.healthStatus === "operativo" ? "recovered" : "changed", name: s.name });
  }
  return changes;
}

export function statusSnapshot(services: ServiceHealthSummary[]): Map<string, HealthStatus | null> {
  return new Map(services.map((s) => [s.id, s.healthStatus]));
}
