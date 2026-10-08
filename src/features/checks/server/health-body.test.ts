// @vitest-environment node
import { analyzeHealthBody, describeComponentIssues } from "./health-body";

/** JSON real de https://reporter-api.fidu.linktic.co/health (2026-10-05). */
const DBS = [
  "default", "accounts_payable", "bank_reconciliation", "billing_collections", "budget", "commission_settlement",
  "derivative_contracting", "fic", "fiduciary_transactions", "fixed_assets", "portal_payment", "rdsfiduprevisora",
  "seizure", "tax_related", "tax_service", "users",
];
const reporter = (down: string[] = []) => ({
  status: "ok",
  uptime: 362138,
  timestamp: "2026-10-05T20:02:57.781Z",
  databases: DBS.map((connection) => ({ connection, status: down.includes(connection) ? "down" : "up" })),
  cache: { status: "up" },
  queries: { inFlight: 0, waiting: 0 },
});

describe("analyzeHealthBody", () => {
  it("reporter-api todo up: estado ok y 17 componentes (16 bases + caché)", () => {
    const a = analyzeHealthBody(reporter());
    expect(a.overall).toBe("up");
    expect(a.components).toHaveLength(17);
    expect(a.components.filter((c) => c.group === "databases")).toHaveLength(16);
    expect(a.components.find((c) => c.name === "cache")).toMatchObject({ group: null, status: "up" });
    expect(describeComponentIssues(a.components)).toBeNull();
  });

  it("reporter-api con una base caída: componente down con su nombre", () => {
    const a = analyzeHealthBody(reporter(["seizure"]));
    expect(a.overall).toBe("up");
    expect(a.components.find((c) => c.name === "seizure")).toMatchObject({ group: "databases", status: "down" });
    expect(describeComponentIssues(a.components)).toBe("1 de 17 componentes con falla: seizure");
  });

  it("NestJS Terminus: lee `details` sin duplicar `info`/`error`", () => {
    const a = analyzeHealthBody({
      status: "error",
      info: { database: { status: "up" } },
      error: { redis: { status: "down", message: "timeout" } },
      details: { database: { status: "up" }, redis: { status: "down", message: "timeout" } },
    });
    expect(a.overall).toBe("down");
    expect(a.components.map((c) => `${c.name}:${c.status}`).sort()).toEqual(["database:up", "redis:down"]);
  });

  it("Spring Boot Actuator: estados en mayúsculas y componentes anidados", () => {
    const a = analyzeHealthBody({
      status: "UP",
      components: {
        db: { status: "UP", details: { database: "PostgreSQL" } },
        diskSpace: { status: "OUT_OF_SERVICE" },
        mail: { status: "DOWN" },
      },
    });
    expect(a.overall).toBe("up");
    expect(a.components.find((c) => c.name === "mail")).toMatchObject({ status: "down", rawStatus: "DOWN" });
    // Valor no reconocido: se ignora (no hay falsos positivos).
    expect(a.components.find((c) => c.name === "diskSpace")).toBeUndefined();
  });

  it("application/health+json: pass / warn / fail", () => {
    const a = analyzeHealthBody({
      status: "warn",
      checks: { "cassandra:responseTime": [{ componentId: "dfd6cf2b", status: "warn" }], "uptime": [{ status: "pass" }] },
    });
    expect(a.overall).toBe("warn");
    expect(a.components.find((c) => c.name === "dfd6cf2b")).toMatchObject({ status: "warn" });
  });

  it("booleanos healthy/ok y objetos health anidados", () => {
    expect(analyzeHealthBody({ healthy: false }).overall).toBe("down");
    expect(analyzeHealthBody({ health: { status: "UP" } }).overall).toBe("up");
    expect(analyzeHealthBody({ ok: true, deps: { api: { ok: false } } }).components[0]).toMatchObject({ name: "api", status: "down" });
  });

  it("sin campos de estado o sin JSON: nada que evaluar", () => {
    expect(analyzeHealthBody({ uptime: 1, version: "1.2" })).toEqual({ overall: null, overallRaw: null, components: [] });
    expect(analyzeHealthBody("OK")).toEqual({ overall: null, overallRaw: null, components: [] });
    expect(analyzeHealthBody([1, 2])).toEqual({ overall: null, overallRaw: null, components: [] });
  });

  it("resume varias fallas", () => {
    const a = analyzeHealthBody(reporter(["fic", "budget", "users", "seizure"]));
    expect(describeComponentIssues(a.components)).toBe("4 de 17 componentes con falla: budget, fic, seizure y 1 más");
  });
});

describe("mensaje de los componentes", () => {
  it("captura el motivo que reporta cada componente (NestJS Terminus real del equipo)", () => {
    const a = analyzeHealthBody({
      status: "error",
      info: {},
      error: {
        db_main: { message: "No se pudo conectar a la base de datos (ECONNREFUSED)", responseTime: 1, status: "down" },
        cache: { status: "down" },
      },
      details: {
        db_main: { message: "No se pudo conectar a la base de datos (ECONNREFUSED)", responseTime: 1, status: "down" },
        cache: { status: "down" },
      },
    });
    expect(a.overall).toBe("down");
    expect(a.components).toEqual([
      { group: null, name: "db_main", status: "down", rawStatus: "down", message: "No se pudo conectar a la base de datos (ECONNREFUSED)" },
      { group: null, name: "cache", status: "down", rawStatus: "down", message: undefined },
    ]);
  });
});
