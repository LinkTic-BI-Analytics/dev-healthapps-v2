import { SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <SearchX aria-hidden className="size-10 text-muted-foreground" />
      <h1 className="text-2xl font-bold">No encontrado</h1>
      <p className="text-sm text-muted-foreground">El servicio o la página que buscas no existe.</p>
      <Button asChild variant="outline">
        <Link href="/">Volver al panel</Link>
      </Button>
    </section>
  );
}
