import { PERMISSIONS } from "@/features/auth/constants/permissions";
import { requirePermission } from "@/features/auth/server/request";
import { deleteService, getService, updateService } from "@/features/service-catalog/server/service.service";
import { serviceIdSchema, updateServiceSchema, validationMessages } from "@/features/service-catalog/utils/validation";
import { HttpError } from "@/lib/http-error";
import { handleRoute, parseJsonBody } from "@/lib/route-handler";

async function serviceId(ctx: RouteContext<"/api/services/[id]">): Promise<string> {
  const parsed = serviceIdSchema.safeParse((await ctx.params).id);
  if (!parsed.success) throw new HttpError(404, "El servicio no existe.");
  return parsed.data;
}

export const GET = handleRoute(async (_request: Request, ctx: RouteContext<"/api/services/[id]">) => {
  await requirePermission(PERMISSIONS.SERVICES_READ);
  return Response.json({ service: await getService(await serviceId(ctx)) });
});

/** Edita un servicio; `isActive: false` lo desactiva (deja de verificarse). */
export const PATCH = handleRoute(async (request: Request, ctx: RouteContext<"/api/services/[id]">) => {
  await requirePermission(PERMISSIONS.SERVICES_MANAGE);
  const id = await serviceId(ctx);
  const data = await parseJsonBody(request, updateServiceSchema, validationMessages);
  return Response.json({ service: await updateService(id, data) });
});

/** Elimina el servicio con sus verificaciones e historial (no se puede deshacer). */
export const DELETE = handleRoute(async (_request: Request, ctx: RouteContext<"/api/services/[id]">) => {
  await requirePermission(PERMISSIONS.SERVICES_MANAGE);
  await deleteService(await serviceId(ctx));
  return new Response(null, { status: 204 });
});
