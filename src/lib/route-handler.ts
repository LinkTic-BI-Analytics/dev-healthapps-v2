import type { z } from "zod";
import { toApiErrorResponse } from "./api-error-response";
import { HttpError } from "./http-error";

/** Envuelve un Route Handler: cualquier error se responde con el formato `ApiError`. */
export function handleRoute<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      return toApiErrorResponse(err);
    }
  };
}

/** Lee el cuerpo JSON y lo valida; los problemas de validación se responden como 400. */
export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
  messagesOf: (error: z.ZodError) => string[],
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, "El cuerpo de la solicitud debe ser JSON válido.");
  }
  const result = schema.safeParse(body);
  if (!result.success) throw new HttpError(400, messagesOf(result.error));
  return result.data;
}
