// @vitest-environment node
import { evaluateHealthStatus, type EvaluationInput } from "./evaluate";

const base: EvaluationInput = {
  outcome: "success",
  responseTimeMs: 200,
  consecutiveFailures: 0,
  degradedResponseTimeMs: 1000,
  downAfterFailures: 3,
  current: null,
};

describe("evaluateHealthStatus", () => {
  it.each<[string, Partial<EvaluationInput>, string | null]>([
    ["responde bien y dentro del umbral → operativo", {}, "operativo"],
    ["justo en el umbral → operativo", { responseTimeMs: 1000 }, "operativo"],
    ["responde fuera del umbral → degradado", { responseTimeMs: 1001 }, "degradado"],
    ["primer fallo (bajo el umbral de fallos) → degradado", { outcome: "failure", consecutiveFailures: 1, responseTimeMs: null }, "degradado"],
    ["N fallos seguidos → caido", { outcome: "failure", consecutiveFailures: 3, responseTimeMs: null }, "caido"],
    ["más de N fallos → sigue caido", { outcome: "failure", consecutiveFailures: 7, responseTimeMs: null }, "caido"],
    ["recuperación tras caída → operativo", { current: "caido" }, "operativo"],
    ["skipped no cambia el estado (BR-08)", { outcome: "skipped", current: "operativo", responseTimeMs: null }, "operativo"],
    ["skipped nunca marca caido aunque haya fallos previos", { outcome: "skipped", current: "degradado", consecutiveFailures: 5 }, "degradado"],
    ["skipped sin evaluación previa → sin estado", { outcome: "skipped", responseTimeMs: null }, null],
    ["éxito con componentes con falla en el /health → degradado (WI-021)", { bodyDegraded: true }, "degradado"],
  ])("%s", (_, input, expected) => {
    expect(evaluateHealthStatus({ ...base, ...input })).toBe(expected);
  });
});
