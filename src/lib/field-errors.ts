import type { z } from "zod";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Primer mensaje de validación por campo, para mostrarlo debajo de cada input. */
export function toFieldErrors<T>(error: z.ZodError): FieldErrors<T> {
  const out: FieldErrors<T> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof T | undefined;
    if (key !== undefined && !out[key]) out[key] = issue.message;
  }
  return out;
}
