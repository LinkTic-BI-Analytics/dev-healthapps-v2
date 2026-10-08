"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DEFAULT_THRESHOLDS } from "../constants/thresholds";
import { useServiceForm } from "../hooks/useServiceForm";
import type { MonitoredService, ServiceFormPayload } from "../types/service.types";

/** Formulario de alta y edición de servicios. */
export default function ServiceForm({ service }: { service?: MonitoredService }) {
  const router = useRouter();
  const [form, setForm] = useState<ServiceFormPayload>({
    name: service?.name ?? "",
    description: service?.description ?? "",
    checkUrl: service?.checkUrl ?? "",
    degradedResponseTimeMs: String(service?.degradedResponseTimeMs ?? DEFAULT_THRESHOLDS.degradedResponseTimeMs),
    downAfterFailures: String(service?.downAfterFailures ?? DEFAULT_THRESHOLDS.downAfterFailures),
    checkIntervalSeconds: String(service?.checkIntervalSeconds ?? DEFAULT_THRESHOLDS.checkIntervalSeconds),
    timeoutMs: String(service?.timeoutMs ?? DEFAULT_THRESHOLDS.timeoutMs),
  });
  const { save, saving, fieldErrors } = useServiceForm(service?.id);
  const set = (key: keyof ServiceFormPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (await save(form)) {
      router.push("/servicios");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 md:grid-cols-2">
      <FormField id="name" label="Nombre" value={form.name} onChange={set("name")} error={fieldErrors.name} />
      <FormField
        id="checkUrl"
        label="URL de verificación"
        type="url"
        inputMode="url"
        placeholder="https://api.ejemplo.com/health"
        value={form.checkUrl}
        onChange={set("checkUrl")}
        error={fieldErrors.checkUrl}
      />
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <textarea
          id="description"
          rows={3}
          value={form.description}
          onChange={set("description")}
          aria-invalid={!!fieldErrors.description}
          className="min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm dark:bg-input/30"
        />
        {fieldErrors.description && <p className="text-xs text-destructive">{fieldErrors.description}</p>}
      </div>
      <fieldset className="grid gap-4 rounded-lg border p-4 md:col-span-2 md:grid-cols-2">
        <legend className="px-1 text-sm font-medium">Parámetros esperados</legend>
        <FormField
          id="degradedResponseTimeMs"
          label="Tiempo de respuesta máximo (ms)"
          type="number"
          inputMode="numeric"
          min={1}
          value={form.degradedResponseTimeMs}
          onChange={set("degradedResponseTimeMs")}
          error={fieldErrors.degradedResponseTimeMs}
        />
        <FormField
          id="downAfterFailures"
          label="Fallos consecutivos para fuera de servicio"
          type="number"
          inputMode="numeric"
          min={1}
          value={form.downAfterFailures}
          onChange={set("downAfterFailures")}
          error={fieldErrors.downAfterFailures}
        />
      </fieldset>
      <fieldset className="grid gap-4 rounded-lg border p-4 md:col-span-2 md:grid-cols-2">
        <legend className="px-1 text-sm font-medium">Verificación</legend>
        <FormField
          id="checkIntervalSeconds"
          label="Frecuencia (segundos)"
          type="number"
          inputMode="numeric"
          min={10}
          value={form.checkIntervalSeconds}
          onChange={set("checkIntervalSeconds")}
          error={fieldErrors.checkIntervalSeconds}
        />
        <FormField
          id="timeoutMs"
          label="Tiempo de espera (ms)"
          type="number"
          inputMode="numeric"
          min={100}
          value={form.timeoutMs}
          onChange={set("timeoutMs")}
          error={fieldErrors.timeoutMs}
        />
      </fieldset>
      <div className="flex flex-col-reverse gap-2 md:col-span-2 md:flex-row">
        <Button asChild variant="outline">
          <Link href="/servicios">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : service ? "Guardar cambios" : "Registrar servicio"}
        </Button>
      </div>
    </form>
  );
}
