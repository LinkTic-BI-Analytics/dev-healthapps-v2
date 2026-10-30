"use client";

import { Pencil, Plus, RotateCw } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useServices } from "../hooks/useServices";
import type { MonitoredService } from "../types/service.types";
import DeleteServiceDialog from "./DeleteServiceDialog";

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge className="bg-status-ok-tint text-status-ok">Activo</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Inactivo
    </Badge>
  );
}

function ServiceActions({
  service,
  onToggle,
  onDelete,
}: {
  service: MonitoredService;
  onToggle: (id: string, active: boolean) => Promise<boolean>;
  onDelete: (service: MonitoredService) => Promise<boolean>;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Switch
          checked={service.isActive}
          onCheckedChange={(checked) => void onToggle(service.id, checked)}
          aria-label={`${service.isActive ? "Desactivar" : "Activar"} ${service.name}`}
        />
        <span className="md:sr-only">{service.isActive ? "Activo" : "Inactivo"}</span>
      </label>
      <Button asChild variant="outline" size="icon">
        <Link href={`/servicios/${service.id}/editar`} aria-label={`Editar ${service.name}`}>
          <Pencil aria-hidden />
        </Link>
      </Button>
      <DeleteServiceDialog serviceName={service.name} onConfirm={() => onDelete(service)} compact />
    </div>
  );
}

/** Catálogo de servicios: tarjetas en móvil, tabla en escritorio. */
export default function ServiceList({ canManage }: { canManage: boolean }) {
  const { services, loading, error, reload, setActive, remove } = useServices();

  if (loading) return <p className="py-8 text-center text-sm text-muted-foreground">Cargando servicios…</p>;
  if (error)
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-muted-foreground">No se pudieron cargar los servicios.</p>
        <Button variant="outline" onClick={() => void reload()}>
          <RotateCw aria-hidden /> Reintentar
        </Button>
      </div>
    );
  if (services.length === 0)
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
        <p className="font-medium">Aún no hay servicios registrados</p>
        {canManage && (
          <Button asChild>
            <Link href="/servicios/nuevo">
              <Plus aria-hidden /> Registrar servicio
            </Link>
          </Button>
        )}
      </div>
    );

  return (
    <>
      {/* Móvil: tarjetas */}
      <ul className="flex flex-col gap-3 md:hidden">
        {services.map((s) => (
          <li key={s.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/servicios/${s.id}`} className="block truncate font-medium text-foreground hover:underline">
                  {s.name}
                </Link>
                <p className="truncate font-mono text-xs text-muted-foreground">{s.checkUrl}</p>
              </div>
              <ActiveBadge active={s.isActive} />
            </div>
            {s.description && <p className="text-sm text-text-secondary">{s.description}</p>}
            {canManage && <ServiceActions service={s} onToggle={setActive} onDelete={remove} />}
          </li>
        ))}
      </ul>

      {/* Escritorio: tabla */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Servicio</th>
              <th className="px-4 py-3 font-medium">URL de verificación</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              {canManage && <th className="px-4 py-3 text-right font-medium">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/servicios/${s.id}`} className="font-medium text-foreground hover:underline">
                    {s.name}
                  </Link>
                  {s.description && <p className="line-clamp-1 text-xs text-muted-foreground">{s.description}</p>}
                </td>
                <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-text-secondary">{s.checkUrl}</td>
                <td className="px-4 py-3">
                  <ActiveBadge active={s.isActive} />
                </td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <ServiceActions service={s} onToggle={setActive} onDelete={remove} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
