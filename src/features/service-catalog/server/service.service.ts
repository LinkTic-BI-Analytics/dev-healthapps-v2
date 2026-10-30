import "server-only";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import type { CreateServiceDto, MonitoredService, UpdateServiceDto } from "../types/service.types";

type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  checkUrl: string;
  isActive: boolean;
  degradedResponseTimeMs: number;
  downAfterFailures: number;
  checkIntervalSeconds: number;
  timeoutMs: number;
  createdAt: Date;
  updatedAt: Date;
};

export function toMonitoredService(row: ServiceRow): MonitoredService {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    checkUrl: row.checkUrl,
    isActive: row.isActive,
    degradedResponseTimeMs: row.degradedResponseTimeMs,
    downAfterFailures: row.downAfterFailures,
    checkIntervalSeconds: row.checkIntervalSeconds,
    timeoutMs: row.timeoutMs,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Los nombres duplicados se responden como 409 con un mensaje claro. */
function rethrowDuplicate(err: unknown): never {
  if (typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002") {
    throw new HttpError(409, "Ya existe un servicio con ese nombre.");
  }
  throw err;
}

export async function listServices(): Promise<MonitoredService[]> {
  const rows = await db.service.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }] });
  return rows.map(toMonitoredService);
}

export async function getService(id: string): Promise<MonitoredService> {
  const row = await db.service.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, "El servicio no existe.");
  return toMonitoredService(row);
}

export async function createService(data: CreateServiceDto, createdById: string): Promise<MonitoredService> {
  try {
    return toMonitoredService(await db.service.create({ data: { ...data, createdById } }));
  } catch (err) {
    rethrowDuplicate(err);
  }
}

/**
 * Elimina el servicio. Sus verificaciones y su historial de estados se borran en cascada
 * (FK con ON DELETE CASCADE). No se puede deshacer.
 */
export async function deleteService(id: string): Promise<void> {
  const { count } = await db.service.deleteMany({ where: { id } });
  if (count === 0) throw new HttpError(404, "El servicio no existe.");
}

export async function updateService(id: string, data: UpdateServiceDto): Promise<MonitoredService> {
  await getService(id);
  try {
    return toMonitoredService(await db.service.update({ where: { id }, data }));
  } catch (err) {
    rethrowDuplicate(err);
  }
}
