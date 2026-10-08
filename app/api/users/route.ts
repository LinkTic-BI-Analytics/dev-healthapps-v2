import { PERMISSIONS } from "@/features/auth/constants/permissions";
import { requirePermission } from "@/features/auth/server/request";
import { createUserSchema, validationMessages } from "@/features/auth/utils/validation";
import { createUser } from "@/features/users/server/user.service";
import { handleRoute, parseJsonBody } from "@/lib/route-handler";

/** Crea un usuario (superadmin y admin). Requiere `users.create`. */
export const POST = handleRoute(async (request: Request) => {
  const actor = await requirePermission(PERMISSIONS.USERS_CREATE);
  const payload = await parseJsonBody(request, createUserSchema, validationMessages);
  const user = await createUser(actor, payload);
  return Response.json({ user }, { status: 201 });
});
