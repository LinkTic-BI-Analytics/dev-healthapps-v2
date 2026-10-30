import { refresh } from "@/features/auth/server/auth.service";
import { getRequestMeta, tokenResponse } from "@/features/auth/server/request";
import { refreshTokenSchema, validationMessages } from "@/features/auth/utils/validation";
import { handleRoute, parseJsonBody } from "@/lib/route-handler";

/** Rota el refresh token de una app externa (en el cuerpo) y emite un access token nuevo. */
export const POST = handleRoute(async (request: Request) => {
  const { refreshToken } = await parseJsonBody(request, refreshTokenSchema, validationMessages);
  const result = await refresh(refreshToken, await getRequestMeta());
  return Response.json(tokenResponse(result), { headers: { "Cache-Control": "no-store" } });
});
