/** Formatea milisegundos para mostrar latencias: `840 ms`, `1,2 s`. */
export function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} s`;
}

/** "99,95 %" con dos decimales (el uptime alto necesita precisión); "—" sin datos. */
export function formatUptime(value: number | null): string {
  if (value === null) return "—";
  return `${value.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
}

const relative = new Intl.RelativeTimeFormat("es-CO", { numeric: "auto" });

/** "hace 5 s", "hace 3 min", "hace 2 h", "ayer"… para la última verificación. */
export function formatRelativeTime(date: Date | string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(date).getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return relative.format(seconds, "second");
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), "hour");
  return relative.format(Math.round(seconds / 86400), "day");
}
