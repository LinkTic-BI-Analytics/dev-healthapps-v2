import { revokeAllUserSessions } from "@/features/auth/server/auth.service";
import { clearAuthCookies, requireUser } from "@/features/auth/server/request";
import { handleRoute } from "@/lib/route-handler";

/** Cierra la sesión en todos los dispositivos del usuario. */
export const POST = handleRoute(async () => {
  const user = await requireUser();
  await revokeAllUserSessions(user.id, "logout_all");
  await clearAuthCookies();
  return new Response(null, { status: 204 });
});
