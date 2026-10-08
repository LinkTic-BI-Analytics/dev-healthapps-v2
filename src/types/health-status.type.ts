/** Estado de salud de un servicio monitoreado (BR-01: siempre exactamente uno). */
export type HealthStatus = "operativo" | "degradado" | "caido";

export const HEALTH_STATUS_LABEL: Record<HealthStatus, string> = {
  operativo: "Operativo",
  degradado: "Degradado",
  caido: "Caído",
};
