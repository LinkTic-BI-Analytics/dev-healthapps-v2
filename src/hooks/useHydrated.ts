"use client";

import { useSyncExternalStore } from "react";

/**
 * `true` cuando el componente ya se hidrató en el navegador. Sirve para deshabilitar acciones
 * que dependen de JavaScript (p. ej. enviar un formulario) mientras la página aún carga.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
