"use client";

import { Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRunChecks } from "../hooks/useRunChecks";

/**
 * Aviso del modo `manual` (Vercel): no hay worker que verifique en segundo plano, así que los
 * datos solo se actualizan cuando alguien pulsa el botón.
 */
export default function ManualChecksNotice({ onChecked, className }: { onChecked?: () => void; className?: string }) {
  const { running, run } = useRunChecks(onChecked);

  return (
    <div
      role="note"
      className={cn("flex flex-col gap-3 rounded-2xl border border-status-warn/40 bg-status-warn-tint p-4 sm:flex-row sm:items-center", className)}
    >
      <Info aria-hidden className="size-5 shrink-0 text-status-warn" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-semibold">Monitoreo automático no disponible en este despliegue</p>
        <p className="text-sm text-text-secondary">
          Vercel no permite procesos en segundo plano, así que los servicios no se verifican solos. Pulsa{" "}
          <strong>Verificar ahora</strong> para consultar el estado de todos los endpoints.
        </p>
      </div>
      <Button onClick={run} disabled={running} className="shrink-0" aria-busy={running}>
        <RefreshCw aria-hidden className={cn(running && "animate-spin")} />
        {running ? "Verificando…" : "Verificar ahora"}
      </Button>
    </div>
  );
}
