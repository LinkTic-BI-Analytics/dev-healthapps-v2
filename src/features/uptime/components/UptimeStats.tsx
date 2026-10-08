import AnimatedNumber from "@/components/AnimatedNumber";
import type { UptimeSummary } from "@/features/dashboard/types/dashboard.types";
import { formatUptime } from "@/lib/format";
import { cn } from "@/lib/utils";

const PERIODS = [
  { key: "24h", label: "24 h" },
  { key: "7d", label: "7 d" },
  { key: "30d", label: "30 d" },
] as const;

/** Color según el nivel de disponibilidad (umbrales visuales, no reglas de negocio). */
function tone(value: number | null): string {
  if (value === null) return "text-muted-foreground";
  if (value >= 99) return "text-status-ok";
  if (value >= 95) return "text-status-warn";
  return "text-status-down";
}

/** Uptime por período. `compact`: una línea para las tarjetas del panel. */
export default function UptimeStats({ uptime, compact = false }: { uptime: UptimeSummary; compact?: boolean }) {
  if (compact) {
    return (
      <p className="flex flex-wrap gap-x-2.5 font-mono text-xs text-muted-foreground" aria-label="Disponibilidad">
        {PERIODS.map((p) => (
          <span key={p.key}>
            {p.label}{" "}
            <span className={tone(uptime[p.key])}>
              {uptime[p.key] === null ? "—" : <AnimatedNumber value={uptime[p.key] as number} format={formatUptime} />}
            </span>
          </span>
        ))}
      </p>
    );
  }
  return (
    <dl className="grid grid-cols-3 gap-3">
      {PERIODS.map((p) => (
        <div key={p.key} className="flex flex-col gap-1 rounded-xl border bg-card p-3">
          <dt className="text-xs text-muted-foreground">Uptime {p.label}</dt>
          <dd className={cn("font-mono text-lg font-semibold", tone(uptime[p.key]))}>{formatUptime(uptime[p.key])}</dd>
        </div>
      ))}
    </dl>
  );
}
