import { requireUser } from "@/features/auth/server/request";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { handleRoute } from "@/lib/route-handler";

/** Usuario autenticado con su rol y permisos efectivos (sin hashes ni id de sesión). */
export const GET = handleRoute(async () => {
  const { id, email, username, role, permissions } = await requireUser();
  const user: AuthUser = { id, email, username, role, permissions };
  return Response.json({ user });
});
