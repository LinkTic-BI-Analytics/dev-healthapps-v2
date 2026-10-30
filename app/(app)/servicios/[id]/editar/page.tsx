import { notFound } from "next/navigation";
import AccessDenied from "@/components/AccessDenied";
import { PERMISSIONS } from "@/features/auth/constants/permissions";
import { getCurrentUser, hasPermission } from "@/features/auth/server/request";
import DeleteServiceSection from "@/features/service-catalog/components/DeleteServiceSection";
import ServiceForm from "@/features/service-catalog/components/ServiceForm";
import ServiceFormHelp from "@/features/help/content/ServiceFormHelp";
import { getService } from "@/features/service-catalog/server/service.service";
import { serviceIdSchema } from "@/features/service-catalog/utils/validation";

export const metadata = { title: "Editar servicio · Health Apps" };

export default async function EditServicePage({ params }: PageProps<"/servicios/[id]/editar">) {
  if (!hasPermission(await getCurrentUser(), PERMISSIONS.SERVICES_MANAGE)) return <AccessDenied />;
  const id = serviceIdSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const service = await getService(id.data).catch(() => null);
  if (!service) notFound();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Editar servicio</h1>
          <p className="truncate text-sm text-muted-foreground">{service.name}</p>
        </div>
        <ServiceFormHelp />
      </header>
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <ServiceForm service={service} />
      </div>
      <DeleteServiceSection serviceId={service.id} serviceName={service.name} />
    </section>
  );
}
