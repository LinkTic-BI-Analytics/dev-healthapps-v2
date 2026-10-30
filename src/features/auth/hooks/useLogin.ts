"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { toFieldErrors, type FieldErrors } from "@/lib/field-errors";
import { notifyError } from "@/lib/notify-error";
import { AuthService } from "../services/auth.service";
import type { LoginPayload } from "../types/auth.types";
import { loginSchema } from "../utils/validation";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<LoginPayload>>({});

  /** Devuelve `true` si inició sesión. No lanza: notifica los errores. */
  async function login(payload: LoginPayload): Promise<boolean> {
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors<LoginPayload>(parsed.error));
      return false;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const user = await AuthService.login(parsed.data);
      toast.success(`Hola, ${user.username}`);
      return true;
    } catch (error) {
      notifyError(error, "No se pudo iniciar sesión. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, fieldErrors };
}
