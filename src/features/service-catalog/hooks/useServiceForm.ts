"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { toFieldErrors, type FieldErrors } from "@/lib/field-errors";
import { notifyError } from "@/lib/notify-error";
import { ServiceCatalogService } from "../services/service-catalog.service";
import type { MonitoredService, ServiceFormPayload } from "../types/service.types";
import { createServiceSchema } from "../utils/validation";

/** Crea o edita un servicio. Devuelve el servicio guardado o `null` (no lanza). */
export function useServiceForm(serviceId?: string) {
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ServiceFormPayload>>({});

  async function save(payload: ServiceFormPayload): Promise<MonitoredService | null> {
    const parsed = createServiceSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors<ServiceFormPayload>(parsed.error));
      return null;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      const saved = serviceId
        ? await ServiceCatalogService.update(serviceId, parsed.data)
        : await ServiceCatalogService.create(parsed.data);
      toast.success(serviceId ? "Servicio actualizado" : "Servicio registrado");
      return saved;
    } catch (err) {
      notifyError(err, "No se pudo guardar el servicio.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  return { save, saving, fieldErrors };
}
