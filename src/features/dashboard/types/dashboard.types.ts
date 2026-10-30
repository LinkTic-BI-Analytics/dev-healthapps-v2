import type { HealthStatus } from "@/types/health-status.type";

/** Uptime (%) por período; null sin datos. */
export type UptimeSummary = { "24h": number | null; "7d": number | null; "30d": number | null };

/** Estado de un servicio en el panel. `healthStatus` es null hasta la primera verificación. */
export type ServiceHealthSummary = {
  id: string;
  name: string;
  healthStatus: HealthStatus | null;
  lastResponseTimeMs: number | null;
  lastCheckedAt: string | null;
  statusChangedAt: string | null;
  degradedResponseTimeMs: number;
  /** Latencias recientes (más antigua primero) para la mini gráfica; null = fallo sin respuesta. */
  recentLatencies: (number | null)[];
  uptime: UptimeSummary;
  /** Componentes del /health (WI-021): total y resumen de fallas; null si el /health no los reporta. */
  components: { total: number; issue: string | null } | null;
};

export type StatusCounts = Record<HealthStatus, number> & { sinDatos: number };

export type DashboardData = {
  generatedAt: string;
  counts: StatusCounts;
  services: ServiceHealthSummary[];
};
