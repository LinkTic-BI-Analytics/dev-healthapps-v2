import { db } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import { createService, getService, listServices, updateService } from "./service.service";

const run = Date.now().toString(36);
let userId: string;

beforeAll(async () => {
  const role = await db.role.findUniqueOrThrow({ where: { code: "admin" } });
  userId = (
    await db.user.create({
      data: { email: `svc.${run}@test.local`, username: `svc_${run}`, passwordHash: "x", roleId: role.id },
    })
  ).id;
});

afterAll(async () => {
  await db.service.deleteMany({ where: { name: { endsWith: run } } });
  await db.user.deleteMany({ where: { id: userId } });
  await db.$disconnect();
});

describe("catálogo de servicios", () => {
  it("crea, lista, edita y desactiva un servicio", async () => {
    const created = await createService({ name: `API ${run}`, description: null, checkUrl: "https://x.com/health" }, userId);
    expect(created).toMatchObject({ isActive: true, checkUrl: "https://x.com/health" });
    expect((await listServices()).some((s) => s.id === created.id)).toBe(true);

    const edited = await updateService(created.id, { description: "Pagos", isActive: false });
    expect(edited).toMatchObject({ description: "Pagos", isActive: false });
    expect((await getService(created.id)).isActive).toBe(false);
  });

  it("rechaza nombres duplicados con 409", async () => {
    await expect(
      createService({ name: `API ${run}`, description: null, checkUrl: "https://y.com" }, userId),
    ).rejects.toMatchObject({ statusCode: 409 } satisfies Partial<HttpError>);
  });

  it("responde 404 si el servicio no existe", async () => {
    await expect(getService("00000000-0000-4000-8000-000000000000")).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("parámetros esperados (WI-008)", () => {
  it("un servicio nuevo recibe los umbrales por defecto y se pueden modificar", async () => {
    const s = await createService({ name: `Umbrales ${run}`, description: null, checkUrl: "https://z.com" }, userId);
    expect(s).toMatchObject({ degradedResponseTimeMs: 1000, downAfterFailures: 3 });
    const edited = await updateService(s.id, { degradedResponseTimeMs: 600, downAfterFailures: 5 });
    expect(edited).toMatchObject({ degradedResponseTimeMs: 600, downAfterFailures: 5 });
  });

  it("la base rechaza umbrales no positivos aunque se salte la validación", async () => {
    const s = await createService({ name: `Check ${run}`, description: null, checkUrl: "https://z.com" }, userId);
    await expect(db.service.update({ where: { id: s.id }, data: { downAfterFailures: 0 } })).rejects.toThrow();
  });
});

describe("eliminar servicios (WI-022)", () => {
  it("elimina el servicio con sus verificaciones e historial; 404 si no existe", async () => {
    const { deleteService } = await import("./service.service");
    const { recordCheckResult } = await import("@/features/checks/server/check-runner");
    const s = await createService({ name: `Borrar ${run}`, description: null, checkUrl: "https://z.com" }, userId);
    await recordCheckResult(s.id, { outcome: "success", httpStatus: 200, responseTimeMs: 5, errorMessage: null });
    expect(await db.serviceStatusChange.count({ where: { serviceId: s.id } })).toBe(1);

    await deleteService(s.id);
    expect(await db.service.findUnique({ where: { id: s.id } })).toBeNull();
    expect(await db.serviceCheck.count({ where: { serviceId: s.id } })).toBe(0);
    expect(await db.serviceStatusChange.count({ where: { serviceId: s.id } })).toBe(0);
    await expect(deleteService(s.id)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("el worker descarta la verificación de un servicio eliminado", async () => {
    const { recordCheckResult, ServiceDeletedError } = await import("@/features/checks/server/check-runner");
    await expect(
      recordCheckResult("00000000-0000-4000-8000-000000000000", { outcome: "success", httpStatus: 200, responseTimeMs: 5, errorMessage: null }),
    ).rejects.toBeInstanceOf(ServiceDeletedError);
  });
});
