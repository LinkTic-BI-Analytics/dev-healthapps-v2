---
type: adr
id: ADR-003
status: draft
date: 2026-10-05
code:
  - src/features/auth/constants/**
  - src/features/auth/server/permissions.ts
  - src/features/auth/server/seed-auth.ts
related_work_items: [WI-019, WI-020, WI-007]
---

# ADR-003 — Autorización por roles con permisos revocables por usuario

## Context

Decisión del equipo: roles `superadmin` (acceso total), `admin` (los mismos permisos, pero se le pueden **revocar**) y `nuevo` (sin permisos, rol del autorregistro). El módulo de gestión de roles llegará en el futuro.

## Options Considered

1. **Roles con permisos (`role_permissions`) + revocaciones por usuario (`user_revoked_permissions`)** (elegida).
2. Permisos asignados solo por rol: no permite quitarle un permiso a un admin concreto.
3. Permisos solo por usuario: más flexible, pero duplica datos y complica el alta.

## Decision

- Roles (aceptado por el equipo): `superadmin`, `admin`, `nuevo`.
- Permisos con formato `<recurso>.<acción>`; cada feature declara los suyos y el seed se los asigna a `admin`.
- Permisos efectivos: `superadmin` = todos, siempre; otros roles = los del rol menos los revocados al usuario; `nuevo` = ninguno.
- **Supuestos pendientes de confirmar:** la revocación es por usuario (no por rol); un `admin` puede crear `admin` y `nuevo`, pero no `superadmin`.
- Toda acción protegida valida el permiso en el servidor (`requirePermission`); la UI solo oculta elementos.

## Consequences

- (+) Permite quitar permisos a un admin concreto sin afectar a los demás.
- (+) Agregar una feature = declarar sus permisos y volver a ejecutar el seed.
- (−) Hasta que exista el módulo de gestión, revocar permisos o cambiar roles requiere SQL o un script.

## Related Capabilities

- Identidad y acceso / Roles y permisos

## Related Work Items

- WI-019, WI-020, WI-007
