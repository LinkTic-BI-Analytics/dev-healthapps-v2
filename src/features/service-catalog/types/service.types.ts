/** Servicio monitoreado tal como lo entrega el API (fechas en ISO 8601). */
export type MonitoredService = {
  id: string;
  name: string;
  description: string | null;
  checkUrl: string;
  isActive: boolean;
  /** Parámetros esperados (BR-05). */
  degradedResponseTimeMs: number;
  downAfterFailures: number;
  checkIntervalSeconds: number;
  timeoutMs: number;
  createdAt: string;
  updatedAt: string;
};

/** Payload del formulario de servicio. */
export type ServiceFormPayload = {
  name: string;
  description: string;
  checkUrl: string;
  /** Texto del input; se convierte a número al validar. */
  degradedResponseTimeMs: string;
  downAfterFailures: string;
  checkIntervalSeconds: string;
  timeoutMs: string;
};

export type CreateServiceDto = {
  name: string;
  description: string | null;
  checkUrl: string;
  /** Si no se envían, se usan los valores por defecto (DEFAULT_THRESHOLDS). */
  degradedResponseTimeMs?: number;
  downAfterFailures?: number;
  checkIntervalSeconds?: number;
  timeoutMs?: number;
};
export type UpdateServiceDto = Partial<CreateServiceDto> & { isActive?: boolean };
