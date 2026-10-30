import { hashToken } from "@/features/auth/server/crypto";
import { revokeSession } from "@/features/auth/server/auth.service";
import { refreshTokenSchema, validationMessages } from "@/features/auth/utils/validation";
import { db } from "@/lib/db";
import { handleRoute, parseJsonBody } from "@/lib/route-handler";

/**
 * Cierra la sesión de una app externa con su refresh token (invalida también su access token).
 * Responde 204 aunque el token no exista o ya esté revocado: no revela qué tokens son válidos.
 */
export const POST = handleRoute(async (request: Request) => {
  const { refreshToken } = await parseJsonBody(request, refreshTokenSchema, validationMessages);
  const session = await db.userSession.findUnique({
    where: { refreshTokenHash: hashToken(refreshToken) },
    select: { id: true },
  });
  if (session) await revokeSession(session.id, "logout");
  return new Response(null, { status: 204 });
});
