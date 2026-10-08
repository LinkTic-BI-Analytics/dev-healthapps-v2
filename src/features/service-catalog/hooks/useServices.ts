"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { notifyError } from "@/lib/notify-error";
import { ServiceCatalogService } from "../services/service-catalog.service";
import type { MonitoredService } from "../types/service.types";

type ListState = { services: MonitoredService[]; loading: boolean; error: boolean };

/** Listado de servicios con activación/desactivación. */
export function useServices() {
  const [state, setState] = useState<ListState>({ services: [], loading: true, error: false });
  const [version, setVersion] = useState(0);

  // El estado solo cambia en los callbacks de la petición, nunca de forma síncrona en el efecto.
  useEffect(() => {
    let cancelled = false;
    ServiceCatalogService.getAll().then(
      (services) => !cancelled && setState({ services, loading: false, error: false }),
      (err) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: true }));
        notifyError(err, "No se pudieron cargar los servicios.");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [version]);

  function reload() {
    setState((s) => ({ ...s, loading: true }));
    setVersion((v) => v + 1);
  }

  async function setActive(id: string, isActive: boolean): Promise<boolean> {
    try {
      const updated = await ServiceCatalogService.update(id, { isActive });
      setState((s) => ({ ...s, services: s.services.map((x) => (x.id === id ? updated : x)) }));
      toast.success(isActive ? `${updated.name} activado` : `${updated.name} desactivado: ya no se verificará`);
      return true;
    } catch (err) {
      notifyError(err, "No se pudo actualizar el servicio.");
      return false;
    }
  }

  /** Elimina el servicio; la lista se actualiza en memoria (convención de borrados). */
  async function remove(service: MonitoredService): Promise<boolean> {
    try {
      await ServiceCatalogService.remove(service.id);
      setState((s) => ({ ...s, services: s.services.filter((x) => x.id !== service.id) }));
      toast.success(`${service.name} eliminado`);
      return true;
    } catch (err) {
      notifyError(err, "No se pudo eliminar el servicio.");
      return false;
    }
  }

  return { ...state, reload, setActive, remove };
}
