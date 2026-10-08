import { NextResponse } from "next/server";
import { refresh } from "@/features/auth/server/auth.service";
import { clearAuthCookies, getRefreshTokenCookie, getRequestMeta, setAuthCookies } from "@/features/auth/server/request";
import { safeCallbackUrl } from "@/features/auth/utils/callback-url";

/**
 * Renovación de sesión durante la navegación: proxy.ts redirige aquí cuando el access token
 * venció. Si el refresh token es válido, rota la sesión y vuelve a la página; si no, va a /login.
 */
export async function GET(request: Request) {
  const callbackUrl = safeCallbackUrl(new URL(request.url).searchParams.get("callbackUrl"));
  const refreshToken = await getRefreshTokenCookie();

  if (refreshToken) {
    try {
      const { tokens } = await refresh(refreshToken, await getRequestMeta());
      await setAuthCookies(tokens);
      return NextResponse.redirect(new URL(callbackUrl, request.url), 303);
    } catch {
      // Refresh inválido, revocado o expirado: se continúa hacia /login.
    }
  }

  await clearAuthCookies();
  const login = new URL("/login", request.url);
  if (callbackUrl !== "/") login.searchParams.set("callbackUrl", callbackUrl);
  return NextResponse.redirect(login, 303);
}
