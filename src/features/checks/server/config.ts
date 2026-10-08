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
