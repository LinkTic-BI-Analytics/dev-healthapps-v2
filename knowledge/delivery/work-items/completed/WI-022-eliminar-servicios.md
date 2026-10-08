---
type: feature
id: WI-022
title: Eliminar servicios monitoreados
knowledge_level: K2
status: completed
phase: now
initiative: Catálogo de servicios
domains:
  - Catálogo de servicios
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-022
source_initiative: RM-002
source_roadmap_initiative: RM-002
source_work_item_candidate: WI-CANDIDATE-022
source_title: Eliminar servicios monitoreados
source_context: Materialized from roadmap candidate WI-CANDIDATE-022 under initiative RM-002.
source_initiative_title: Catálogo de servicios
related_domain: Catálogo de servicios
related_capabilities:
  - Registro de servicios monitoreados
expected_value: >-
  El equipo puede quitar del catálogo los servicios que ya no existen o se
  registraron por error.
risks:
  - Borrado accidental de un servicio con historial valioso.
  - >-
    El worker intenta registrar una verificación de un servicio recién
    eliminado.
dependencies:
  - WI-007
  - WI-010
source_signals:
  - >-
    Pedido del equipo (2026-10-05): agregar la opción de eliminar servicios en
    /servicios.
decision_candidates: []
summary: Hoy los servicios solo se pueden desactivar; no hay forma de eliminarlos.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Eliminar servicios monitoreados

> Type: feature · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-002 — Catálogo de servicios
- Work Item Candidate: WI-CANDIDATE-022
- Related domain: Catálogo de servicios
- Related capabilities:
  - Registro de servicios monitoreados

**Actor and outcome:** Usuario con `services.manage`: elimina un servicio del catálogo, después de confirmar, y deja de verlo en el panel y en el listado.

**Current behavior:** Los servicios solo se pueden desactivar (WI-007); no hay forma de eliminarlos.

**Target behavior:**
- `DELETE /api/services/[id]` (requiere `services.manage`): elimina el servicio y, en cascada, sus verificaciones (`service_checks`) y su historial de estados (`service_status_changes`). Servicio inexistente → 404.
- En `/servicios`: botón "Eliminar" en cada servicio (tarjeta en móvil, fila en escritorio) que abre un diálogo de confirmación con el nombre del servicio. El diálogo advierte que se borran el historial y las verificaciones, que no se puede deshacer, y sugiere desactivarlo si solo se quiere dejar de verificar.
- En `/servicios/[id]/editar`: la misma acción en una zona "Eliminar servicio"; al terminar vuelve a `/servicios`.
- Si el worker termina una verificación de un servicio que se eliminó mientras tanto, la descarta sin error.

**Entry points:** `app/api/services/[id]/route.ts`, `src/features/service-catalog/`, `src/features/checks/server/check-runner.ts`.

**End-to-end flow:** El usuario abre `/servicios` → pulsa Eliminar en un servicio → confirma en el diálogo → el servicio desaparece del listado y del panel → su historial ya no existe.

**Problem:** Hoy los servicios solo se pueden desactivar; no hay forma de eliminarlos.

**Expected result:** Los servicios se eliminan con confirmación explícita, junto con sus datos asociados, sin afectar al worker.

**Suggested Knowledge Level:** K2

**Impact analysis:**
- frontend: affected
- backend: affected
- database: reviewed-not-affected (las FK ya tienen ON DELETE CASCADE)
- configuration: not-applicable
- authentication: affected (permiso `services.manage`)
- notifications: not-applicable
- documentation: affected
- operations: reviewed-not-affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:** Ninguno.

**Scope confidence:** high — Alcance acotado.

**Dependencies:**
- WI-007 (catálogo)
- WI-010 (worker)

**Acceptance criteria:**
- [ ] `DELETE /api/services/[id]` elimina el servicio con sus verificaciones e historial; responde 204; inexistente → 404; sin `services.manage` → 403.
- [ ] El botón Eliminar solo aparece con `services.manage` y siempre pide confirmación en un diálogo que nombra el servicio y advierte que no se puede deshacer.
- [ ] Cancelar el diálogo no elimina nada.
- [ ] Tras eliminar, el servicio desaparece del listado sin recargar y deja de aparecer en el panel.
- [ ] El worker descarta sin error la verificación de un servicio eliminado durante la verificación.
- [ ] Mobile-first: el botón mide al menos 44 px en móvil y el diálogo se ve bien en 390 px y en escritorio, en tema claro y oscuro.
- [ ] E2E: eliminar un servicio desde `/servicios` → desaparece del listado y del panel tras recargar.

**Out of scope:**
- Papelera o recuperación de servicios eliminados.
- Registro de auditoría de quién eliminó.

**How to test it (validation):**
1. `pnpm test` → diálogo de confirmación (cancelar y confirmar).
2. `pnpm test:integration` → eliminación en cascada; 404; descarte en el worker.
3. Manual / E2E: eliminar desde el listado y desde la edición en 390 y 1280 px.
4. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] `knowledge/tech/codebase.md` actualizado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿Hace falta registrar quién eliminó cada servicio (auditoría)?

**Suggested ownership (code globs):**
- `src/features/service-catalog/**`
- `app/api/services/**`

**Related domain / capability:** Catálogo de servicios / Registro de servicios monitoreados

**Related decisions:** ADR-003 (permisos)

## Implementation Notes

- `deleteService()` y `DELETE /api/services/[id]` (requiere `services.manage`; 204; 404 si no existe): borra el servicio y, en cascada por las FK existentes, sus verificaciones y su historial de estados.
- Worker: `recordCheckResult` bloquea la fila del servicio (`SELECT … FOR UPDATE`) y, si ya no existe, lanza `ServiceDeletedError`; el worker la registra como "resultado descartado" sin error.
- UI: `DeleteServiceDialog` (shadcn `alert-dialog`): botón con icono en cada servicio del listado (44 px en móvil) y zona "Eliminar servicio" en la edición (`DeleteServiceSection`, vuelve a `/servicios`). El diálogo nombra el servicio, advierte que se borran historial y verificaciones y que no se puede deshacer, sugiere desactivar; se mantiene abierto mientras elimina; cancelar no borra nada. En el listado, el servicio se quita en memoria (convención de borrados).
- Validado: 2 pruebas unitarias (cancelar / confirmar) y 2 de integración (borrado en cascada y 404; descarte en el worker) — 136 unitarias y 41 de integración en total. E2E sobre el build de producción con dos servicios desechables: cancelar mantiene el servicio; confirmar lo quita sin recargar, sigue ausente tras recargar y no aparece en el panel (390 px, oscuro); desde la edición elimina y vuelve al listado (1280 px, claro). Usuario sin `services.manage` → 403. `typecheck`, `lint` y `build` pasan.
- Pendiente: auditoría de quién elimina (pregunta abierta); revisión humana.
