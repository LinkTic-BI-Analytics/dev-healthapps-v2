import AccessDenied from "@/components/AccessDenied";
import { PERMISSIONS } from "@/features/auth/constants/permissions";
import { getCurrentUser, hasPermission } from "@/features/auth/server/request";
import ServiceForm from "@/features/service-catalog/components/ServiceForm";
import ServiceFormHelp from "@/features/help/content/ServiceFormHelp";

export const metadata = { title: "Registrar servicio · Health Apps" };

export default async function NewServicePage() {
  if (!hasPermission(await getCurrentUser(), PERMISSIONS.SERVICES_MANAGE)) return <AccessDenied />;
  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Registrar servicio</h1>
        <ServiceFormHelp />
      </header>
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <ServiceForm />
      </div>
    </section>
  );
}
