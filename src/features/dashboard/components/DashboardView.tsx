"use client";

import { Plus, RotateCw } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, MotionConfig, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import PanelHelp from "@/features/help/content/PanelHelp";
import { formatRelativeTime } from "@/lib/format";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { HealthStatus } from "@/types/health-status.type";
import { useDashboard } from "../hooks/useDashboard";
import HealthOverview from "./HealthOverview";
import ServiceHealthCard from "./ServiceHealthCard";

type Filter = "todos" | HealthStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "caido", label: "Caídos" },
  { key: "degradado", label: "Degradados" },
  { key: "operativo", label: "Operativos" },
];

/** Confeti para celebrar que un servicio se recuperó (no se dispara con "reducir movimiento"). */
async function celebrate() {
  if (prefersReducedMotion()) return;
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#3dd68c", "#4fd1e8", "#f5c451", "#e8edf0"];
  confetti({ particleCount: 90, spread: 75, startVelocity: 38, origin: { y: 0.25 }, colors, disableForReducedMotion: true });
}

/** Panel general: indicadores globales y una tarjeta por servicio activo, con animaciones (WI-024). */
export default function DashboardView({ canManage }: { canManage: boolean }) {
  const { data, loading, error, refreshing, refresh, changes } = useDashboard();
  const [filter, setFilter] = useState<Filter>("todos");
  const celebrated = useRef(new Set<string>());
  // Con "reducir movimiento" todo se muestra directamente en su estado final.
  const reduced = useReducedMotion() ?? false;

  // Celebra cada recuperación una sola vez.
  useEffect(() => {
    const recovered = [...changes.entries()].filter(([id, c]) => c.kind === "recovered" && !celebrated.current.has(id));
    if (recovered.length === 0) return;
    recovered.forEach(([id, c]) => {
      celebrated.current.add(id);
      toast.success(`🎉 ${c.name} se recuperó`);
    });
    void celebrate();
  }, [changes]);
  useEffect(() => {
    if (changes.size === 0) celebrated.current.clear();
  }, [changes]);

  if (loading)
    return (
      <div className="flex flex-col gap-5" aria-busy="true">
        <p className="sr-only">Cargando el estado de los servicios…</p>
        <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,22rem)_1fr]">
          <div className="h-44 animate-pulse rounded-2xl bg-muted" />
          <div className="grid gap-3 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  if (error || !data)
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">No se pudo cargar el estado de los servicios.</p>
        <Button variant="outline" onClick={refresh}>
          <RotateCw aria-hidden /> Reintentar
        </Button>
      </div>
    );

  const now = new Date(data.generatedAt);
  const visible = data.services.filter((s) => filter === "todos" || s.healthStatus === filter);
  const count = (f: Filter) => (f === "todos" ? data.services.length : data.counts[f]);

  return (
    <MotionConfig reducedMotion="user">
      <section className="flex flex-col gap-5">
        <header className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <p className="font-mono text-xs text-text-subtle">Actualizado {formatRelativeTime(data.generatedAt)}</p>
            <h1 className="text-3xl font-bold tracking-tight">Panel</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refresh} disabled={refreshing} aria-label="Actualizar el panel">
              <motion.span animate={{ rotate: refreshing ? 360 : 0 }} transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0 }}>
                <RotateCw aria-hidden />
              </motion.span>
            </Button>
            <PanelHelp />
          </div>
        </header>

        {data.services.length === 0 ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center"
          >
            <p className="font-medium">Todavía no hay servicios monitoreados</p>
            {canManage && (
              <Button asChild>
                <Link href="/servicios/nuevo">
                  <Plus aria-hidden /> Registrar servicio
                </Link>
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,22rem)_1fr] xl:items-start">
            <div className="xl:sticky xl:top-8">
              <HealthOverview counts={data.counts} />
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <LayoutGroup id="filters">
                <div role="group" aria-label="Filtrar por estado" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
                  {FILTERS.map((f) => {
                    const active = filter === f.key;
                    return (
                      <motion.button
                        key={f.key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setFilter(f.key)}
                        whileTap={{ scale: 0.94 }}
                        className={cn(
                          "relative flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                          active ? "border-foreground text-background" : "text-text-secondary hover:bg-accent",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="filter-pill"
                            className="absolute inset-0 rounded-full bg-foreground"
                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          />
                        )}
                        <span className="relative">{f.label}</span>
                        <span className="relative font-mono text-xs opacity-70">{count(f.key)}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </LayoutGroup>
              {visible.length === 0 ? (
                <motion.p
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground"
                >
                  Ningún servicio en este estado.
                </motion.p>
              ) : (
                <motion.ul layout className="grid gap-3 md:grid-cols-2">
                  <AnimatePresence mode="popLayout" initial>
                    {visible.map((s, i) => (
                      <motion.li
                        key={s.id}
                        layout
                        initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                        transition={{ type: "spring", stiffness: 300, damping: 28, delay: Math.min(i, 10) * 0.05 }}
                      >
                        <ServiceHealthCard service={s} now={now} change={changes.get(s.id)} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </div>
          </div>
        )}
      </section>
    </MotionConfig>
  );
}
