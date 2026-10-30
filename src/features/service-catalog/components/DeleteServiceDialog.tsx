"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Botón de eliminar con confirmación. El diálogo queda abierto mientras se elimina y se cierra
 * solo si la eliminación tuvo éxito (`onConfirm` devuelve `true`).
 */
export default function DeleteServiceDialog({
  serviceName,
  onConfirm,
  compact = false,
}: {
  serviceName: string;
  onConfirm: () => Promise<boolean>;
  /** `true`: solo el icono (listado); `false`: botón con texto (edición). */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    setDeleting(true);
    const ok = await onConfirm();
    setDeleting(false);
    if (ok) setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !deleting && setOpen(v)}>
      <AlertDialogTrigger asChild>
        {compact ? (
          <Button variant="outline" size="icon" aria-label={`Eliminar ${serviceName}`} className="text-destructive">
            <Trash2 aria-hidden />
          </Button>
        ) : (
          <Button variant="destructive">
            <Trash2 aria-hidden /> Eliminar servicio
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar &quot;{serviceName}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borrarán también su historial de estados y todas sus verificaciones. Esta acción no se puede deshacer.
            Si solo quieres dejar de verificarlo, desactívalo en su lugar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <Button
            onClick={() => void confirm()}
            disabled={deleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
