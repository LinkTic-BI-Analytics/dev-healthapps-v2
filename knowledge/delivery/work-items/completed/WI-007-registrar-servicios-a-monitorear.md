---
type: feature
id: WI-007
title: Registrar servicios a monitorear
knowledge_level: K2
status: completed
phase: now
initiative: Catálogo de servicios
domains:
  - Catálogo de servicios
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-007
source_initiative: RM-002
source_roadmap_initiative: RM-002
source_work_item_candidate: WI-CANDIDATE-007
source_title: Registrar servicios a monitorear
source_context: Materialized from roadmap candidate WI-CANDIDATE-007 under initiative RM-002.
source_initiative_title: Catálogo de servicios
related_domain: Catálogo de servicios
related_capabilities:
  - Registro de servicios monitoreados
expected_value: 'El equipo puede dar de alta, editar y desactivar servicios.'
risks:
  - Datos de servicios incompletos o URLs inválidas.
dependencies:
  - WI-005
  - WI-019
source_signals:
  - 'Capability Gap: No existe forma de registrar servicios ni de verificarlos.'
  - 'Assumption: A1.'
summary: No hay forma de indicar a Health Apps qué servicios debe monitorear.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Registrar servicios a monitorear

> Type: feature · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-002 — Catálogo de servicios
- Work Item Candidate: WI-CANDIDATE-007
- Related domain: Catálogo de servicios
- Related capabilities:
  - Registro de servicios monitoreados

**Actor and outcome:** Equipo técnico: registra las aplicaciones y servicios que Health Apps debe monitorear.

**Current behavior:** No existe un registro de servicios.

**Target behavior:** El usuario puede crear, listar, editar y desactivar servicios con nombre, descripción, URL de verificación y estado activo/inactivo.

**Entry points:** Vista de administración de servicios en `app/`.

**End-to-end flow:** El usuario abre la gestión de servicios → completa el formulario → guarda → el servicio aparece en el listado como activo.

**Problem:** No hay forma de indicar a Health Apps qué servicios debe monitorear.

**Expected result:** Los servicios registrados quedan persistidos y disponibles para las verificaciones.

**Suggested Knowledge Level:** K2

**Impact analysis:**
- frontend: affected
- backend: affected
- database: affected
- configuration: reviewed-not-affected
- authentication: affected
- notifications: not-applicable
- documentation: affected
- operations: reviewed-not-affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Ninguno relevante de autorización: los permisos se declaran como se indica abajo.

**Scope confidence:** high — CRUD acotado con supuestos explícitos.

**Dependencies:**
- WI-005
- WI-019 (autenticación: las rutas y endpoints del catálogo son protegidos)

**Acceptance criteria:**
- [ ] La feature declara los permisos `services.read` y `services.manage` en el seed (asignados a `admin`) y los endpoints los exigen con `requirePermission()`; un usuario `nuevo` recibe 403.
- [ ] Mobile-first: la vista se diseña primero para 390 px, sin scroll horizontal; en escritorio (≥ `md`) se **reacomoda** según el layout de WI-003.
- [ ] Se ve correctamente en tema claro y en tema oscuro (solo usa tokens semánticos).
- [ ] Se puede crear un servicio con nombre y URL de verificación válidos.
- [ ] Se rechaza una URL inválida o un nombre vacío, con un mensaje claro.
- [ ] Se puede editar y desactivar un servicio; un servicio inactivo no se verifica.
- [ ] E2E: crear un servicio desde la UI → aparece en el listado tras recargar la página.

**Out of scope:**
- Descubrimiento automático de servicios.
- Importación masiva.

**How to test it (validation):**
1. `pnpm test` → pruebas de validación y persistencia del feature `service-catalog`.
2. Manual: crear, editar y desactivar un servicio desde la UI.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Conocimiento afectado actualizado (capabilities / current-state / ADR).
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿Cuáles son los servicios iniciales?
- [open] ¿Se necesitan cabeceras o credenciales para verificar algunos servicios?

**Suggested ownership (code globs):**
- `src/features/service-catalog/**`
- `app/services/**`

**Related domain / capability:** Catálogo de servicios / Registro de servicios monitoreados

**Related decisions:** Ninguna.

## Implementation Notes

- Modelo `Service` → tabla `services` (`name` único, `description`, `check_url`, `is_active`, `created_by_id` FK a `users` con SET NULL, índices en `is_active` y `created_by_id`). Migración `service_catalog`.
- Permisos `services.read` y `services.manage` en el catálogo y el seed (admin los recibe; superadmin siempre).
- API: `GET/POST /api/services`, `GET/PATCH /api/services/[id]` (`PATCH { isActive: false }` desactiva). Validación zod: nombre obligatorio (≤ 100), URL solo http(s) con mensaje accionable, descripción opcional; 409 por nombre duplicado; 404 con id inválido.
- UI: `/servicios` (tarjetas en móvil, tabla en escritorio; estados de carga, vacío y error; interruptor activar/desactivar), `/servicios/nuevo` y `/servicios/[id]/editar`; enlace "Servicios" en la navegación según permiso.
- Ajustes de plataforma: `db:migrate` pasa por `scripts/db-migrate.sh` (los argumentos como `--name` llegaban a `prisma generate` y `migrate dev` quedaba esperando); el target `dev` de Docker y el `migrator` ejecutan también `db:seed`.
- "Un servicio inactivo no se verifica": el dato `is_active` queda listo; el filtro se aplica en WI-010 (verificaciones).
- Validado: 10 pruebas unitarias nuevas (validación y `ServiceList`) y 3 de integración (crear, listar, editar, desactivar, 409, 404). E2E con Playwright: URL inválida → mensaje claro; crear desde la UI → aparece tras recargar; editar y desactivar persisten; 390 px sin scroll horizontal (tarjetas); 1280 px con tabla (tema claro). Con `curl`: un usuario `nuevo` recibe 403 en GET y POST.
- Pendiente: revisión humana.
