import { login } from "@/features/auth/server/auth.service";
import { getRequestMeta, setAuthCookies } from "@/features/auth/server/request";
import { loginSchema, validationMessages } from "@/features/auth/utils/validation";
import { handleRoute, parseJsonBody } from "@/lib/route-handler";

/** Inicio de sesión con email **o** username. */
export const POST = handleRoute(async (request: Request) => {
  const payload = await parseJsonBody(request, loginSchema, validationMessages);
  const { user, tokens } = await login(payload, await getRequestMeta());
  await setAuthCookies(tokens);
  return Response.json({ user });
});
