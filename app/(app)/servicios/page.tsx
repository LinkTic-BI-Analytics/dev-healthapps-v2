import { Plus } from "lucide-react";
import Link from "next/link";
import AccessDenied from "@/components/AccessDenied";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/features/auth/constants/permissions";
import { getCurrentUser, hasPermission } from "@/features/auth/server/request";
import ServiceList from "@/features/service-catalog/components/ServiceList";
import ServicesHelp from "@/features/help/content/ServicesHelp";

export const metadata = { title: "Servicios · Health Apps" };

export default async function ServicesPage() {
  const user = await getCurrentUser();
  if (!hasPermission(user, PERMISSIONS.SERVICES_READ)) return <AccessDenied />;
  const canManage = hasPermission(user, PERMISSIONS.SERVICES_MANAGE);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
        <div className="flex gap-2">
          {canManage && (
            <Button asChild>
              <Link href="/servicios/nuevo">
                <Plus aria-hidden /> Registrar servicio
              </Link>
            </Button>
          )}
          <ServicesHelp />
        </div>
      </header>
      <ServiceList canManage={canManage} />
    </section>
  );
}
