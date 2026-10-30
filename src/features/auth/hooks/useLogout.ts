"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { notifyError } from "@/lib/notify-error";
import { AuthService } from "../services/auth.service";

/** Cierra la sesión (o todas) y navega a /login; `refresh()` vuelve a evaluar los componentes de servidor. */
export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout(scope: "current" | "all" = "current"): Promise<boolean> {
    setLoading(true);
    try {
      await (scope === "all" ? AuthService.logoutAll() : AuthService.logout());
      router.replace("/login");
      router.refresh();
      return true;
    } catch (error) {
      notifyError(error, "No se pudo cerrar la sesión. Intenta de nuevo.");
      setLoading(false);
      return false;
    }
  }

  return { logout, loading };
}
