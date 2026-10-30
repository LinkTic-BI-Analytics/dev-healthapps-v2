/**
 * Convierte un token CSS (p. ej. `--status-down`, que puede ser oklch) a `rgba()` pintando un píxel
 * en un canvas. Chart.js necesita colores que pueda interpretar y no lee variables CSS.
 */
export function resolveCssColor(variable: string, alpha = 1): string {
  if (typeof document === "undefined") return "rgba(0,0,0,1)";
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx || !value) return value || "rgba(0,0,0,1)";
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
