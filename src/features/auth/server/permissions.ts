import type { PermissionCode } from "../constants/permissions";
import { ROLES, type RoleCode } from "../constants/roles";

/**
 * Permisos efectivos:
 * - superadmin: todos los del catálogo, siempre (no se le pueden revocar).
 * - otro rol: los de su rol menos los revocados al usuario.
 * - nuevo: ninguno (su rol no tiene permisos).
 */
export function computeEffectivePermissions(input: {
  role: RoleCode;
  rolePermissions: string[];
  revokedPermissions: string[];
  allPermissions: string[];
}): PermissionCode[] {
  if (input.role === ROLES.SUPERADMIN) return [...new Set(input.allPermissions)].sort() as PermissionCode[];
  const revoked = new Set(input.revokedPermissions);
  return [...new Set(input.rolePermissions.filter((p) => !revoked.has(p)))].sort() as PermissionCode[];
}
