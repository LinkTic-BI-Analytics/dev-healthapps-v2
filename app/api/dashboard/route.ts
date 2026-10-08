import { PERMISSIONS } from "@/features/auth/constants/permissions";
import { requirePermission } from "@/features/auth/server/request";
import { getDashboard } from "@/features/dashboard/server/dashboard.service";
import { handleRoute } from "@/lib/route-handler";

/** Estado de los servicios activos para el panel general. */
export const GET = handleRoute(async () => {
  await requirePermission(PERMISSIONS.SERVICES_READ);
  return Response.json(await getDashboard());
});
