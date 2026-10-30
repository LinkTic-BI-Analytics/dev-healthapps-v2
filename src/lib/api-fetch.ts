import type { ApiError } from "@/types/api-error.type";
import { parseHttpErrorResponse } from "./parse-http-error-response";

type ApiFetchInit = Omit<RequestInit, "body"> & {
  /** Cuerpo que se envía como JSON (agrega `Content-Type: application/json`). */
  json?: unknown;
  body?: BodyInit | null;
  /** Si es `false`, un 401 no intenta renovar la sesión (lo usan los propios endpoints de auth). */
  retryOnUnauthorized?: boolean;
};

type SessionHandlers = {
  /** Intenta renovar la sesión; devuelve `true` si lo logró. */
  refresh: () => Promise<boolean>;
  /** Se llama cuando la sesión no se pudo renovar (p. ej. para ir a /login). */
  onSessionExpired: () => void;
};

let sessionHandlers: SessionHandlers | null = null;
let refreshInFlight: Promise<boolean> | null = null;

/** Lo registra el proveedor de autenticación del cliente. */
export function configureApiSession(handlers: SessionHandlers | null): void {
  sessionHandlers = handlers;
}

/** Varias peticiones con 401 simultáneas comparten una sola renovación. */
function refreshOnce(handlers: SessionHandlers): Promise<boolean> {
  refreshInFlight ??= handlers.refresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function send(input: string, init: ApiFetchInit): Promise<Response> {
  const { json, headers, ...rest } = init;
  delete rest.retryOnUnauthorized;
  const finalHeaders = new Headers(headers);
  if (json !== undefined) finalHeaders.set("Content-Type", "application/json");
  if (!finalHeaders.has("Accept")) finalHeaders.set("Accept", "application/json");
  try {
    return await fetch(input, {
      credentials: "same-origin",
      ...rest,
      headers: finalHeaders,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw {
      message: "No se pudo conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.",
      error: "NetworkError",
      statusCode: 0,
    } satisfies ApiError;
  }
}

/**
 * `fetch` contra el API propio (`/api/...`). Envía las cookies de sesión, lanza `ApiError`
 * si la respuesta falla o si el servidor no responde, y devuelve el JSON tipado.
 * Ante un 401 renueva la sesión una vez y reintenta; si no puede, avisa que la sesión expiró.
 */
export async function apiFetch<T>(input: string, init: ApiFetchInit = {}): Promise<T> {
  let res = await send(input, init);

  if (res.status === 401 && init.retryOnUnauthorized !== false && sessionHandlers) {
    const handlers = sessionHandlers;
    if (await refreshOnce(handlers)) {
      res = await send(input, init);
    }
    if (res.status === 401) handlers.onSessionExpired();
  }

  if (!res.ok) throw await parseHttpErrorResponse(res);
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
