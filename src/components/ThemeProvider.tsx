"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Clave de `localStorage` donde se guarda la preferencia de tema (prefijo `health_apps_`). */
export const THEME_STORAGE_KEY = "health_apps_theme";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
