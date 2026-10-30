import type { HealthComponent } from "@/features/checks/server/health-body";
import type { ServiceCheckDto } from "@/features/checks/types/check.types";
import type { MonitoredService } from "@/features/service-catalog/types/service.types";
import type { UptimeSummary } from "@/features/dashboard/types/dashboard.types";
import type { HealthStatus } from "@/types/health-status.type";

export type DetailRange = "1h" | "24h";

export type ServiceDetail = MonitoredService & {
  healthStatus: HealthStatus | null;
  statusChangedAt: string | null;
  lastCheckedAt: string | null;
  lastResponseTimeMs: number | null;
  consecutiveFailures: number;
  /** Último estado de los componentes del /health (WI-021); null si no los reporta. */
  components: HealthComponent[] | null;
};

export type StatusChangeDto = {
  id: string;
  fromStatus: HealthStatus | null;
  toStatus: HealthStatus;
  changedAt: string;
};

export type ServiceDetailData = {
  generatedAt: string;
  range: DetailRange;
  service: ServiceDetail;
  /** Verificaciones del rango, de la más antigua a la más reciente. */
  checks: ServiceCheckDto[];
  /** Historial de cambios de estado, el más reciente primero. */
  statusChanges: StatusChangeDto[];
  /** Uptime de 24 h, 7 días y 30 días (WI-015). */
  uptime: UptimeSummary;
};
