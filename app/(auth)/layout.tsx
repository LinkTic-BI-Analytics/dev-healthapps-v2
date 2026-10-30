import { Activity } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Layout de autenticación, mobile-first: en móvil el formulario ocupa la pantalla;
 * en escritorio se reacomoda en dos columnas (marca a la izquierda, formulario a la derecha).
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh flex-1 md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-sidebar p-10 md:flex">
        <span className="flex items-center gap-2 text-lg font-semibold">
          <Activity aria-hidden className="size-6 text-status-ok" />
          Health Apps
        </span>
        <div className="flex max-w-md flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-status-ok">Centro de monitoreo</p>
          <p className="text-3xl font-semibold leading-tight">
            Saber en segundos qué servicios están operativos, degradados o caídos.
          </p>
        </div>
        <p className="text-xs text-text-subtle">© Health Apps</p>
      </aside>
      <main className="flex flex-col">
        <div className="flex items-center justify-between p-4 md:justify-end">
          <span className="flex items-center gap-2 font-semibold md:hidden">
            <Activity aria-hidden className="size-5 text-status-ok" />
            Health Apps
          </span>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-start justify-center px-4 pb-10 md:items-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
