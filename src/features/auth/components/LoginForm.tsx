"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/useHydrated";
import { useLogin } from "../hooks/useLogin";

export default function LoginForm({ callbackUrl, expired }: { callbackUrl: string; expired?: boolean }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, fieldErrors } = useLogin();
  const router = useRouter();
  // Antes de hidratar, un clic enviaría el formulario de forma nativa y se perdería.
  const hydrated = useHydrated();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (await login({ identifier, password })) {
      // refresh(): el layout del servidor vuelve a leer la sesión recién creada.
      router.replace(callbackUrl);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
      </header>
      {expired && (
        <p role="status" className="rounded-md bg-status-warn-tint px-3 py-2 text-sm text-status-warn">
          Tu sesión expiró. Inicia sesión de nuevo.
        </p>
      )}
      <FormField
        id="identifier"
        label="Email o usuario"
        autoComplete="username"
        autoCapitalize="none"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        error={fieldErrors.identifier}
      />
      <FormField
        id="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
      />
      <Button type="submit" disabled={loading || !hydrated} className="w-full">
        {loading ? "Ingresando…" : "Iniciar sesión"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta? <Link href="/registro">Crear cuenta</Link>
      </p>
    </form>
  );
}
