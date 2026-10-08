import { ArrowRight } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatRelativeTime } from "@/lib/format";
import type { StatusChangeDto } from "../types/service-detail.types";

const dateTime = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", hourCycle: "h23" });

/** Historial de cambios de estado (BR-06), del más reciente al más antiguo. */
export default function StatusHistory({ changes, now }: { changes: StatusChangeDto[]; now: Date }) {
  if (changes.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">Todavía no hay cambios de estado.</p>;
  }
  return (
    <ol className="flex flex-col divide-y">
      {changes.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5">
          <span className="flex items-center gap-1.5">
            {c.fromStatus ? <StatusBadge status={c.fromStatus} /> : <span className="text-xs text-muted-foreground">Inicio</span>}
            <ArrowRight aria-label="pasó a" className="size-3.5 text-muted-foreground" />
            <StatusBadge status={c.toStatus} />
          </span>
          <time dateTime={c.changedAt} className="ml-auto font-mono text-xs text-muted-foreground" title={dateTime.format(new Date(c.changedAt))}>
            {dateTime.format(new Date(c.changedAt))} · {formatRelativeTime(c.changedAt, now)}
          </time>
        </li>
      ))}
    </ol>
  );
}
