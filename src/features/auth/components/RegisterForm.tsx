"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/useHydrated";
import { useRegister } from "../hooks/useRegister";

export default function RegisterForm() {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const { register, loading, fieldErrors } = useRegister();
  const router = useRouter();
  // Antes de hidratar, un clic enviaría el formulario de forma nativa y se perdería.
  const hydrated = useHydrated();
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (await register(form)) {
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Un administrador deberá asignarte permisos antes de que puedas usar la plataforma.
        </p>
      </header>
      <FormField id="email" label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={fieldErrors.email} />
      <FormField
        id="username"
        label="Nombre de usuario"
        autoComplete="username"
        autoCapitalize="none"
        value={form.username}
        onChange={set("username")}
        error={fieldErrors.username}
      />
      <FormField
        id="password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        value={form.password}
        onChange={set("password")}
        error={fieldErrors.password}
      />
      <Button type="submit" disabled={loading || !hydrated} className="w-full">
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta? <Link href="/login">Iniciar sesión</Link>
      </p>
    </form>
  );
}
