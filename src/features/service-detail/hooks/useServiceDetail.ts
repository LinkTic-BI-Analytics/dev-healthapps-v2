"use client";

import { useEffect, useState } from "react";
import { notifyError } from "@/lib/notify-error";
import { ServiceDetailService } from "../services/service-detail.service";
import type { DetailRange, ServiceDetailData } from "../types/service-detail.types";

const POLL_MS = 30_000;

type State = { data: ServiceDetailData | null; loading: boolean; error: boolean };

/** Detalle de un servicio con actualización periódica y cambio de rango. */
export function useServiceDetail(id: string) {
  const [range, setRange] = useState<DetailRange>("1h");
  const [state, setState] = useState<State>({ data: null, loading: true, error: false });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    ServiceDetailService.get(id, range).then(
      (data) => !cancelled && setState({ data, loading: false, error: false }),
      (err) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: s.data === null }));
        notifyError(err, "No se pudo cargar el detalle del servicio.");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, range, version]);

  useEffect(() => {
    const t = window.setInterval(() => document.visibilityState === "visible" && setVersion((v) => v + 1), POLL_MS);
    return () => window.clearInterval(t);
  }, []);

  return { ...state, range, setRange, refresh: () => setVersion((v) => v + 1) };
}
