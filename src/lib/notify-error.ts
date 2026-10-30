import toast from "react-hot-toast";
import { getErrorMessages, isApiError } from "@/types/api-error.type";

/** Un toast por mensaje del API; si el error no es un ApiError, muestra `fallback`. */
export function notifyError(error: unknown, fallback: string): void {
  if (isApiError(error)) getErrorMessages(error).forEach((m) => toast.error(m));
  else toast.error(fallback);
}
