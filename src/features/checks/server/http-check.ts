// Sin "server-only" ni Prisma: lógica pura, probada de forma aislada y usada por el worker.
import type { CheckResult } from "../types/check.types";
import { analyzeHealthBody, describeComponentIssues } from "./health-body";

/** Máximo que se lee del cuerpo de un /health. */
export const MAX_BODY_BYTES = 256 * 1024;
/** Máximo que se guarda del cuerpo en una verificación con problema. */
export const MAX_EXCERPT_CHARS = 2048;

export const USER_AGENT = "HealthApps-Monitor/1.0";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Traduce `localhost` / `127.0.0.1` al alias configurado. Dentro de un contenedor, `localhost` es el
 * propio contenedor; el servicio del equipo anfitrión se alcanza con `host.docker.internal`.
 */
export function resolveCheckUrl(url: string, localhostAlias: string | null): string {
  if (!localhostAlias) return url;
  try {
    const parsed = new URL(url);
    if (!LOCAL_HOSTS.has(parsed.hostname)) return url;
    parsed.hostname = localhostAlias;
    return parsed.toString();
  } catch {
    return url;
  }
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

/** Mensajes accionables para los errores de red más comunes (código de `cause`). */
const NETWORK_ERRORS: Record<string, string> = {
  ENOTFOUND: "No se pudo resolver el nombre del host (DNS).",
  EAI_AGAIN: "No se pudo resolver el nombre del host (DNS temporalmente no disponible).",
  ECONNREFUSED: "Conexión rechazada: el servicio no está escuchando en esa dirección.",
  ECONNRESET: "El servicio cerró la conexión inesperadamente.",
  EHOSTUNREACH: "No hay ruta hacia el host.",
  ETIMEDOUT: "La conexión expiró antes de establecerse.",
  CERT_HAS_EXPIRED: "El certificado TLS del servicio está vencido.",
  DEPTH_ZERO_SELF_SIGNED_CERT: "El certificado TLS del servicio es autofirmado.",
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: "No se pudo verificar el certificado TLS del servicio.",
};

function describeNetworkError(err: unknown): string {
  const cause = (err as { cause?: { code?: string; message?: string } })?.cause;
  if (cause?.code && NETWORK_ERRORS[cause.code]) return NETWORK_ERRORS[cause.code];
  const message = cause?.message ?? (err as Error)?.message ?? "Error desconocido";
  return `No se pudo conectar con el servicio: ${message}`;
}

/** Lee hasta `limit` bytes del cuerpo y descarta el resto (un /health no debería ser grande). */
async function readBodyLimited(res: Response, limit = MAX_BODY_BYTES): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
    if (size >= limit) {
      await reader.cancel().catch(() => {});
      break;
    }
  }
  const all = new Uint8Array(Math.min(size, limit));
  let offset = 0;
  for (const c of chunks) {
    const part = c.subarray(0, Math.max(0, all.length - offset));
    all.set(part, offset);
    offset += part.length;
  }
  return new TextDecoder().decode(all);
}

function parseJson(text: string, contentType: string | null): unknown {
  const looksJson = /json/i.test(contentType ?? "") || /^\s*[{[]/.test(text);
  if (!looksJson) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

const excerpt = (text: string) => (text ? text.slice(0, MAX_EXCERPT_CHARS) : null);

/**
 * Hace un GET a la URL de verificación y analiza el JSON del cuerpo si lo hay (WI-021).
 * - Fallo: 4xx/5xx, timeout, error de red o estado general en falla en el JSON.
 * - Éxito con `degradedReason`: estado general en advertencia o componentes con falla.
 * - Éxito: 2xx/3xx sin problemas reportados.
 * El tiempo de respuesta se mide hasta recibir las cabeceras.
 */
export async function performHttpCheck(
  url: string,
  timeoutMs: number,
  fetchImpl: FetchLike = fetch,
): Promise<CheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = performance.now();
  try {
    const res = await fetchImpl(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT, accept: "*/*" },
    });
    const responseTimeMs = Math.round(performance.now() - start);
    const text = await readBodyLimited(res);
    const json = parseJson(text, res.headers.get("content-type"));
    const analysis = json === undefined ? null : analyzeHealthBody(json);
    const components = analysis && analysis.components.length > 0 ? analysis.components : null;
    const issues = components ? describeComponentIssues(components) : null;

    if (res.status >= 400) {
      return {
        outcome: "failure",
        httpStatus: res.status,
        responseTimeMs,
        errorMessage: `Respondió HTTP ${res.status}.${issues ? ` ${issues}.` : ""}`,
        components,
        bodyExcerpt: excerpt(text),
      };
    }
    if (analysis?.overall === "down") {
      return {
        outcome: "failure",
        httpStatus: res.status,
        responseTimeMs,
        errorMessage: `El servicio reporta status "${analysis.overallRaw}".${issues ? ` ${issues}.` : ""}`,
        components,
        bodyExcerpt: excerpt(text),
      };
    }
    const degradedReason =
      issues ?? (analysis?.overall === "warn" ? `El servicio reporta status "${analysis.overallRaw}".` : null);
    return {
      outcome: "success",
      httpStatus: res.status,
      responseTimeMs,
      errorMessage: null,
      degradedReason,
      components,
      bodyExcerpt: degradedReason ? excerpt(text) : null,
    };
  } catch (err) {
    if (controller.signal.aborted) {
      return {
        outcome: "failure",
        httpStatus: null,
        responseTimeMs: null,
        errorMessage: `Sin respuesta en ${timeoutMs} ms (tiempo de espera agotado).`,
      };
    }
    return { outcome: "failure", httpStatus: null, responseTimeMs: null, errorMessage: describeNetworkError(err) };
  } finally {
    clearTimeout(timer);
  }
}
