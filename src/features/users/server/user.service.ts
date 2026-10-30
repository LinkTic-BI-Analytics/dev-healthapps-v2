import "server-only";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import { ASSIGNABLE_ROLES } from "@/features/auth/constants/roles";
import { createUserRecord } from "@/features/auth/server/auth.service";
import type { AuthUser, CreatedUser, CreateUserPayload } from "@/features/auth/types/auth.types";

/**
 * Crea un usuario en nombre de `actor` (requiere `users.create`, validado en el Route Handler).
 * Reglas: solo un superadmin crea superadmins; un admin crea admins y usuarios nuevos.
 */
export async function createUser(actor: AuthUser, payload: CreateUserPayload): Promise<CreatedUser> {
  if (!ASSIGNABLE_ROLES[actor.role].includes(payload.role)) {
    throw new HttpError(403, `Tu rol no puede crear usuarios con el rol "${payload.role}".`);
  }
  const role = await db.role.findUnique({ where: { code: payload.role } });
  if (!role) throw new HttpError(400, "El rol seleccionado no existe.");

  const user = await createUserRecord({
    email: payload.email,
    username: payload.username,
    password: payload.password,
    roleId: role.id,
    createdById: actor.id,
  });
  return { id: user.id, email: user.email, username: user.username, role: payload.role };
}
