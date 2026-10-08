import { apiFetch } from "@/lib/api-fetch";
import type { CreateServiceDto, MonitoredService, UpdateServiceDto } from "../types/service.types";

const base = "/api/services";

export const ServiceCatalogService = {
  getAll: async (): Promise<MonitoredService[]> => (await apiFetch<{ services: MonitoredService[] }>(base)).services,
  getById: async (id: string): Promise<MonitoredService> =>
    (await apiFetch<{ service: MonitoredService }>(`${base}/${id}`)).service,
  create: async (dto: CreateServiceDto): Promise<MonitoredService> =>
    (await apiFetch<{ service: MonitoredService }>(base, { method: "POST", json: dto })).service,
  update: async (id: string, dto: UpdateServiceDto): Promise<MonitoredService> =>
    (await apiFetch<{ service: MonitoredService }>(`${base}/${id}`, { method: "PATCH", json: dto })).service,
  remove: (id: string): Promise<void> => apiFetch<void>(`${base}/${id}`, { method: "DELETE" }),
};
