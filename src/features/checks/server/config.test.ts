// @vitest-environment node
import { getChecksMode, getWorkerConfig } from "./config";

describe("getWorkerConfig", () => {
  it("usa valores por defecto", () => {
    expect(getWorkerConfig({})).toEqual({ tickSeconds: 5, concurrency: 10, canaryUrl: null, checkResultsRetentionDays: 30, statusHistoryRetentionDays: 365, localhostAlias: null });
  });

  it("valida los valores", () => {
    expect(() => getWorkerConfig({ CHECK_CONCURRENCY: "0" })).toThrow(/mayor o igual a 1/);
    expect(() => getWorkerConfig({ MONITOR_CANARY_URL: "ftp://x" })).toThrow(/http/);
  });
});

describe("getChecksMode", () => {
  it("es manual en Vercel y worker en el resto", () => {
    expect(getChecksMode({ VERCEL: "1" })).toBe("manual");
    expect(getChecksMode({})).toBe("worker");
  });

  it("CHECKS_MODE tiene prioridad y se valida", () => {
    expect(getChecksMode({ VERCEL: "1", CHECKS_MODE: "worker" })).toBe("worker");
    expect(getChecksMode({ CHECKS_MODE: "manual" })).toBe("manual");
    expect(() => getChecksMode({ CHECKS_MODE: "cron" })).toThrow(/CHECKS_MODE/);
  });
});
