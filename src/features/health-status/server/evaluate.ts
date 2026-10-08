// Lógica pura (sin Prisma ni "server-only"): se prueba de forma aislada.
import type { CheckOutcome } from "@/features/checks/types/check.types";
import type { HealthStatus } from "@/types/health-status.type";

export type EvaluationInput = {
  outcome: CheckOutcome;
  responseTimeMs: number | null;
  /** Fallos consecutivos ya contando esta verificación. */
  consecutiveFailures: number;
  degradedResponseTimeMs: number;
  downAfterFailures: number;
  /** Estado actual; null si el servicio nunca se ha evaluado. */
  current: HealthStatus | null;
  /** El /health reportó componentes con falla o estado en advertencia con HTTP OK (WI-021). */
  bodyDegraded?: boolean;
};

/**
 * Calcula el estado de salud tras una verificación (BR-01, BR-05, BR-08):
 * - `skipped` (falla del monitor): no cambia el estado.
 * - fallo: `caido` al alcanzar `downAfterFailures` fallos seguidos; antes, `degradado`.
 * - éxito: `degradado` si el tiempo de respuesta supera el umbral o el /health reporta componentes
 *   con falla (WI-021); si no, `operativo`.
 */
export function evaluateHealthStatus(input: EvaluationInput): HealthStatus | null {
  if (input.outcome === "skipped") return input.current;
  if (input.outcome === "failure") {
    return input.consecutiveFailures >= input.downAfterFailures ? "caido" : "degradado";
  }
  if (input.bodyDegraded) return "degradado";
  if (input.responseTimeMs !== null && input.responseTimeMs > input.degradedResponseTimeMs) return "degradado";
  return "operativo";
}
