import { PERMISSIONS } from "@/features/auth/constants/permissions";
import { requirePermission } from "@/features/auth/server/request";
import { checkAllServices } from "@/features/checks/server/check-runner";
import { getChecksMode, getWorkerConfig } from "@/features/checks/server/config";
import { HttpError } from "@/lib/http-error";
import { handleRoute } from "@/lib/route-handler";

// Verifica todos los servicios en la misma petición: puede tardar hasta el timeout del más lento.
export const maxDuration = 60;

/** Verificación manual de todos los servicios activos. Solo existe en modo `manual` (Vercel). */
export const POST = handleRoute(async () => {
  await requirePermission(PERMISSIONS.SERVICES_READ);
  if (getChecksMode() !== "manual") {
    throw new HttpError(409, "Las verificaciones las ejecuta el worker de forma automática.");
  }
  const config = getWorkerConfig();
  return Response.json({ summary: await checkAllServices(config) });
});
