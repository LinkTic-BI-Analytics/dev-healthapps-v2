/**
 * `true` si el sistema pide reducir el movimiento (o si no hay `matchMedia`, p. ej. en pruebas):
 * en ese caso no se anima nada y los datos se muestran directamente.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
