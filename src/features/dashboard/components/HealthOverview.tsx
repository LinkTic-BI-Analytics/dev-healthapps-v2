"use client";

import { CircleCheckBig } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import AnimatedNumber from "@/components/AnimatedNumber";
import { cn } from "@/lib/utils";
import { STATUS_BG, STATUS_TEXT, STATUS_TINT } from "@/types/health-status.style";
import type { StatusCounts } from "../types/dashboard.types";

/** Indicadores globales: estado general, barra de distribución y totales por estado. */
export default function HealthOverview({ counts }: { counts: StatusCounts }) {
  const reduced = useReducedMotion() ?? false;
  const attention = counts.caido + counts.degradado;
  const allOk = attention === 0 && counts.operativo > 0;
  const worst = counts.caido ? "caido" : counts.degradado ? "degradado" : counts.operativo ? "operativo" : "none";
  const title =
    attention > 0
      ? `${attention} ${attention === 1 ? "servicio requiere" : "servicios requieren"} atención`
      : allOk
        ? "¡Todo en orden!"
        : "Sin datos de verificación todavía";
  const total = counts.operativo + counts.degradado + counts.caido + counts.sinDatos;
  const segments = [
    { key: "operativo", value: counts.operativo, className: STATUS_BG.operativo },
    { key: "degradado", value: counts.degradado, className: STATUS_BG.degradado },
    { key: "caido", value: counts.caido, className: STATUS_BG.caido },
    { key: "sinDatos", value: counts.sinDatos, className: "bg-muted-foreground/40" },
  ];
  const items = [
    { key: "operativo", label: "Operativos", value: counts.operativo },
    { key: "degradado", label: "Degradados", value: counts.degradado },
    { key: "caido", label: "Caídos", value: counts.caido },
  ] as const;

  return (
    <motion.section
      aria-label="Resumen del estado"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("flex flex-col gap-4 rounded-2xl border p-4 transition-colors duration-500 md:p-5", STATUS_TINT[worst])}
    >
      <div className="flex items-center gap-2.5">
        <AnimatePresence mode="wait" initial={false}>
          {allOk ? (
            <motion.span
              key="ok"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <CircleCheckBig aria-hidden className="size-5 text-status-ok" />
            </motion.span>
          ) : (
            <motion.span key="dot" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative flex size-2.5">
              {attention > 0 && <span aria-hidden className={cn("absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping", STATUS_BG[worst])} />}
              <span aria-hidden className={cn("relative size-2.5 rounded-full", STATUS_BG[worst])} />
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.h2
            key={title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-lg font-semibold"
          >
            {title}
          </motion.h2>
        </AnimatePresence>
      </div>
      <div aria-hidden className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted">
        {segments.map(
          (s, i) =>
            s.value > 0 && (
              <motion.div
                key={s.key}
                className={s.className}
                initial={reduced ? false : { width: 0 }}
                animate={{ width: `${(s.value / total) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
            ),
        )}
      </div>
      <dl className="grid grid-cols-3 gap-2">
        {items.map((i) => (
          <div key={i.key} className="flex flex-col gap-0.5">
            <dd className={cn("font-mono text-2xl font-semibold md:text-3xl", STATUS_TEXT[i.key])}>
              <AnimatedNumber value={i.value} />
            </dd>
            <dt className="text-xs text-muted-foreground">{i.label}</dt>
          </div>
        ))}
      </dl>
      {counts.sinDatos > 0 && (
        <p className="text-xs text-muted-foreground">
          {counts.sinDatos} {counts.sinDatos === 1 ? "servicio" : "servicios"} sin verificaciones todavía.
        </p>
      )}
    </motion.section>
  );
}
