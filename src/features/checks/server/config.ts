type Env = Record<string, string | undefined>;

export type WorkerConfig = {
  tickSeconds: number;
  concurrency: number;
  /** URL de control: si falla, los fallos se registran como `skipped` (BR-08). */
  canaryUrl: string | null;
  checkResultsRetentionDays: number;
  statusHistoryRetentionDays: number;
  /**
   * Host al que se traduce `localhost` en las URLs de verificación (p. ej. `host.docker.internal`
   * cuando el worker corre en Docker y el servicio en el equipo anfitrión). null = sin traducción.
   */
  localhostAlias: string | null;
};

function int(value: string | undefined, fallback: number, name: string, min: number): number {
  if (value === undefined || value.trim() === "") return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min) throw new Error(`${name} debe ser un entero mayor o igual a ${min}.`);
  return n;
}

export function getWorkerConfig(env: Env = process.env): WorkerConfig {
  const canary = env.MONITOR_CANARY_URL?.trim();
  if (canary && !/^https?:\/\//.test(canary)) throw new Error("MONITOR_CANARY_URL debe empezar por http:// o https://.");
  return {
    tickSeconds: int(env.CHECK_TICK_SECONDS, 5, "CHECK_TICK_SECONDS", 1),
    concurrency: int(env.CHECK_CONCURRENCY, 10, "CHECK_CONCURRENCY", 1),
    canaryUrl: canary || null,
    checkResultsRetentionDays: int(env.CHECK_RESULTS_RETENTION_DAYS, 30, "CHECK_RESULTS_RETENTION_DAYS", 1),
    statusHistoryRetentionDays: int(env.STATUS_HISTORY_RETENTION_DAYS, 365, "STATUS_HISTORY_RETENTION_DAYS", 1),
    localhostAlias: env.CHECK_LOCALHOST_ALIAS?.trim() || null,
  };
}

/**
 * `worker`: un proceso aparte verifica de forma periódica (Docker, contenedores).
 * `manual`: no hay procesos en segundo plano (Vercel, plan gratuito); el usuario lanza las
 * verificaciones con un botón. Por defecto es `manual` en Vercel (`VERCEL=1`) y `worker` en el resto;
 * `CHECKS_MODE` lo fuerza (p. ej. app en Vercel con el worker desplegado en otro host).
 */
export type ChecksMode = "worker" | "manual";

export function getChecksMode(env: Env = process.env): ChecksMode {
  const mode = env.CHECKS_MODE?.trim().toLowerCase();
  if (mode === "worker" || mode === "manual") return mode;
  if (mode) throw new Error(`CHECKS_MODE="${env.CHECKS_MODE}" no es válido. Usa "worker" o "manual".`);
  return env.VERCEL ? "manual" : "worker";
}
