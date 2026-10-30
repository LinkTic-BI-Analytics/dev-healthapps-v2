import { register } from "@/features/auth/server/auth.service";
import { getRequestMeta, setAuthCookies } from "@/features/auth/server/request";
import { registerSchema, validationMessages } from "@/features/auth/utils/validation";
import { handleRoute, parseJsonBody } from "@/lib/route-handler";

/** Autorregistro: el usuario queda con el rol `nuevo` (sin permisos) y con la sesión iniciada. */
export const POST = handleRoute(async (request: Request) => {
  const payload = await parseJsonBody(request, registerSchema, validationMessages);
  const { user, tokens } = await register(payload, await getRequestMeta());
  await setAuthCookies(tokens);
  return Response.json({ user }, { status: 201 });
});
