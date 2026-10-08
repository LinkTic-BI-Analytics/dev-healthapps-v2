// @vitest-environment node
import { performHttpCheck } from "./http-check";

const ok = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () => new Response("ok", { status: 200 }));

describe("performHttpCheck", () => {
  it("2xx = éxito con tiempo de respuesta", async () => {
    const r = await performHttpCheck("https://x/health", 1000, ok);
    expect(r).toMatchObject({ outcome: "success", httpStatus: 200, errorMessage: null });
    expect(r.responseTimeMs).toBeGreaterThanOrEqual(0);
    expect(ok.mock.calls[0][1]).toMatchObject({ method: "GET", headers: expect.objectContaining({ "user-agent": "HealthApps-Monitor/1.0" }) });
  });

  it("4xx/5xx = fallo con el código", async () => {
    const r = await performHttpCheck("https://x", 1000, async () => new Response("", { status: 503 }));
    expect(r).toMatchObject({ outcome: "failure", httpStatus: 503, errorMessage: "Respondió HTTP 503." });
  });

  it("timeout = fallo con mensaje claro", async () => {
    const hang = (_: string, init: RequestInit) =>
      new Promise<Response>((_, reject) => init.signal?.addEventListener("abort", () => reject(new Error("aborted"))));
    const r = await performHttpCheck("https://x", 50, hang);
    expect(r).toMatchObject({ outcome: "failure", httpStatus: null, errorMessage: "Sin respuesta en 50 ms (tiempo de espera agotado)." });
  });

  it("traduce errores de red comunes", async () => {
    const refused = async () => {
      throw Object.assign(new TypeError("fetch failed"), { cause: { code: "ECONNREFUSED" } });
    };
    expect((await performHttpCheck("https://x", 1000, refused)).errorMessage).toMatch(/Conexión rechazada/);
  });
});

describe("performHttpCheck con cuerpo JSON (WI-021)", () => {
  const json = (body: unknown, status = 200) => async () =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const reporter = (dbStatus: string) => ({
    status: "ok",
    databases: [
      { connection: "default", status: "up" },
      { connection: "seizure", status: dbStatus },
    ],
    cache: { status: "up" },
  });

  it("200 con todo up: éxito sin degradación y con componentes", async () => {
    const r = await performHttpCheck("https://x", 1000, json(reporter("up")));
    expect(r).toMatchObject({ outcome: "success", degradedReason: null, bodyExcerpt: null });
    expect(r.components).toHaveLength(3);
  });

  it("200 con una base down: éxito degradado con motivo y extracto", async () => {
    const r = await performHttpCheck("https://x", 1000, json(reporter("down")));
    expect(r).toMatchObject({ outcome: "success", degradedReason: "1 de 3 componentes con falla: seizure" });
    expect(r.bodyExcerpt).toContain('"seizure"');
  });

  it("200 con status general en falla: fallo", async () => {
    const r = await performHttpCheck("https://x", 1000, json({ status: "DOWN" }));
    expect(r).toMatchObject({ outcome: "failure", errorMessage: 'El servicio reporta status "DOWN".' });
  });

  it("503 con cuerpo de Terminus: el motivo incluye los componentes con falla", async () => {
    const body = { status: "error", info: {}, error: { redis: { status: "down" } }, details: { redis: { status: "down" } } };
    const r = await performHttpCheck("https://x", 1000, json(body, 503));
    expect(r.errorMessage).toBe("Respondió HTTP 503. 1 de 1 componente con falla: redis.");
  });

  it("cuerpo de texto: solo cuenta el HTTP", async () => {
    const r = await performHttpCheck("https://x", 1000, async () => new Response("OK", { status: 200 }));
    expect(r).toMatchObject({ outcome: "success", components: null, degradedReason: null });
  });

  it("no lee más de 256 KB del cuerpo", async () => {
    const big = `{"status":"ok","pad":"${"x".repeat(400 * 1024)}"}`;
    const r = await performHttpCheck("https://x", 1000, async () => new Response(big, { status: 200 }));
    // El JSON truncado no se puede interpretar: se evalúa solo por HTTP.
    expect(r).toMatchObject({ outcome: "success", components: null });
  });
});

describe("resolveCheckUrl", () => {
  it("traduce localhost y 127.0.0.1 al alias, conservando puerto y ruta", async () => {
    const { resolveCheckUrl } = await import("./http-check");
    expect(resolveCheckUrl("http://localhost:3004/health", "host.docker.internal")).toBe("http://host.docker.internal:3004/health");
    expect(resolveCheckUrl("http://127.0.0.1:8080/x?y=1", "host.docker.internal")).toBe("http://host.docker.internal:8080/x?y=1");
    expect(resolveCheckUrl("https://api.ejemplo.com/health", "host.docker.internal")).toBe("https://api.ejemplo.com/health");
    expect(resolveCheckUrl("http://localhost:3004/health", null)).toBe("http://localhost:3004/health");
  });
});
