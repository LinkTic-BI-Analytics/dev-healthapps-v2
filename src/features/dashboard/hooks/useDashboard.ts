"use client";

import { useEffect, useRef, useState } from "react";
import { notifyError } from "@/lib/notify-error";
import { DashboardService } from "../services/dashboard.service";
import type { DashboardData } from "../types/dashboard.types";
import { diffStatuses, statusSnapshot, type StatusChange } from "../utils/status-changes";

/** Cada cuánto se actualiza el panel mientras la pestaña está visible. */
export const DASHBOARD_POLL_MS = 30_000;
/** Cuánto se resalta una tarjeta cuyo estado cambió. */
export const CHANGE_HIGHLIGHT_MS = 8_000;

type State = {
  data: DashboardData | null;
  loading: boolean;
  error: boolean;
  refreshing: boolean;
  /** Servicios que cambiaron de estado en la última actualización (WI-024). */
  changes: Map<string, StatusChange>;
};

/** Estado del panel con actualización periódica (se pausa con la pestaña oculta). */
export function useDashboard() {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: false,
    refreshing: false,
    changes: new Map(),
  });
  const [version, setVersion] = useState(0);
  const previous = useRef<ReturnType<typeof statusSnapshot> | null>(null);

  // El estado solo cambia en los callbacks de la petición, nunca de forma síncrona en el efecto.
  useEffect(() => {
    let cancelled = false;
    DashboardService.get().then(
      (data) => {
        if (cancelled) return;
        const changes = previous.current ? diffStatuses(previous.current, data.services) : new Map<string, StatusChange>();
        previous.current = statusSnapshot(data.services);
        setState((s) => ({
          data,
          loading: false,
          error: false,
          refreshing: false,
          // Conserva los resaltados vigentes y agrega los nuevos.
          changes: changes.size > 0 ? new Map([...s.changes, ...changes]) : s.changes,
        }));
      },
      (err) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, refreshing: false, error: s.data === null }));
        notifyError(err, "No se pudo actualizar el panel.");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [version]);

  // Los resaltados se apagan solos después de unos segundos.
  useEffect(() => {
    if (state.changes.size === 0) return;
    const t = window.setTimeout(() => setState((s) => ({ ...s, changes: new Map() })), CHANGE_HIGHLIGHT_MS);
    return () => window.clearTimeout(t);
  }, [state.changes]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setVersion((v) => v + 1);
    }, DASHBOARD_POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && setVersion((v) => v + 1);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  function refresh() {
    setState((s) => ({ ...s, refreshing: true }));
    setVersion((v) => v + 1);
  }

  return { ...state, refresh };
}
