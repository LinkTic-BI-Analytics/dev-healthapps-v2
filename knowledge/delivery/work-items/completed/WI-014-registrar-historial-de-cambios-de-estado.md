---
type: feature
id: WI-014
title: Registrar historial de cambios de estado
knowledge_level: K2
status: completed
phase: next
initiative: Historial y uptime
domains:
  - Métricas e historial
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-014
source_initiative: RM-005
source_roadmap_initiative: RM-005
source_work_item_candidate: WI-CANDIDATE-014
source_title: Registrar historial de cambios de estado
source_context: Materialized from roadmap candidate WI-CANDIDATE-014 under initiative RM-005.
source_initiative_title: Historial y uptime
related_domain: Métricas e historial
related_capabilities:
  - Historial de estados
expected_value: Cada cambio de estado queda registrado y se puede consultar.
risks:
  - Crecimiento del volumen de datos sin política de retención.
dependencies:
  - WI-011
source_signals:
  - 'Business Goal: Conservar un historial del estado de los servicios.'
  - 'Business rule: BR-06.'
summary: Sin historial no se pueden analizar los incidentes pasados.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Registrar historial de cambios de estado

> Type: feature · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-005 — Historial y uptime
- Work Item Candidate: WI-CANDIDATE-014
- Related domain: Métricas e historial
- Related capabilities:
  - Historial de estados

**Actor and outcome:** Equipo técnico: consulta cuándo y cómo cambió el estado de un servicio.

**Current behavior:** Solo se conoce el estado actual.

**Target behavior:** Cada transición de estado se registra con estado anterior, estado nuevo y hora, y se muestra en el detalle del servicio.

**Entry points:** Feature `history`; sección de historial en el detalle del servicio.

**End-to-end flow:** Cambia el estado de un servicio → se registra la transición → el usuario la ve en el historial del detalle.

**Problem:** Sin historial no se pueden analizar los incidentes pasados.

**Expected result:** El historial de transiciones de cada servicio es consultable y respeta la política de retención.

**Suggested Knowledge Level:** K2

**Impact analysis:**
- frontend: affected
- backend: affected
- database: affected
- configuration: reviewed-not-affected
- authentication: unknown
- notifications: reviewed-not-affected
- documentation: affected
- operations: affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Política de retención (definida en WI-009).

**Scope confidence:** high — Comportamiento bien definido por BR-06.

**Dependencies:**
- WI-011

**Acceptance criteria:**
- [ ] Mobile-first: la vista se diseña primero para 390 px, sin scroll horizontal; en escritorio (≥ `md`) se **reacomoda** según el layout de WI-003.
- [ ] Se ve correctamente en tema claro y en tema oscuro (solo usa tokens semánticos).
- [ ] Cada cambio de estado genera un registro con estado anterior, estado nuevo y hora.
- [ ] Si el estado no cambia, no se crea un registro.
- [ ] El historial se muestra en el detalle del servicio en orden cronológico inverso.
- [ ] Se aplica la política de retención definida en el ADR.
- [ ] E2E: forzar una caída y una recuperación de un servicio de prueba → ver ambas transiciones en su historial.

**Out of scope:**
- Reportes exportables.

**How to test it (validation):**
1. `pnpm test` → pruebas de registro de transiciones y de no duplicación.
2. Manual: simular caída y recuperación y revisar el historial.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Conocimiento afectado actualizado (capabilities / current-state / ADR).
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿Cuánto tiempo se conserva el historial?

**Suggested ownership (code globs):**
- `src/features/history/**`
- `app/services/**`

**Related domain / capability:** Métricas e historial / Historial de estados

**Related decisions:** Ninguna.

## Implementation Notes

- Tabla `service_status_changes` (`from_status` nulo en la primera evaluación, `to_status`, `changed_at`; índices `(service_id, changed_at DESC)` y `changed_at`) y migración de datos que crea el historial inicial de los servicios que ya tenían estado.
- `recordCheckResult()` registra una fila por transición en la misma transacción; si el estado no cambia, no registra nada (BR-06).
- Retención: `purgeOldStatusChanges()` por lotes en la purga diaria del worker, `STATUS_HISTORY_RETENTION_DAYS` (365, ADR-005).
- `GET /api/services/[id]/detail` incluye los últimos 50 cambios; sección "Historial de estados" en el detalle (`StatusHistory`: estado anterior → nuevo, fecha y hora en 24 h y tiempo relativo; del más reciente al más antiguo).
- Docker (corrección del entorno de desarrollo): `app` y `worker` ejecutan `pnpm install --frozen-lockfile` al arrancar (con `CI=true` y un volumen `pnpm-store`) para no fallar cuando cambian las dependencias; el worker usa `--ignore-scripts` y `restart: unless-stopped` para no regenerar el cliente de Prisma en paralelo con `app`.
- Validado: 2 pruebas unitarias y 2 de integración nuevas (110 unitarias y 34 de integración en total): transiciones operativo → caído → operativo sin registros duplicados; purga por retención. E2E con el worker real: se forzó la caída y la recuperación de "Portal de Clientes" → el detalle muestra operativo → degradado → caído → operativo, más el estado inicial, en orden cronológico inverso; sin scroll horizontal en 390 px (oscuro) y 1280 px (claro).
- Pendiente: revisión humana.
