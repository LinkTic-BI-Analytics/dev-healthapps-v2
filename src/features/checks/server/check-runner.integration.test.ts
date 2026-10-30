import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { db } from "@/lib/db";
import {
  claimDueServices,
  createCanary,
  purgeOldChecks,
  purgeOldStatusChanges,
  recordCheckResult,
  runServiceCheck,
} from "./check-runner";

const run = Date.now().toString(36);
let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    if (req.url === "/ok") return res.writeHead(200).end("ok");
    if (req.url === "/fail") return res.writeHead(503).end("down");
    if (req.url === "/slow") return setTimeout(() => res.writeHead(200).end("slow"), 1500);
    if (req.url === "/reporter-down")
      return res.writeHead(200, { "content-type": "application/json" }).end(
        JSON.stringify({
          status: "ok",
          databases: [
            { connection: "default", status: "up" },
            { connection: "seizure", status: "down" },
          ],
          cache: { status: "up" },
        }),
      );
    res.writeHead(404).end();
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await db.service.deleteMany({ where: { name: { endsWith: run } } });
  server.close();
  await db.$disconnect();
});

/** Deja solo los servicios de esta prueba como vencidos, para no tocar los de otros. */
async function makeService(name: string, path: string, extra: Record<string, unknown> = {}) {
  return db.service.create({
    data: { name: `${name} ${run}`, checkUrl: `${base}${path}`, nextCheckAt: new Date(Date.now() - 1000), ...extra },
  });
}

async function claimOurs(limit = 50) {
  return (await claimDueServices(limit)).filter((s) => s.name.endsWith(run));
}

describe("worker de verificaciones", () => {
  it("reclama solo servicios activos y vencidos, y programa la siguiente verificación", async () => {
    const active = await makeService("activo", "/ok");
    const inactive = await makeService("inactivo", "/ok", { isActive: false });
    const future = await makeService("futuro", "/ok", { nextCheckAt: new Date(Date.now() + 60_000) });

    const claimed = await claimOurs();
    const ids = claimed.map((s) => s.id);
    expect(ids).toContain(active.id);
    expect(ids).not.toContain(inactive.id);
    expect(ids).not.toContain(future.id);

    const after = await db.service.findUniqueOrThrow({ where: { id: active.id } });
    expect(after.nextCheckAt.getTime()).toBeGreaterThan(Date.now() + 55_000);
    expect(await claimOurs()).toHaveLength(0);
  });

  it("dos reclamos simultáneos no devuelven el mismo servicio (SKIP LOCKED)", async () => {
    await Promise.all([1, 2, 3, 4, 5, 6].map((i) => makeService(`par${i}`, "/ok")));
    const [a, b] = await Promise.all([claimOurs(3), claimOurs(3)]);
    const ids = [...a, ...b].map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("registra éxito y fallos, y cuenta los fallos consecutivos", async () => {
    const ok = await makeService("ok", "/ok");
    const fail = await makeService("fail", "/fail");
    const canary = createCanary(null);
    await runServiceCheck({ id: ok.id, name: ok.name, checkUrl: ok.checkUrl, timeoutMs: 2000 }, canary);
    await runServiceCheck({ id: fail.id, name: fail.name, checkUrl: fail.checkUrl, timeoutMs: 2000 }, canary);
    await runServiceCheck({ id: fail.id, name: fail.name, checkUrl: fail.checkUrl, timeoutMs: 2000 }, canary);

    const okRow = await db.service.findUniqueOrThrow({ where: { id: ok.id } });
    expect(okRow).toMatchObject({ consecutiveFailures: 0 });
    expect(okRow.lastCheckedAt).not.toBeNull();
    expect(okRow.lastResponseTimeMs).not.toBeNull();
    expect((await db.service.findUniqueOrThrow({ where: { id: fail.id } })).consecutiveFailures).toBe(2);
    const checks = await db.serviceCheck.findMany({ where: { serviceId: fail.id } });
    expect(checks).toHaveLength(2);
    expect(checks[0]).toMatchObject({ outcome: "failure", httpStatus: 503 });

    await runServiceCheck({ id: fail.id, name: fail.name, checkUrl: `${base}/ok`, timeoutMs: 2000 }, canary);
    expect((await db.service.findUniqueOrThrow({ where: { id: fail.id } })).consecutiveFailures).toBe(0);
  });

  it("una verificación lenta no bloquea a las demás", async () => {
    const slow = await makeService("lento", "/slow");
    const fast = await makeService("rapido", "/ok");
    const canary = createCanary(null);
    const done: string[] = [];
    await Promise.all([
      runServiceCheck({ id: slow.id, name: "lento", checkUrl: slow.checkUrl, timeoutMs: 5000 }, canary).then(() => done.push("lento")),
      runServiceCheck({ id: fast.id, name: "rapido", checkUrl: fast.checkUrl, timeoutMs: 5000 }, canary).then(() => done.push("rapido")),
    ]);
    expect(done).toEqual(["rapido", "lento"]);
  });

  it("timeout se registra como fallo con su motivo", async () => {
    const slow = await makeService("timeout", "/slow");
    const r = await runServiceCheck({ id: slow.id, name: "t", checkUrl: slow.checkUrl, timeoutMs: 200 }, createCanary(null));
    expect(r).toMatchObject({ outcome: "failure", errorMessage: "Sin respuesta en 200 ms (tiempo de espera agotado)." });
  });

  it("si el monitor no tiene conectividad, el fallo se registra como skipped y no cuenta (BR-08)", async () => {
    const fail = await makeService("sin-red", "/fail");
    const offline = createCanary(`${base}/fail`);
    const r = await runServiceCheck({ id: fail.id, name: "x", checkUrl: fail.checkUrl, timeoutMs: 2000 }, offline);
    expect(r.outcome).toBe("skipped");
    expect((await db.service.findUniqueOrThrow({ where: { id: fail.id } })).consecutiveFailures).toBe(0);
  });

  it("purga los resultados más antiguos que la retención", async () => {
    const s = await makeService("purga", "/ok");
    const old = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
    await recordCheckResult(s.id, { outcome: "success", httpStatus: 200, responseTimeMs: 5, errorMessage: null }, old);
    await recordCheckResult(s.id, { outcome: "success", httpStatus: 200, responseTimeMs: 5, errorMessage: null });
    await purgeOldChecks(30);
    const remaining = await db.serviceCheck.findMany({ where: { serviceId: s.id } });
    expect(remaining).toHaveLength(1);
  });
});

describe("evaluación del estado de salud (WI-011)", () => {
  it("recorre operativo → degradado → caído → (skipped) → operativo según los umbrales", async () => {
    const s = await makeService("estados", "/ok", { degradedResponseTimeMs: 500, downAfterFailures: 3 });
    const due = (path: string) => ({ id: s.id, name: s.name, checkUrl: `${base}${path}`, timeoutMs: 5000 });
    const online = createCanary(null);
    const statusOf = async () => (await db.service.findUniqueOrThrow({ where: { id: s.id } })).healthStatus;

    await runServiceCheck(due("/ok"), online);
    expect(await statusOf()).toBe("operativo");

    await runServiceCheck(due("/slow"), online); // ~1500 ms > 500 ms
    expect(await statusOf()).toBe("degradado");

    await runServiceCheck(due("/fail"), online);
    await runServiceCheck(due("/fail"), online);
    expect(await statusOf()).toBe("degradado");
    await runServiceCheck(due("/fail"), online);
    expect(await statusOf()).toBe("caido");

    // Monitor sin conexión: el resultado es skipped y el estado no cambia (BR-08).
    await runServiceCheck(due("/fail"), createCanary(`${base}/fail`));
    expect(await statusOf()).toBe("caido");

    const recovered = await runServiceCheck(due("/ok"), online);
    expect(recovered.outcome).toBe("success");
    const row = await db.service.findUniqueOrThrow({ where: { id: s.id } });
    expect(row).toMatchObject({ healthStatus: "operativo", consecutiveFailures: 0 });
    expect(row.statusChangedAt).not.toBeNull();
  });

  it("un servicio skipped sin evaluaciones previas queda sin estado (no se marca caído)", async () => {
    const s = await makeService("sin-estado", "/fail");
    await runServiceCheck({ id: s.id, name: s.name, checkUrl: s.checkUrl, timeoutMs: 2000 }, createCanary(`${base}/fail`));
    expect((await db.service.findUniqueOrThrow({ where: { id: s.id } })).healthStatus).toBeNull();
  });

  it("recordCheckResult informa si el estado cambió", async () => {
    const s = await makeService("cambio", "/ok");
    const ok = { outcome: "success" as const, httpStatus: 200, responseTimeMs: 10, errorMessage: null };
    expect(await recordCheckResult(s.id, ok)).toEqual({ previousStatus: null, status: "operativo", changed: true });
    expect(await recordCheckResult(s.id, ok)).toEqual({ previousStatus: "operativo", status: "operativo", changed: false });
  });
});

describe("historial de cambios de estado (WI-014)", () => {
  it("registra cada transición con estado anterior, nuevo y hora; sin cambio no registra nada", async () => {
    const s = await makeService("historial", "/ok", { downAfterFailures: 1 });
    const ok = { outcome: "success" as const, httpStatus: 200, responseTimeMs: 10, errorMessage: null };
    const fail = { outcome: "failure" as const, httpStatus: 503, responseTimeMs: 5, errorMessage: "x" };
    const start = Date.now() - 10 * 60_000;
    const t = (min: number) => new Date(start + min * 60_000);

    await recordCheckResult(s.id, ok, t(0));
    await recordCheckResult(s.id, ok, t(1)); // sin cambio
    await recordCheckResult(s.id, fail, t(2)); // caída
    await recordCheckResult(s.id, fail, t(3)); // sin cambio
    await recordCheckResult(s.id, ok, t(4)); // recuperación

    const changes = await db.serviceStatusChange.findMany({ where: { serviceId: s.id }, orderBy: { changedAt: "asc" } });
    expect(changes.map((c) => [c.fromStatus, c.toStatus])).toEqual([
      [null, "operativo"],
      ["operativo", "caido"],
      ["caido", "operativo"],
    ]);
    expect(changes[1].changedAt.getTime()).toBe(t(2).getTime());
  });

  it("purga las transiciones más antiguas que la retención", async () => {
    const s = await makeService("purga-historial", "/ok");
    await db.serviceStatusChange.createMany({
      data: [
        { serviceId: s.id, toStatus: "operativo", changedAt: new Date(Date.now() - 400 * 86_400_000) },
        { serviceId: s.id, toStatus: "caido", changedAt: new Date() },
      ],
    });
    await purgeOldStatusChanges(365);
    expect(await db.serviceStatusChange.count({ where: { serviceId: s.id } })).toBe(1);
  });
});

describe("componentes del /health (WI-021)", () => {
  it("HTTP 200 con una base down deja el servicio degradado y guarda los componentes", async () => {
    const s = await makeService("reporter", "/reporter-down");
    const r = await runServiceCheck({ id: s.id, name: s.name, checkUrl: s.checkUrl, timeoutMs: 2000 }, createCanary(null));
    expect(r.degradedReason).toBe("1 de 3 componentes con falla: seizure");
    const row = await db.service.findUniqueOrThrow({ where: { id: s.id } });
    expect(row.healthStatus).toBe("degradado");
    expect(row.lastComponents).toEqual(
      expect.arrayContaining([expect.objectContaining({ group: "databases", name: "seizure", status: "down" })]),
    );
    const check = await db.serviceCheck.findFirstOrThrow({ where: { serviceId: s.id } });
    expect(check).toMatchObject({ outcome: "success", degradedReason: "1 de 3 componentes con falla: seizure" });
    expect(check.bodyExcerpt).toContain("seizure");
  });

  it("una respuesta sin componentes limpia el último estado de componentes", async () => {
    const s = await makeService("limpia", "/reporter-down");
    const canary = createCanary(null);
    await runServiceCheck({ id: s.id, name: s.name, checkUrl: s.checkUrl, timeoutMs: 2000 }, canary);
    await runServiceCheck({ id: s.id, name: s.name, checkUrl: `${base}/ok`, timeoutMs: 2000 }, canary);
    const row = await db.service.findUniqueOrThrow({ where: { id: s.id } });
    expect(row).toMatchObject({ lastComponents: null, healthStatus: "operativo" });
  });
});
