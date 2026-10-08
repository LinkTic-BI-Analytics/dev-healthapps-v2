"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo } from "react";
import { configureApiSession } from "@/lib/api-fetch";
import type { PermissionCode } from "../constants/permissions";
import { AuthService } from "../services/auth.service";
import type { AuthUser } from "../types/auth.types";

type AuthContextValue = {
  user: AuthUser;
  hasPermission: (permission: PermissionCode) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Usuario autenticado (validado en el servidor) y renovación automática de sesión para apiFetch. */
export default function AuthProvider({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const goToLogin = () => {
      const callbackUrl = window.location.pathname + window.location.search;
      router.replace(`/login?expired=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      router.refresh();
    };
    configureApiSession({
      refresh: () =>
        AuthService.refresh().then(
          () => true,
          () => false,
        ),
      onSessionExpired: goToLogin,
    });
    return () => configureApiSession(null);
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, hasPermission: (permission) => user.permissions.includes(permission) }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return ctx;
}
