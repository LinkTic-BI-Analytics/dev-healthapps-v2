import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AuthProvider from "@/features/auth/components/AuthProvider";
import { PATH_HEADER } from "@/features/auth/constants/cookies";
import PendingPermissions from "@/features/auth/components/PendingPermissions";
import UserMenu from "@/features/auth/components/UserMenu";
import { getCurrentUser } from "@/features/auth/server/request";
import MainLayout from "@/layouts/MainLayout";

/**
 * Área privada. Verificación **segura**: la sesión debe existir, no estar revocada y pertenecer a un
 * usuario activo (proxy.ts solo verificó la firma del JWT).
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (!user) {
    const path = (await headers()).get(PATH_HEADER) ?? "/";
    redirect(`/login?expired=1&callbackUrl=${encodeURIComponent(path)}`);
  }

  const { sessionId: _omit, ...authUser } = user;
  void _omit;

  return (
    <AuthProvider user={authUser}>
      {authUser.permissions.length === 0 ? (
        <PendingPermissions user={authUser} />
      ) : (
        <MainLayout
          permissions={authUser.permissions}
          headerSlot={<UserMenu user={authUser} compact />}
          sidebarFooterSlot={<UserMenu user={authUser} />}
        >
          {children}
        </MainLayout>
      )}
    </AuthProvider>
  );
}
