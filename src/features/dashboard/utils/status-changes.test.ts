// @vitest-environment node
import type { ServiceHealthSummary } from "../types/dashboard.types";
import { diffStatuses, statusSnapshot } from "./status-changes";

const svc = (id: string, healthStatus: ServiceHealthSummary["healthStatus"]): ServiceHealthSummary => ({
  id,
  name: `S${id}`,
  healthStatus,
  lastResponseTimeMs: 1,
  lastCheckedAt: null,
  statusChangedAt: null,
  degradedResponseTimeMs: 1000,
  recentLatencies: [],
  uptime: { "24h": null, "7d": null, "30d": null },
  components: null,
});

describe("diffStatuses", () => {
  it("detecta recuperaciones y otros cambios; ignora servicios nuevos y sin estado previo", () => {
    const before = statusSnapshot([svc("1", "caido"), svc("2", "operativo"), svc("3", "degradado"), svc("4", null), svc("5", "operativo")]);
    const changes = diffStatuses(before, [
      svc("1", "operativo"), // recuperado
      svc("2", "caido"), // empeoró
      svc("3", "degradado"), // igual
      svc("4", "operativo"), // primera evaluación
      svc("5", "operativo"), // igual
      svc("6", "caido"), // nuevo
    ]);
    expect([...changes.entries()]).toEqual([
      ["1", { kind: "recovered", name: "S1" }],
      ["2", { kind: "changed", name: "S2" }],
    ]);
  });
});
