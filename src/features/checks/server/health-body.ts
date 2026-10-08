// Lógica pura (sin Prisma ni "server-only"): analiza el JSON de un /health sin configuración.

export type ComponentStatus = "up" | "warn" | "down";

/** Componente interno reportado por un /health (base de datos, caché, dependencia…). */
export type HealthComponent = {
  /** Contenedor donde se encontró (p. ej. "databases"); null = raíz. */
  group: string | null;
  name: string;
  status: ComponentStatus;
  /** Valor original reportado (p. ej. "UP", "down", "pass"). */
  rawStatus: string;
  /** Motivo que reporta el propio componente (`message`, `error`, `description`…), si lo hay. */
  message?: string;
};

export type HealthBodyAnalysis = {
  /** Estado general (campo de estado de la raíz); null si no hay. */
  overall: ComponentStatus | null;
  overallRaw: string | null;
  components: HealthComponent[];
};

const DOWN = new Set(["down", "fail", "failed", "failure", "error", "critical", "ko", "unhealthy", "offline", "unavailable", "red", "false"]);
const WARN = new Set(["warn", "warning", "degraded", "partial", "yellow"]);
const UP = new Set(["up", "ok", "pass", "passed", "healthy", "online", "available", "green", "true"]);

const STATUS_KEYS = ["status", "state", "health"];
const BOOLEAN_KEYS = ["healthy", "ok", "up"];
const ID_KEYS = ["connection", "name", "componentName", "componentId", "component", "service", "id", "key"];
const MAX_DEPTH = 6;
const MAX_COMPONENTS = 200;

function classify(value: unknown): ComponentStatus | null {
  if (typeof value === "boolean") return value ? "up" : "down";
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (DOWN.has(v)) return "down";
  if (WARN.has(v)) return "warn";
  if (UP.has(v)) return "up";
  return null;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Estado propio de un objeto: `status`/`state`/`health` (texto) o `healthy`/`ok`/`up` (booleano). */
function ownStatus(obj: Record<string, unknown>): { status: ComponentStatus; raw: string } | null {
  for (const key of STATUS_KEYS) {
    const value = obj[key];
    // `health` puede ser un objeto con su propio status (p. ej. { health: { status: "UP" } }).
    if (isObject(value)) {
      const nested = ownStatus(value);
      if (nested) return nested;
    }
    const status = typeof value === "string" ? classify(value) : null;
    if (status) return { status, raw: String(value) };
  }
  for (const key of BOOLEAN_KEYS) {
    if (typeof obj[key] === "boolean") return { status: obj[key] ? "up" : "down", raw: `${key}: ${obj[key]}` };
  }
  return null;
}

const MESSAGE_KEYS = ["message", "error", "reason", "description", "output"];

function messageOf(obj: Record<string, unknown>): string | undefined {
  for (const key of MESSAGE_KEYS) {
    const v = obj[key];
    if (typeof v === "string" && v.trim()) return v.trim().slice(0, 300);
  }
  return undefined;
}

function identifier(obj: Record<string, unknown>): string | null {
  for (const key of ID_KEYS) {
    const v = obj[key];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return null;
}

const SEVERITY: Record<ComponentStatus, number> = { up: 0, warn: 1, down: 2 };

/**
 * Analiza el JSON de un /health con estructura desconocida.
 * - Estado general: el campo de estado de la raíz.
 * - Componentes: cada objeto anidado con su propio campo de estado.
 * Compatible con NestJS Terminus (solo se recorre `details` si existe junto a `info`/`error`),
 * Spring Boot Actuator (`components`) y `application/health+json` (`checks`).
 */
export function analyzeHealthBody(json: unknown): HealthBodyAnalysis {
  if (!isObject(json)) return { overall: null, overallRaw: null, components: [] };
  const root = ownStatus(json);
  const found = new Map<string, HealthComponent>();

  const push = (c: HealthComponent) => {
    const key = `${c.group ?? ""}/${c.name}`;
    const existing = found.get(key);
    if (found.size >= MAX_COMPONENTS && !existing) return;
    if (!existing || SEVERITY[c.status] > SEVERITY[existing.status]) found.set(key, c);
  };

  const walk = (obj: Record<string, unknown>, group: string | null, depth: number) => {
    if (depth > MAX_DEPTH) return;
    for (const [key, value] of Object.entries(obj)) {
      if (STATUS_KEYS.includes(key) || BOOLEAN_KEYS.includes(key)) continue;
      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (!isObject(item)) return;
          const name = identifier(item) ?? `${key} ${i + 1}`;
          const st = ownStatus(item);
          if (st) push({ group: key, name, status: st.status, rawStatus: st.raw, message: messageOf(item) });
          walk(item, name, depth + 1);
        });
      } else if (isObject(value)) {
        const st = ownStatus(value);
        if (st) {
          push({ group, name: identifier(value) ?? key, status: st.status, rawStatus: st.raw, message: messageOf(value) });
          walk(value, key, depth + 1);
        } else {
          walk(value, key, depth + 1);
        }
      }
    }
  };

  // NestJS Terminus repite los componentes en `info`/`error` y en `details`: basta con `details`.
  if (isObject(json.details) && ("info" in json || "error" in json)) walk(json.details, null, 1);
  else walk(json, null, 1);

  return { overall: root?.status ?? null, overallRaw: root?.raw ?? null, components: [...found.values()] };
}

/** "1 de 17 componentes con falla: seizure" (o null si todo está bien). */
export function describeComponentIssues(components: HealthComponent[]): string | null {
  const failing = components.filter((c) => c.status !== "up");
  if (failing.length === 0) return null;
  const names = failing.slice(0, 3).map((c) => c.name);
  const more = failing.length > 3 ? ` y ${failing.length - 3} más` : "";
  const noun = components.length === 1 ? "componente" : "componentes";
  return `${failing.length} de ${components.length} ${noun} con falla: ${names.join(", ")}${more}`;
}
