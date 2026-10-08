import { changePassword } from "@/features/auth/server/auth.service";
import { getRequestMeta, requireUser, setAuthCookies } from "@/features/auth/server/request";
import { changePasswordSchema, validationMessages } from "@/features/auth/utils/validation";
import { handleRoute, parseJsonBody } from "@/lib/route-handler";

/** Cambia la contraseña: revoca todas las sesiones del usuario y abre una nueva en este dispositivo. */
export const POST = handleRoute(async (request: Request) => {
  const current = await requireUser();
  const payload = await parseJsonBody(request, changePasswordSchema, validationMessages);
  const { user, tokens } = await changePassword(current.id, payload, await getRequestMeta());
  await setAuthCookies(tokens);
  return Response.json({ user });
});
