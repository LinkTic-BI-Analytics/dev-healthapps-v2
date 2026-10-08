"use client";

import { ChevronsUpDown, LogOut, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABEL } from "../constants/roles";
import { useLogout } from "../hooks/useLogout";
import type { AuthUser } from "../types/auth.types";

function Initial({ username }: { username: string }) {
  return (
    <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {username.charAt(0).toUpperCase()}
    </span>
  );
}

/** Usuario actual y cierre de sesión. `compact`: solo el avatar (encabezado móvil). */
export default function UserMenu({ user, compact = false }: { user: AuthUser; compact?: boolean }) {
  const { logout, loading } = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="icon" aria-label={`Menú de ${user.username}`}>
            <Initial username={user.username} />
          </Button>
        ) : (
          <Button variant="ghost" className="h-auto w-full justify-start gap-2 px-2 py-2" aria-label={`Menú de ${user.username}`}>
            <Initial username={user.username} />
            <span className="flex min-w-0 flex-1 flex-col items-start text-left">
              <span className="truncate text-sm font-medium">{user.username}</span>
              <span className="text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</span>
            </span>
            <ChevronsUpDown aria-hidden className="text-muted-foreground" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate">{user.username}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email} · {ROLE_LABEL[user.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={loading} onSelect={() => void logout("current")}>
          <LogOut aria-hidden />
          Cerrar sesión
        </DropdownMenuItem>
        <DropdownMenuItem disabled={loading} onSelect={() => void logout("all")}>
          <MonitorSmartphone aria-hidden />
          Cerrar sesión en todos los dispositivos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
