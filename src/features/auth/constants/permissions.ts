/**
 * Catálogo de permisos (`<recurso>.<acción>`). Cada feature agrega aquí los suyos;
 * `pnpm db:seed` los registra y se los asigna al rol admin. superadmin siempre los tiene todos.
 */
export const PERMISSIONS = {
  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  SERVICES_READ: "services.read",
  SERVICES_MANAGE: "services.manage",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_DESCRIPTIONS: Record<PermissionCode, string> = {
  "users.read": "Ver usuarios",
  "users.create": "Crear usuarios",
  "services.read": "Ver servicios monitoreados y su estado",
  "services.manage": "Registrar, editar y desactivar servicios monitoreados",
};
