import { hashToken } from "@/features/auth/server/crypto";
import { revokeSession } from "@/features/auth/server/auth.service";
import { clearAuthCookies, getCurrentUser, getRefreshTokenCookie } from "@/features/auth/server/request";
import { db } from "@/lib/db";
import { handleRoute } from "@/lib/route-handler";

/** Revoca la sesión actual (aunque el access token ya haya expirado, vía refresh token). */
export const POST = handleRoute(async () => {
  const user = await getCurrentUser();
  if (user) {
    await revokeSession(user.sessionId, "logout");
  } else {
    const refreshToken = await getRefreshTokenCookie();
    if (refreshToken) {
      const session = await db.userSession.findUnique({
        where: { refreshTokenHash: hashToken(refreshToken) },
        select: { id: true },
      });
      if (session) await revokeSession(session.id, "logout");
    }
  }
  await clearAuthCookies();
  return new Response(null, { status: 204 });
});
