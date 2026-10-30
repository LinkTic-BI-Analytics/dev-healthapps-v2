import { Bell, LayoutGrid, Server, UserPlus, type LucideIcon } from "lucide-react";
import { PERMISSIONS, type PermissionCode } from "@/features/auth/constants/permissions";

export type NavItem = { href: string; label: string; icon: LucideIcon; permission?: PermissionCode };

/** Secciones principales; se muestran como barra inferior en móvil y barra lateral en escritorio. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Panel", icon: LayoutGrid },
  { href: "/servicios", label: "Servicios", icon: Server, permission: PERMISSIONS.SERVICES_READ },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/usuarios/nuevo", label: "Crear usuario", icon: UserPlus, permission: PERMISSIONS.USERS_CREATE },
];

/** Solo ayuda visual: cada página y endpoint valida el permiso en el servidor. */
export function visibleNavItems(permissions: readonly string[] | undefined, items: NavItem[] = NAV_ITEMS): NavItem[] {
  return items.filter((item) => !item.permission || permissions?.includes(item.permission));
}

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
