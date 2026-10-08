"use client";

import { ChevronLeft, Pencil, RotateCw } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatLatency, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useServiceDetail } from "../hooks/useServiceDetail";
import type { DetailRange } from "../types/service-detail.types";
import ManualChecksNotice from "@/features/checks/components/ManualChecksNotice";
import ServiceDetailHelp from "@/features/help/content/ServiceDetailHelp";
import UptimeStats from "@/features/uptime/components/UptimeStats";
import ComponentsList from "./ComponentsList";
import RecentChecks from "./RecentChecks";
import StatusHistory from "./StatusHistory";

// Chart.js solo se descarga en el detalle, no en el panel.
const ResponseTimeChart = dynamic(() => import("./ResponseTimeChart"), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse rounded-lg bg-muted md:h-72" />,
});

const RANGES: { key: DetailRange; label: string }[] = [
  { key: "1h", label: "1 h" },
  { key: "24h", label: "24 h" },
];

function Metric({ label, value, tone }: { label: string; value: string; tone?: "warn" | "down" }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("font-mono text-lg font-semibold", tone === "warn" && "text-status-warn", tone === "down" && "text-status-down")}>
        {value}
      </dd>
    </div>
  );
}

/** Detalle de un servicio: estado, métricas, gráfica de tiempos de respuesta y verificaciones recientes. */
export default function ServiceDetailView({
  id,
  canManage,
  manualChecks = false,
  children,
}: {
  id: string;
  canManage: boolean;
  manualChecks?: boolean;
  children?: React.ReactNode;
}) {
  const { data, loading, error, range, setRange, refresh } = useServiceDetail(id);

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground">Cargando el detalle del servicio…</p>;
  if (error || !data)
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">No se pudo cargar el detalle del servicio.</p>
        <Button variant="outline" onClick={refresh}>
          <RotateCw aria-hidden /> Reintentar
        </Button>
      </div>
    );

  const { service, checks } = data;
  const now = new Date(data.generatedAt);
  const slow = service.lastResponseTimeMs !== null && service.lastResponseTimeMs > service.degradedResponseTimeMs;

  return (
    <section className="flex flex-col gap-5">
      <Link href="/" className="flex w-fit items-center gap-1 text-sm font-medium">
        <ChevronLeft aria-hidden className="size-4" /> Panel
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={service.healthStatus} />
            {!service.isActive && <span className="text-xs text-muted-foreground">Inactivo</span>}
            {service.statusChangedAt && (
              <span className="font-mono text-xs text-muted-foreground">desde {formatRelativeTime(service.statusChangedAt, now)}</span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight break-words">{service.name}</h1>
          {service.description && <p className="text-sm text-text-secondary">{service.description}</p>}
          <p className="truncate font-mono text-xs text-muted-foreground">{service.checkUrl}</p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <Button asChild variant="outline">
              <Link href={`/servicios/${service.id}/editar`}>
                <Pencil aria-hidden /> Editar
              </Link>
            </Button>
          )}
          <ServiceDetailHelp />
        </div>
      </header>

      {manualChecks && <ManualChecksNotice onChecked={refresh} />}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric
              label="Última respuesta"
              value={service.lastResponseTimeMs !== null ? formatLatency(service.lastResponseTimeMs) : "—"}
              tone={slow ? "warn" : undefined}
            />
            <Metric label="Umbral de degradación" value={formatLatency(service.degradedResponseTimeMs)} />
            <Metric
              label="Fallos seguidos"
              value={`${service.consecutiveFailures} / ${service.downAfterFailures}`}
              tone={service.consecutiveFailures >= service.downAfterFailures ? "down" : service.consecutiveFailures > 0 ? "warn" : undefined}
            />
            <Metric
              label="Última verificación"
              value={service.lastCheckedAt ? formatRelativeTime(service.lastCheckedAt, now) : "—"}
            />
          </dl>

          <section aria-label="Disponibilidad" className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">Disponibilidad</h2>
            <UptimeStats uptime={data.uptime} />
          </section>

          <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">Tiempo de respuesta</h2>
              <div role="group" aria-label="Rango de la gráfica" className="flex gap-1 rounded-lg bg-muted p-1">
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    aria-pressed={range === r.key}
                    onClick={() => setRange(r.key)}
                    className={cn(
                      "h-8 rounded-md px-3 text-xs font-medium",
                      range === r.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            {checks.length > 0 ? (
              <ResponseTimeChart checks={checks} thresholdMs={service.degradedResponseTimeMs} />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">Sin verificaciones en este rango.</p>
            )}
          </div>
          {service.components && (
            <section aria-label="Componentes" className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
              <h2 className="font-semibold">
                Componentes <span className="font-mono text-sm text-muted-foreground">({service.components.length})</span>
              </h2>
              <ComponentsList components={service.components} />
            </section>
          )}

          <section aria-label="Historial de estados" className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
            <h2 className="font-semibold">Historial de estados</h2>
            <StatusHistory changes={data.statusChanges} now={now} />
          </section>
          {children}
        </div>

        <aside className="flex flex-col gap-2 rounded-2xl border bg-card p-4" aria-label="Verificaciones recientes">
          <h2 className="font-semibold">Verificaciones recientes</h2>
          <RecentChecks checks={checks} thresholdMs={service.degradedResponseTimeMs} />
        </aside>
      </div>
    </section>
  );
}
