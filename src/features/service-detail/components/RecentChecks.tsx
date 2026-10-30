import type { ServiceCheckDto } from "@/features/checks/types/check.types";
import { formatLatency } from "@/lib/format";
import { cn } from "@/lib/utils";

const OUTCOME = {
  success: { label: "Éxito", className: "bg-status-ok-tint text-status-ok" },
  failure: { label: "Fallo", className: "bg-status-down-tint text-status-down" },
  skipped: { label: "Omitida", className: "bg-muted text-muted-foreground" },
} as const;

const dateTime = new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });

/** Verificaciones recientes (la más reciente primero), con los fallos destacados y su motivo. */
export default function RecentChecks({ checks, thresholdMs }: { checks: ServiceCheckDto[]; thresholdMs: number }) {
  const recent = [...checks].reverse().slice(0, 20);
  if (recent.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Sin verificaciones en este rango.</p>;
  }
  return (
    <ol className="flex flex-col divide-y">
      {recent.map((c) => {
        const o = OUTCOME[c.outcome];
        const slow = c.outcome === "success" && ((c.responseTimeMs ?? 0) > thresholdMs || !!c.degradedReason);
        return (
          <li key={c.id} className={cn("flex flex-col gap-1 py-2.5", c.outcome === "failure" && "-mx-2 rounded-md bg-status-down-tint/50 px-2")}>
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", o.className)}>{o.label}</span>
              <span className="font-mono text-xs text-muted-foreground">{dateTime.format(new Date(c.checkedAt))}</span>
              <span className="ml-auto flex items-center gap-2 font-mono text-xs">
                {c.httpStatus !== null && <span className="text-text-secondary">HTTP {c.httpStatus}</span>}
                <span className={cn(slow ? "text-status-warn" : "text-text-secondary")}>
                  {c.responseTimeMs !== null ? formatLatency(c.responseTimeMs) : "—"}
                </span>
              </span>
            </div>
            {c.errorMessage && <p className="text-xs text-status-down">{c.errorMessage}</p>}
            {c.degradedReason && <p className="text-xs text-status-warn">{c.degradedReason}</p>}
            {c.bodyExcerpt && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">Ver respuesta</summary>
                <pre className="mt-1 max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-[11px] whitespace-pre-wrap break-all">
                  {c.bodyExcerpt}
                </pre>
              </details>
            )}
          </li>
        );
      })}
    </ol>
  );
}
