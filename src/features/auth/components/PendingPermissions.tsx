"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "../hooks/useLogout";
import type { AuthUser } from "../types/auth.types";

/** Pantalla para usuarios con rol `nuevo` (sin permisos). */
export default function PendingPermissions({ user }: { user: AuthUser }) {
  const { logout, loading } = useLogout();
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-6">
      <section className="flex max-w-md flex-col items-center gap-4 text-center">
        <Clock aria-hidden className="size-10 text-status-warn" />
        <h1 className="text-2xl font-bold">Tu cuenta está pendiente de permisos</h1>
        <p className="text-sm text-muted-foreground">
          Hola, <strong className="text-foreground">{user.username}</strong>. Tu cuenta ya fue creada, pero todavía no
          tiene permisos. Un administrador debe asignártelos para que puedas usar Health Apps.
        </p>
        <Button variant="outline" disabled={loading} onClick={() => void logout("current")}>
          Cerrar sesión
        </Button>
      </section>
    </main>
  );
}
