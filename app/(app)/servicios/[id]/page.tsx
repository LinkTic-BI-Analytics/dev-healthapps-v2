import { notFound } from "next/navigation";
import AccessDenied from "@/components/AccessDenied";
import { PERMISSIONS } from "@/features/auth/constants/permissions";
import { getCurrentUser, hasPermission } from "@/features/auth/server/request";
import { db } from "@/lib/db";
import ServiceDetailView from "@/features/service-detail/components/ServiceDetailView";
import { serviceIdSchema } from "@/features/service-catalog/utils/validation";

export const metadata = { title: "Detalle del servicio · Health Apps" };

export default async function ServiceDetailPage({ params }: PageProps<"/servicios/[id]">) {
  const user = await getCurrentUser();
  if (!hasPermission(user, PERMISSIONS.SERVICES_READ)) return <AccessDenied />;
  const id = serviceIdSchema.safeParse((await params).id);
  // Un servicio inexistente muestra la página de no encontrado.
  if (!id.success || !(await db.service.findUnique({ where: { id: id.data }, select: { id: true } }))) notFound();

  return <ServiceDetailView id={id.data} canManage={hasPermission(user, PERMISSIONS.SERVICES_MANAGE)} />;
}
