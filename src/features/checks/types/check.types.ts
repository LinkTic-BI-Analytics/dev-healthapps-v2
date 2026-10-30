import type { HealthComponent } from "../server/health-body";

export type CheckOutcome = "success" | "failure" | "skipped";

/** Resultado de una verificación HTTP. */
export type CheckResult = {
  outcome: CheckOutcome;
  httpStatus: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
  /** Problema reportado en el cuerpo con HTTP OK (componentes o estado en advertencia): degrada (WI-021). */
  degradedReason?: string | null;
  /** Componentes reportados en el JSON del /health; null si el cuerpo no los trae (WI-021). */
  components?: HealthComponent[] | null;
  /** Extracto del cuerpo (máx. 2 KB), solo en verificaciones con problema (WI-021). */
  bodyExcerpt?: string | null;
};

/** Verificación tal como la entrega el API (fechas en ISO 8601). */
export type ServiceCheckDto = Omit<CheckResult, "components"> & { id: string; checkedAt: string };

/** Resumen de una verificación manual de todos los servicios (modo `manual`). */
export type ManualCheckSummary = {
  total: number;
  success: number;
  failure: number;
  skipped: number;
  /** Servicios omitidos porque se verificaron hace muy poco. */
  recent: number;
};
