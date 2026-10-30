// Sin "server-only": lo usan prisma/seed.ts (fuera de Next) y las pruebas de integración.
import type { PrismaClient } from "@/generated/prisma/client";
import { PERMISSION_DESCRIPTIONS, type PermissionCode } from "../constants/permissions";
import { ROLE_DEFINITIONS, ROLES, type RoleCode } from "../constants/roles";
import { hashPassword } from "./crypto";

/**
 * Siembra roles y permisos de forma idempotente.
 * - admin recibe todos los permisos del catálogo.
 * - superadmin no necesita filas en role_permissions: siempre tiene acceso total.
 * - nuevo no tiene permisos.
 */
export async function seedRolesAndPermissions(db: PrismaClient): Promise<void> {
  for (const [code, def] of Object.entries(ROLE_DEFINITIONS) as [RoleCode, (typeof ROLE_DEFINITIONS)[RoleCode]][]) {
    await db.role.upsert({
      where: { code },
      create: { code, name: def.name, description: def.description },
      update: { name: def.name, description: def.description },
    });
  }
  for (const [code, description] of Object.entries(PERMISSION_DESCRIPTIONS) as [PermissionCode, string][]) {
    await db.permission.upsert({ where: { code }, create: { code, description }, update: { description } });
  }

  const admin = await db.role.findUniqueOrThrow({ where: { code: ROLES.ADMIN } });
  const permissions = await db.permission.findMany({ select: { id: true } });
  await db.rolePermission.createMany({
    data: permissions.map((p) => ({ roleId: admin.id, permissionId: p.id })),
    skipDuplicates: true,
  });
}

/** Crea el primer superadmin si no existe (no modifica uno existente). */
export async function seedSuperadmin(
  db: PrismaClient,
  input: { email: string; username: string; password: string },
): Promise<{ created: boolean }> {
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  const existing = await db.user.findFirst({ where: { OR: [{ email }, { username }] }, select: { id: true } });
  if (existing) return { created: false };
  const role = await db.role.findUniqueOrThrow({ where: { code: ROLES.SUPERADMIN } });
  await db.user.create({
    data: { email, username, passwordHash: await hashPassword(input.password), roleId: role.id },
  });
  return { created: true };
}
