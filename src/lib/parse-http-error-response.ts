import { isApiError, type ApiError } from "@/types/api-error.type";

/** Mensajes por código cuando la respuesta no trae un mensaje útil (p. ej. HTML de un proxy). */
const FALLBACK_MESSAGES: Record<number, string> = {
  400: "La solicitud no es válida. Revisa los datos e intenta de nuevo.",
  401: "Tu sesión no es válida o expiró. Inicia sesión de nuevo.",
  403: "No tienes permiso para realizar esta acción.",
  404: "No se encontró el recurso solicitado.",
  409: "La operación entra en conflicto con datos existentes.",
  413: "El contenido enviado es demasiado grande. Reduce su tamaño e intenta de nuevo.",
  429: "Demasiadas solicitudes. Espera un momento e intenta de nuevo.",
  500: "Ocurrió un error en el servidor. Intenta de nuevo en unos minutos.",
  502: "El servidor no está disponible en este momento. Intenta de nuevo en unos minutos.",
  503: "El servicio no está disponible en este momento. Intenta de nuevo en unos minutos.",
  504: "El servidor tardó demasiado en responder. Intenta de nuevo.",
};

function fallbackMessage(status: number): string {
  return FALLBACK_MESSAGES[status] ?? (status >= 500 ? FALLBACK_MESSAGES[500] : "No se pudo completar la solicitud.");
}

/**
 * Convierte cualquier respuesta fallida en `ApiError`: JSON con el formato del API,
 * JSON con otro formato, texto plano o HTML (p. ej. un 413 de nginx).
 */
export async function parseHttpErrorResponse(res: Response): Promise<ApiError> {
  const statusCode = res.status;
  const error = res.statusText || "Error";
  let body = "";
  try {
    body = await res.text();
  } catch {
    // Cuerpo ilegible: se usa el mensaje genérico del código.
  }

  if (body) {
    try {
      const json: unknown = JSON.parse(body);
      if (isApiError(json)) return json;
      if (typeof json === "object" && json !== null) {
        const message = (json as Record<string, unknown>).message;
        if (typeof message === "string" || (Array.isArray(message) && message.every((m) => typeof m === "string"))) {
          return { message, error, statusCode };
        }
      }
    } catch {
      // No es JSON: se decide abajo si el texto sirve como mensaje.
    }

    const looksLikeHtml = /^\s*</.test(body);
    if (!looksLikeHtml && body.length <= 300) return { message: body.trim(), error, statusCode };
  }

  return { message: fallbackMessage(statusCode), error, statusCode };
}
