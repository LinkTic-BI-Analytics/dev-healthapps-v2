import { refresh } from "@/features/auth/server/auth.service";
import { clearAuthCookies, getRefreshTokenCookie, getRequestMeta, setAuthCookies } from "@/features/auth/server/request";
import { HttpError } from "@/lib/http-error";
import { handleRoute } from "@/lib/route-handler";

/** Rota el refresh token y emite un access token nuevo. */
export const POST = handleRoute(async () => {
  const refreshToken = await getRefreshTokenCookie();
  if (!refreshToken) throw new HttpError(401, "Tu sesión expiró. Inicia sesión de nuevo.");
  try {
    const { user, tokens } = await refresh(refreshToken, await getRequestMeta());
    await setAuthCookies(tokens);
    return Response.json({ user });
  } catch (err) {
    await clearAuthCookies();
    throw err;
  }
});
