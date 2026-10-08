import { PERMISSIONS } from "@/features/auth/constants/permissions";
import { requirePermission } from "@/features/auth/server/request";
import { createService, listServices } from "@/features/service-catalog/server/service.service";
import { createServiceSchema, validationMessages } from "@/features/service-catalog/utils/validation";
import { handleRoute, parseJsonBody } from "@/lib/route-handler";

export const GET = handleRoute(async () => {
  await requirePermission(PERMISSIONS.SERVICES_READ);
  return Response.json({ services: await listServices() });
});

export const POST = handleRoute(async (request: Request) => {
  const actor = await requirePermission(PERMISSIONS.SERVICES_MANAGE);
  const data = await parseJsonBody(request, createServiceSchema, validationMessages);
  return Response.json({ service: await createService(data, actor.id) }, { status: 201 });
});
