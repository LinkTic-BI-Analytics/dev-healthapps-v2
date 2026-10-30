import { login } from "@/features/auth/server/auth.service";
import { getRequestMeta, tokenResponse } from "@/features/auth/server/request";
import { loginSchema, validationMessages } from "@/features/auth/utils/validation";
import { handleRoute, parseJsonBody } from "@/lib/route-handler";

/**
 * Inicio de sesión para apps externas: mismas credenciales que /api/auth/login, pero los tokens
 * se devuelven en el cuerpo (sin cookies). El access token se envía en `Authorization: Bearer`.
 */
export const POST = handleRoute(async (request: Request) => {
  const payload = await parseJsonBody(request, loginSchema, validationMessages);
  const result = await login(payload, await getRequestMeta());
  return Response.json(tokenResponse(result), { headers: { "Cache-Control": "no-store" } });
});
