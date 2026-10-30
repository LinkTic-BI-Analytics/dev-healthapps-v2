import AccessDenied from "@/components/AccessDenied";
import { PERMISSIONS } from "@/features/auth/constants/permissions";
import { ASSIGNABLE_ROLES } from "@/features/auth/constants/roles";
import { getCurrentUser, hasPermission } from "@/features/auth/server/request";
import CreateUserHelp from "@/features/help/content/CreateUserHelp";
import CreateUserForm from "@/features/users/components/CreateUserForm";

export const metadata = { title: "Crear usuario · Health Apps" };

export default async function NewUserPage() {
  const user = await getCurrentUser();
  // El permiso se comprueba en el servidor: ocultar el enlace no es suficiente.
  if (!user || !hasPermission(user, PERMISSIONS.USERS_CREATE)) return <AccessDenied />;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Crear usuario</h1>
        <CreateUserHelp />
      </header>
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <CreateUserForm assignableRoles={ASSIGNABLE_ROLES[user.role]} />
      </div>
    </section>
  );
}
