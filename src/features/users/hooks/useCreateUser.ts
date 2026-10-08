"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { CreatedUser, CreateUserPayload } from "@/features/auth/types/auth.types";
import { createUserSchema } from "@/features/auth/utils/validation";
import { toFieldErrors, type FieldErrors } from "@/lib/field-errors";
import { notifyError } from "@/lib/notify-error";
import { UserService } from "../services/user.service";

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<CreateUserPayload>>({});

  /** Devuelve el usuario creado o `null`. No lanza: notifica los errores. */
  async function create(payload: CreateUserPayload): Promise<CreatedUser | null> {
    const parsed = createUserSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors<CreateUserPayload>(parsed.error));
      return null;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const user = await UserService.create(parsed.data);
      toast.success(`Usuario ${user.username} creado`);
      return user;
    } catch (error) {
      notifyError(error, "No se pudo crear el usuario. Intenta de nuevo.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { create, loading, fieldErrors };
}
