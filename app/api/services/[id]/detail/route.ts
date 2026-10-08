import { PERMISSIONS } from "@/features/auth/constants/permissions";
import { requirePermission } from "@/features/auth/server/request";
import { serviceIdSchema } from "@/features/service-catalog/utils/validation";
import { getServiceDetail } from "@/features/service-detail/server/service-detail.service";
import type { DetailRange } from "@/features/service-detail/types/service-detail.types";
import { HttpError } from "@/lib/http-error";
import { handleRoute } from "@/lib/route-handler";

/** Estado del servicio y verificaciones del rango (`?range=1h|24h`, por defecto 1h). */
export const GET = handleRoute(async (request: Request, ctx: RouteContext<"/api/services/[id]/detail">) => {
  await requirePermission(PERMISSIONS.SERVICES_READ);
  const id = serviceIdSchema.safeParse((await ctx.params).id);
  if (!id.success) throw new HttpError(404, "El servicio no existe.");
  const range: DetailRange = new URL(request.url).searchParams.get("range") === "24h" ? "24h" : "1h";
  return Response.json(await getServiceDetail(id.data, range));
});
