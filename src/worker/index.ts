/**
 * Worker de verificaciones (ADR-004). Proceso aparte del servidor web:
 *   pnpm worker       (producción / Docker)
 *   pnpm worker:dev   (desarrollo, se reinicia al cambiar el código)
 * Reclama los servicios vencidos, los verifica con concurrencia limitada y purga resultados viejos.
 */
import "dotenv/config";
import {
  ServiceDeletedError,
  claimDueServices,
  createCanary,
  purgeOldChecks,
  purgeOldStatusChanges,
  runServiceCheck,
} from "@/features/checks/server/check-runner";
import { getWorkerConfig } from "@/features/checks/server/config";
import { db } from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;
const config = getWorkerConfig();
const canary = createCanary(config.canaryUrl);
const inFlight = new Set<Promise<void>>();
let stopping = false;
let lastPurgeAt = 0;

const log = (...args: unknown[]) => console.log(new Date().toISOString(), "[worker]", ...args);

async function tick(): Promise<void> {
  canary.reset();
  const capacity = config.concurrency - inFlight.size;
  if (capacity <= 0) return;

  const due = await claimDueServices(capacity);
  for (const service of due) {
    // Cada verificación corre de forma independiente: una lenta no bloquea a las demás.
    const job: Promise<void> = runServiceCheck(service, canary, undefined, config.localhostAlias)
      .then((r) =>
        log(`${service.name}: ${r.outcome}`, r.httpStatus ?? "", r.responseTimeMs ?? "", r.errorMessage ?? r.degradedReason ?? ""),
      )
      .catch((err) =>
        err instanceof ServiceDeletedError
          ? log(`${service.name}: eliminado durante la verificación; resultado descartado`)
          : log(`${service.name}: error al registrar la verificación`, err),
      )
      .finally(() => inFlight.delete(job));
    inFlight.add(job);
  }
}

async function purgeIfDue(): Promise<void> {
  if (Date.now() - lastPurgeAt < DAY_MS) return;
  lastPurgeAt = Date.now();
  const deleted = await purgeOldChecks(config.checkResultsRetentionDays);
  if (deleted > 0) log(`purga: ${deleted} resultados con más de ${config.checkResultsRetentionDays} días eliminados`);
  const changes = await purgeOldStatusChanges(config.statusHistoryRetentionDays);
  if (changes > 0) log(`purga: ${changes} cambios de estado con más de ${config.statusHistoryRetentionDays} días eliminados`);
}

async function main(): Promise<void> {
  log(
    `iniciado (tick ${config.tickSeconds}s, concurrencia ${config.concurrency}, canary ${config.canaryUrl ?? "no"}` +
      `${config.localhostAlias ? `, localhost → ${config.localhostAlias}` : ""})`,
  );
  while (!stopping) {
    try {
      await purgeIfDue();
      await tick();
    } catch (err) {
      // La base puede no estar lista aún (p. ej. migraciones en curso): se reintenta en el siguiente ciclo.
      log("error en el ciclo:", err instanceof Error ? err.message : err);
    }
    await new Promise((r) => setTimeout(r, config.tickSeconds * 1000));
  }
}

async function shutdown(signal: string): Promise<void> {
  if (stopping) return;
  stopping = true;
  log(`${signal} recibido: esperando ${inFlight.size} verificaciones en curso…`);
  await Promise.allSettled([...inFlight]);
  await db.$disconnect();
  log("detenido");
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

void main();
