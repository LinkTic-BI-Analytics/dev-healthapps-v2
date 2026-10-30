"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { notifyError } from "@/lib/notify-error";
import { ChecksService } from "../services/checks.service";
import type { ManualCheckSummary } from "../types/check.types";

function describe(s: ManualCheckSummary): string {
  if (s.total === 0) {
    return s.recent > 0 ? "Los servicios se verificaron hace unos segundos." : "No hay servicios activos para verificar.";
  }
  const parts = [`${s.success} OK`, s.failure > 0 && `${s.failure} con fallo`, s.skipped > 0 && `${s.skipped} omitidos`].filter(Boolean);
  return `${s.total} ${s.total === 1 ? "servicio verificado" : "servicios verificados"}: ${parts.join(", ")}.`;
}

/** Lanza la verificación manual de todos los servicios y avisa el resultado. */
export function useRunChecks(onDone?: () => void) {
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    try {
      const summary = await ChecksService.runAll();
      if (summary.failure > 0) toast.error(describe(summary));
      else toast.success(describe(summary));
      onDone?.();
    } catch (err) {
      notifyError(err, "No se pudieron verificar los servicios.");
    } finally {
      setRunning(false);
    }
  }

  return { running, run };
}
