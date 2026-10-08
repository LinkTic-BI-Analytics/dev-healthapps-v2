/**
 * Error estándar del API. `message` puede ser un arreglo cuando hay varios
 * mensajes de validación (un mensaje por campo).
 */
export type ApiError = {
  message: string | string[];
  error: string;
  statusCode: number;
};

export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const validMessage =
    typeof v.message === "string" || (Array.isArray(v.message) && v.message.every((m) => typeof m === "string"));
  return validMessage && typeof v.error === "string" && typeof v.statusCode === "number";
}

/** Devuelve siempre un arreglo de mensajes, venga `message` como string o como arreglo. */
export function getErrorMessages(error: ApiError): string[] {
  const messages = Array.isArray(error.message) ? error.message : [error.message];
  return messages.filter((m) => m.trim().length > 0);
}
