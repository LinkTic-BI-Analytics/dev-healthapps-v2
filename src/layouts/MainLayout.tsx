"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { isActive, visibleNavItems } from "./navigation";

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
      <Activity aria-hidden className="size-5 text-status-ok" />
      Health Apps
    </Link>
  );
}

/**
 * Layout principal mobile-first.
 * Móvil: encabezado compacto + contenido en una columna + navegación inferior.
 * Escritorio (md): barra lateral fija; el contenido se reacomoda con ancho máximo.
 */
export default function MainLayout({
  children,
  headerSlot,
  sidebarFooterSlot,
  permissions,
}: {
  children: React.ReactNode;
  /** Contenido extra del encabezado (p. ej. menú de usuario). */
  headerSlot?: React.ReactNode;
  /** Contenido extra al pie de la barra lateral en escritorio. */
  sidebarFooterSlot?: React.ReactNode;
  /** Permisos efectivos del usuario: filtran la navegación. */
  permissions?: readonly string[];
}) {
  const pathname = usePathname();
  const navItems = visibleNavItems(permissions);

  return (
    <div className="flex min-h-dvh flex-1">
      {/* Barra lateral: solo escritorio */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r bg-sidebar p-4 md:flex">
        <Brand />
        <nav aria-label="Navegación principal" className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-sidebar-accent",
                  active && "bg-sidebar-accent text-primary",
                )}
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          {sidebarFooterSlot}
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Encabezado: solo móvil */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b bg-background/90 px-4 backdrop-blur md:hidden">
          <Brand />
          <div className="flex items-center gap-2">
            {headerSlot}
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-24 md:px-8 md:pt-8 md:pb-8">{children}</main>

        {/* Navegación inferior: solo móvil */}
        <nav
          aria-label="Navegación principal"
          className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 min-w-16 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground",
                  active && "text-primary",
                )}
              >
                <Icon aria-hidden className="size-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
