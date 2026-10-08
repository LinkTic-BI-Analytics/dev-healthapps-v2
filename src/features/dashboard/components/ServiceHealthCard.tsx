"use client";

import { ChevronRight, PartyPopper, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import UptimeStats from "@/features/uptime/components/UptimeStats";
import { formatLatency, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { STATUS_BG, STATUS_TEXT } from "@/types/health-status.style";
import type { ServiceHealthSummary } from "../types/dashboard.types";
import type { StatusChange } from "../utils/status-changes";
import Sparkline from "./Sparkline";

/** Tarjeta de servicio del panel: estado (color + texto), latencia, última verificación y tendencia. */
export default function ServiceHealthCard({
  service,
  now,
  change,
}: {
  service: ServiceHealthSummary;
  now: Date;
  /** Cambio de estado en la última actualización: resalta la tarjeta (WI-024). */
  change?: StatusChange;
}) {
  const key = service.healthStatus ?? "none";
  const slow = service.lastResponseTimeMs !== null && service.lastResponseTimeMs > service.degradedResponseTimeMs;
  const attention = service.healthStatus === "caido" || service.healthStatus === "degradado";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative rounded-2xl"
    >
      {/* Resplandor cuando el estado cambió en la última actualización. */}
      <AnimatePresence>
        {change && (
          <motion.span
            aria-hidden
            key={change.kind}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className={cn(
              "pointer-events-none absolute -inset-0.5 rounded-[18px] ring-2",
              change.kind === "recovered" ? "ring-status-ok" : "ring-status-warn",
            )}
          />
        )}
      </AnimatePresence>
      <Link
        href={`/servicios/${service.id}`}
        data-slot="service-card"
        aria-label={`${service.name}: ${service.healthStatus ?? "sin datos"}. Ver detalle`}
        className="group relative flex items-center gap-3 rounded-2xl border bg-card p-3.5 text-foreground shadow-sm transition-shadow hover:shadow-lg"
      >
        <span aria-hidden className={cn("w-1 self-stretch rounded-full transition-colors duration-500", STATUS_BG[key])} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{service.name}</p>
            <AnimatePresence>
              {change && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    change.kind === "recovered" ? "bg-status-ok-tint text-status-ok" : "bg-status-warn-tint text-status-warn",
                  )}
                >
                  {change.kind === "recovered" ? <PartyPopper aria-hidden className="size-3" /> : <RefreshCw aria-hidden className="size-3" />}
                  {change.kind === "recovered" ? "Recuperado" : "Cambió"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="relative flex">
              {attention && (
                <span aria-hidden className={cn("absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping", STATUS_BG[key])} />
              )}
              <StatusBadge status={service.healthStatus} className="relative" />
            </span>
            <span className={cn("font-mono text-xs", slow ? "text-status-warn" : "text-text-secondary")}>
              {service.lastResponseTimeMs !== null ? formatLatency(service.lastResponseTimeMs) : "—"}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {service.lastCheckedAt ? formatRelativeTime(service.lastCheckedAt, now) : "sin verificar"}
            </span>
          </div>
          {service.components?.issue && <p className="text-xs font-medium text-status-warn">{service.components.issue}</p>}
          <UptimeStats uptime={service.uptime} compact />
        </div>
        <Sparkline values={service.recentLatencies} className={cn("shrink-0", STATUS_TEXT[key])} />
        <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}
