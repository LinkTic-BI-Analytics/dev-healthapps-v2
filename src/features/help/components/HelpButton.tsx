"use client";

import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Botón "?" que abre la ayuda de la pantalla. Las explicaciones viven solo aquí, para mantener
 * la interfaz limpia (WI-023). El contenido se desplaza dentro del diálogo en pantallas pequeñas.
 */
export default function HelpButton({
  title,
  summary,
  children,
}: {
  title: string;
  /** Una frase que resume la pantalla. */
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label={`Ayuda: ${title}`} title="Ayuda">
          <CircleHelp aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-5">
          <DialogTitle className="flex items-center gap-2">
            <CircleHelp aria-hidden className="size-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{summary}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 overflow-y-auto p-5 text-sm leading-relaxed text-text-secondary">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
