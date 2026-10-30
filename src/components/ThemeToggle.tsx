"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/useHydrated";

const ORDER = ["system", "light", "dark"] as const;
type ThemeOption = (typeof ORDER)[number];

const LABEL: Record<ThemeOption, string> = {
  system: "Tema del sistema",
  light: "Tema claro",
  dark: "Tema oscuro",
};

const ICON = { system: Monitor, light: Sun, dark: Moon };

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // El tema elegido solo se conoce en el cliente: antes de hidratar se muestra "sistema".
  const mounted = useHydrated();
  const current: ThemeOption = mounted && ORDER.includes(theme as ThemeOption) ? (theme as ThemeOption) : "system";
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
  const Icon = ICON[current];

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={`${LABEL[current]}. Cambiar a ${LABEL[next].toLowerCase()}`}
      title={LABEL[current]}
    >
      <Icon aria-hidden />
    </Button>
  );
}
