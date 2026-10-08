import { cn } from "@/lib/utils";
import { HEALTH_STATUS_LABEL, type HealthStatus } from "@/types/health-status.type";

const STYLES: Record<HealthStatus | "none", string> = {
  operativo: "bg-status-ok-tint text-status-ok",
  degradado: "bg-status-warn-tint text-status-warn",
  caido: "bg-status-down-tint text-status-down",
  none: "bg-muted text-muted-foreground",
};

/**
 * Pastilla de estado: comunica el estado con color **y** texto (accesibilidad).
 * `null` = el servicio aún no tiene verificaciones ("Sin datos").
 */
export default function StatusBadge({ status, className }: { status: HealthStatus | null; className?: string }) {
  return (
    <span
      data-status={status ?? "none"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        STYLES[status ?? "none"],
        className,
      )}
    >
      <span aria-hidden className="size-2 rounded-full bg-current" />
      {status ? HEALTH_STATUS_LABEL[status] : "Sin datos"}
    </span>
  );
}
