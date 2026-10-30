---
type: feature
id: WI-011
title: Evaluar el estado de salud de cada servicio
knowledge_level: K3
status: completed
phase: now
initiative: Verificación y estado de salud
domains:
  - Verificación de salud
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-011
source_initiative: RM-003
source_roadmap_initiative: RM-003
source_work_item_candidate: WI-CANDIDATE-011
source_title: Evaluar el estado de salud de cada servicio
source_context: Materialized from roadmap candidate WI-CANDIDATE-011 under initiative RM-003.
source_initiative_title: Verificación y estado de salud
related_domain: Verificación de salud
related_capabilities:
  - Evaluación del estado de salud
expected_value: El estado se calcula según los parámetros esperados.
risks:
  - Cambios de estado oscilantes (flapping).
dependencies:
  - WI-008
  - WI-010
source_signals:
  - 'Business rules: BR-01, BR-05, BR-08.'
summary: >-
  Los resultados crudos de verificación no indican por sí solos si un servicio
  está sano.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Evaluar el estado de salud de cada servicio

> Type: feature · Level: K3

## Source

- Source: roadmap
- Roadmap Initiative: RM-003 — Verificación y estado de salud
- Work Item Candidate: WI-CANDIDATE-011
- Related domain: Verificación de salud
- Related capabilities:
  - Evaluación del estado de salud

**Actor and outcome:** Equipo técnico: ve un estado de salud fiable para cada servicio.

**Current behavior:** No existe estado de salud.

**Target behavior:** Tras cada verificación, el servicio queda en exactamente un estado (operativo, degradado o fuera de servicio), calculado con sus umbrales.

**Entry points:** Feature `health-status` (`server/`), invocado después de cada verificación.

**End-to-end flow:** Verificación registrada → se evalúan los resultados recientes contra los umbrales → se asigna el estado → se persiste el estado actual.

**Problem:** Los resultados crudos de verificación no indican por sí solos si un servicio está sano.

**Expected result:** Cada servicio tiene un estado actual coherente con sus parámetros esperados.

**Suggested Knowledge Level:** K3

**Impact analysis:**
- frontend: reviewed-not-affected
- backend: affected
- database: affected
- configuration: reviewed-not-affected
- authentication: not-applicable
- notifications: reviewed-not-affected
- documentation: affected
- operations: reviewed-not-affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Regla exacta de fallos consecutivos para 'fuera de servicio'.

**Scope confidence:** medium — Las reglas dependen de umbrales aún no definidos por negocio.

**Dependencies:**
- WI-008
- WI-010

**Acceptance criteria:**
- [ ] Un servicio que responde bien y dentro del umbral de tiempo queda como operativo.
- [ ] Un servicio que responde fuera del umbral de tiempo queda como degradado.
- [ ] Un servicio que falla N veces consecutivas (según su umbral) queda como fuera de servicio.
- [ ] Un servicio tiene siempre exactamente un estado (BR-01).
- [ ] Una verificación no realizada por falla del monitor no cambia el estado a fuera de servicio (BR-08).

**Out of scope:**
- Historial de cambios de estado (WI-014).
- Alertas (WI-017).

**How to test it (validation):**
1. `pnpm test` → pruebas por tabla de la evaluación de estado (operativo, degradado, fuera de servicio, verificación no realizada).
2. Manual: un servicio de prueba con latencia controlada → observar la transición de estados.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Conocimiento afectado actualizado (capabilities / current-state / ADR).
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿Una tasa de errores también debe marcar 'degradado', además del tiempo de respuesta?

**Suggested ownership (code globs):**
- `src/features/health-status/**`

**Related domain / capability:** Verificación de salud / Evaluación del estado de salud

**Related decisions:** Ninguna.

## Implementation Notes

- Migración `service_health_status`: enum `health_status` (operativo | degradado | caido) y columnas `services.health_status` (nula hasta la primera evaluación) y `status_changed_at`.
- `evaluateHealthStatus()` (`src/features/health-status/server/evaluate.ts`, función pura): `skipped` no cambia el estado (BR-08); fallo → `degradado` hasta `down_after_failures` seguidos y luego `caido`; éxito → `degradado` si el tiempo de respuesta supera `degraded_response_time_ms`, si no `operativo`. Un servicio tiene siempre un único estado (BR-01).
- `recordCheckResult()` evalúa y guarda el estado en la misma transacción que el resultado y devuelve `{ previousStatus, status, changed }` (base para el historial, WI-014).
- Decisión de diseño (supuesto): un fallo aislado, antes de alcanzar el umbral de caída, marca el servicio como `degradado`.
- Validado: 10 casos unitarios y 3 de integración (99 unitarias y 29 de integración en total): recorrido operativo → degradado (latencia) → degradado (fallos) → caído → skipped sin cambio → operativo; skipped sin evaluación previa queda sin estado; detección de cambio. `typecheck` y `lint` pasan.
- Pendiente: confirmar con negocio si los errores aislados deben marcar `degradado`; revisión humana.
