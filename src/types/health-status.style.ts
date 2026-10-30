import type { HealthStatus } from "./health-status.type";

/** Clases de color por estado (tokens semánticos; funcionan en ambos temas). */
export const STATUS_TEXT: Record<HealthStatus | "none", string> = {
  operativo: "text-status-ok",
  degradado: "text-status-warn",
  caido: "text-status-down",
  none: "text-muted-foreground",
};

export const STATUS_BG: Record<HealthStatus | "none", string> = {
  operativo: "bg-status-ok",
  degradado: "bg-status-warn",
  caido: "bg-status-down",
  none: "bg-muted-foreground",
};

export const STATUS_TINT: Record<HealthStatus | "none", string> = {
  operativo: "bg-status-ok-tint border-status-ok-tint",
  degradado: "bg-status-warn-tint border-status-warn-tint",
  caido: "bg-status-down-tint border-status-down-tint",
  none: "bg-muted border-border",
};
