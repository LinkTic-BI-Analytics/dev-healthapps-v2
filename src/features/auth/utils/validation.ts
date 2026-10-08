import { z } from "zod";
import { ROLES } from "../constants/roles";

/** Email y username se comparan sin distinguir mayúsculas: se guardan en minúsculas. */
const normalized = (schema: z.ZodString) => schema.trim().toLowerCase();

export const emailSchema = normalized(z.string({ error: "El email es obligatorio." })).pipe(
  z.email({ error: "Ingresa un email válido." }),
);

export const usernameSchema = normalized(z.string({ error: "El usuario es obligatorio." })).pipe(
  z
    .string()
    .min(3, { error: "El usuario debe tener al menos 3 caracteres." })
    .max(30, { error: "El usuario debe tener máximo 30 caracteres." })
    .regex(/^[a-z0-9._-]+$/, { error: "El usuario solo puede tener letras, números, punto, guion y guion bajo." }),
);

/** Por ahora no hay reglas de contraseña: solo que no esté vacía (decisión del equipo). */
export const passwordSchema = z
  .string({ error: "La contraseña es obligatoria." })
  .min(1, { error: "La contraseña es obligatoria." })
  .max(256, { error: "La contraseña es demasiado larga." });

export const loginSchema = z.object({
  identifier: normalized(z.string({ error: "Ingresa tu email o usuario." })).pipe(
    z.string().min(1, { error: "Ingresa tu email o usuario." }),
  ),
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export const createUserSchema = registerSchema.extend({
  role: z.enum([ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.NUEVO], { error: "Selecciona un rol válido." }),
});

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

/** Mensajes de validación en el formato de `ApiError.message` (uno por problema). */
export function validationMessages(error: z.ZodError): string[] {
  return [...new Set(error.issues.map((issue) => issue.message))];
}
