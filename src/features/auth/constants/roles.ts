/** Roles del sistema. Su gestión (UI) llegará con el módulo de roles; hoy se siembran con `pnpm db:seed`. */
export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  NUEVO: "nuevo",
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_DEFINITIONS: Record<RoleCode, { name: string; description: string }> = {
  superadmin: { name: "Superadministrador", description: "Acceso total. Sus permisos no se pueden revocar." },
  admin: { name: "Administrador", description: "Mismos permisos que superadmin; se le pueden revocar permisos." },
  nuevo: { name: "Nuevo", description: "Sin permisos. Rol asignado en el autorregistro." },
};

export const ROLE_LABEL: Record<RoleCode, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  nuevo: "Nuevo",
};

/** Roles que puede asignar cada rol al crear un usuario. */
export const ASSIGNABLE_ROLES: Record<RoleCode, RoleCode[]> = {
  superadmin: ["superadmin", "admin", "nuevo"],
  admin: ["admin", "nuevo"],
  nuevo: [],
};

export function isRoleCode(value: string): value is RoleCode {
  return (Object.values(ROLES) as string[]).includes(value);
}
