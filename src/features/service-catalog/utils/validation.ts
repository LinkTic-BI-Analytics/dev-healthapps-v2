import { z } from "zod";
import { THRESHOLD_LIMITS } from "../constants/thresholds";

const name = z
  .string({ error: "El nombre es obligatorio." })
  .trim()
  .min(1, { error: "El nombre es obligatorio." })
  .max(100, { error: "El nombre debe tener máximo 100 caracteres." });

/** Descripción opcional: el texto vacío se guarda como `null`. */
const description = z
  .string()
  .trim()
  .max(500, { error: "La descripción debe tener máximo 500 caracteres." })
  .nullish()
  .transform((v) => (v ? v : null));

const checkUrl = z
  .string({ error: "La URL de verificación es obligatoria." })
  .trim()
  .min(1, { error: "La URL de verificación es obligatoria." })
  .pipe(
    z.url({
      protocol: /^https?$/,
      error: "Ingresa una URL válida que empiece por http:// o https:// (p. ej. https://api.ejemplo.com/health).",
    }),
  );

/** Entero positivo dentro de límites; acepta números o texto de un input (vacío = valor por defecto). */
function threshold(label: string, { min, max }: { min: number; max: number }) {
  return z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() === "" ? undefined : Number(v)) : v),
    z
      .number({ error: `${label} debe ser un número.` })
      .int({ error: `${label} debe ser un número entero.` })
      .min(min, { error: `${label} debe ser mayor o igual a ${min}.` })
      .max(max, { error: `${label} debe ser menor o igual a ${max.toLocaleString("es-CO")}.` })
      .optional(),
  );
}

const degradedResponseTimeMs = threshold("El tiempo de respuesta máximo", THRESHOLD_LIMITS.degradedResponseTimeMs);
const downAfterFailures = threshold("Los fallos consecutivos", THRESHOLD_LIMITS.downAfterFailures);
const checkIntervalSeconds = threshold("La frecuencia de verificación", THRESHOLD_LIMITS.checkIntervalSeconds);
const timeoutMs = threshold("El tiempo de espera", THRESHOLD_LIMITS.timeoutMs);

export const createServiceSchema = z.object({
  name,
  description,
  checkUrl,
  degradedResponseTimeMs,
  downAfterFailures,
  checkIntervalSeconds,
  timeoutMs,
});

export const updateServiceSchema = z
  .object({
    name,
    description,
    checkUrl,
    degradedResponseTimeMs,
    downAfterFailures,
    checkIntervalSeconds,
    timeoutMs,
    isActive: z.boolean({ error: "El estado debe ser verdadero o falso." }),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, { error: "No hay cambios para guardar." });

export const serviceIdSchema = z.uuid({ error: "El identificador del servicio no es válido." });

export function validationMessages(error: z.ZodError): string[] {
  return [...new Set(error.issues.map((issue) => issue.message))];
}
