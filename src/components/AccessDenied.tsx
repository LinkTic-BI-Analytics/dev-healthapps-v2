import { ShieldX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccessDenied({ message = "No tienes permiso para ver esta página." }: { message?: string }) {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <ShieldX aria-hidden className="size-10 text-status-down" />
      <h1 className="text-2xl font-bold">Acceso denegado</h1>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button asChild variant="outline">
        <Link href="/">Volver al panel</Link>
      </Button>
    </section>
  );
}
