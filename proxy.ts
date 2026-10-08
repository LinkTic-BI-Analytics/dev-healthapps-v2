import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, PATH_HEADER } from "@/features/auth/constants/cookies";
import { getAuthConfig } from "@/features/auth/server/config";
import { verifyAccessToken } from "@/features/auth/server/jwt";

/** Páginas accesibles sin sesión. */
const PUBLIC_PATHS = ["/login", "/registro"];

/**
 * Verificación **optimista** (firma y expiración del JWT) antes de renderizar páginas privadas.
 * La verificación segura (sesión no revocada en base de datos) se hace en el servidor:
 * layout `app/(app)` y `requirePermission()` en los Route Handlers.
 * Si el access token no es válido, se intenta renovar la sesión en /api/auth/session
 * (el único lugar donde viaja la cookie del refresh token) antes de mandar a /login.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(PATH_HEADER, pathname + search);
  const next = () => NextResponse.next({ request: { headers: requestHeaders } });

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return next();

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (token && (await verifyAccessToken(token, getAuthConfig().accessSecret))) return next();

  const url = new URL("/api/auth/session", request.url);
  url.searchParams.set("callbackUrl", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  // Excluye el API (protegido con requirePermission), los estáticos y los archivos públicos.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)"],
};
