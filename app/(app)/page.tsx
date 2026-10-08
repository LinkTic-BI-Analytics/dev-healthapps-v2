import AccessDenied from "@/components/AccessDenied";
import { PERMISSIONS } from "@/features/auth/constants/permissions";
import { getCurrentUser, hasPermission } from "@/features/auth/server/request";
import { getChecksMode } from "@/features/checks/server/config";
import DashboardView from "@/features/dashboard/components/DashboardView";

/** Panel general de monitoreo (WI-012). */
export default async function Home() {
  const user = await getCurrentUser();
  if (!hasPermission(user, PERMISSIONS.SERVICES_READ)) {
    return <AccessDenied message="No tienes permiso para ver el estado de los servicios." />;
  }
  return (
    <DashboardView
      canManage={hasPermission(user, PERMISSIONS.SERVICES_MANAGE)}
      manualChecks={getChecksMode() === "manual"}
    />
  );
}
