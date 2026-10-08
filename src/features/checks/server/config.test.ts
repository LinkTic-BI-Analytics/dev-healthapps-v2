// @vitest-environment node
import { getWorkerConfig } from "./config";

describe("getWorkerConfig", () => {
  it("usa valores por defecto", () => {
    expect(getWorkerConfig({})).toEqual({ tickSeconds: 5, concurrency: 10, canaryUrl: null, checkResultsRetentionDays: 30, statusHistoryRetentionDays: 365, localhostAlias: null });
  });

  it("valida los valores", () => {
    expect(() => getWorkerConfig({ CHECK_CONCURRENCY: "0" })).toThrow(/mayor o igual a 1/);
    expect(() => getWorkerConfig({ MONITOR_CANARY_URL: "ftp://x" })).toThrow(/http/);
  });
});
