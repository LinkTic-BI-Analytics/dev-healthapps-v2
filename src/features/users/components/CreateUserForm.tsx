"use client";

import { useState } from "react";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_LABEL, type RoleCode } from "@/features/auth/constants/roles";
import { useCreateUser } from "../hooks/useCreateUser";

const EMPTY = { email: "", username: "", password: "" };

/** Formulario de creación de usuarios. `assignableRoles` depende del rol de quien crea. */
export default function CreateUserForm({ assignableRoles }: { assignableRoles: RoleCode[] }) {
  const [form, setForm] = useState(EMPTY);
  const [role, setRole] = useState<RoleCode>(assignableRoles.includes("nuevo") ? "nuevo" : assignableRoles[0]);
  const { create, loading, fieldErrors } = useCreateUser();
  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (await create({ ...form, role })) setForm(EMPTY);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 md:grid-cols-2">
      <FormField id="email" label="Email" type="email" autoComplete="off" value={form.email} onChange={set("email")} error={fieldErrors.email} />
      <FormField
        id="username"
        label="Nombre de usuario"
        autoComplete="off"
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role">Rol</Label>
        <Select value={role} onValueChange={(v) => setRole(v as RoleCode)}>
          <SelectTrigger id="role" className="w-full" aria-invalid={!!fieldErrors.role}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {assignableRoles.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABEL[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.role && <p className="text-xs text-destructive">{fieldErrors.role}</p>}
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? "Creando…" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}
