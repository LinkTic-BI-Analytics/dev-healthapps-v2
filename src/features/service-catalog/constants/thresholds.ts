/**
 * Parámetros esperados por defecto de un servicio (BR-05). Supuesto pendiente de confirmar por
 * negocio; los mismos valores son el DEFAULT de las columnas en la base de datos.
 */
export const DEFAULT_THRESHOLDS = {
  /** Por encima de este tiempo de respuesta el servicio se considera degradado. */
  degradedResponseTimeMs: 1000,
  /** Tras esta cantidad de fallos consecutivos el servicio se considera fuera de servicio. */
  downAfterFailures: 3,
  /** Frecuencia de verificación (ADR-004). */
  checkIntervalSeconds: 60,
  /** Tiempo máximo de espera de cada verificación. */
  timeoutMs: 10_000,
} as const;

export const THRESHOLD_LIMITS = {
  degradedResponseTimeMs: { min: 1, max: 120_000 },
  downAfterFailures: { min: 1, max: 100 },
  checkIntervalSeconds: { min: 10, max: 86_400 },
  timeoutMs: { min: 100, max: 60_000 },
} as const;
