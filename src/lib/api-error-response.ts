import type { ApiError } from "@/types/api-error.type";
import { HttpError } from "./http-error";

/** Respuesta JSON con el formato `ApiError` para los Route Handlers. */
export function apiErrorResponse(statusCode: number, message: string | string[], error?: string): Response {
  const body: ApiError = { statusCode, message, error: error ?? new HttpError(statusCode, message).error };
  return Response.json(body, { status: statusCode });
}

/**
 * Traduce cualquier error lanzado en un Route Handler a una respuesta `ApiError`.
 * Los errores no controlados se registran y se responden como 500 sin detalles internos.
 */
export function toApiErrorResponse(err: unknown): Response {
  if (err instanceof HttpError) return apiErrorResponse(err.statusCode, err.messages, err.error);
  console.error("[api] Error no controlado:", err);
  return apiErrorResponse(500, "Ocurrió un error inesperado en el servidor. Intenta de nuevo en unos minutos.");
}
