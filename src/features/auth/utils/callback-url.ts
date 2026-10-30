/**
 * Solo se aceptan rutas internas como destino tras iniciar sesión (evita redirecciones abiertas
 * a otros dominios con `//evil.com` o `https://...`).
 */
export function safeCallbackUrl(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.startsWith("/login") || value.startsWith("/registro") || value.startsWith("/api/")) return fallback;
  return value;
}
