"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { toFieldErrors, type FieldErrors } from "@/lib/field-errors";
import { notifyError } from "@/lib/notify-error";
import { AuthService } from "../services/auth.service";
import type { RegisterPayload } from "../types/auth.types";
import { registerSchema } from "../utils/validation";

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterPayload>>({});

  /** Devuelve `true` si creó la cuenta (queda con sesión iniciada y rol `nuevo`). */
  async function register(payload: RegisterPayload): Promise<boolean> {
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors<RegisterPayload>(parsed.error));
      return false;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await AuthService.register(parsed.data);
      toast.success("Cuenta creada");
      return true;
    } catch (error) {
      notifyError(error, "No se pudo crear la cuenta. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { register, loading, fieldErrors };
}
