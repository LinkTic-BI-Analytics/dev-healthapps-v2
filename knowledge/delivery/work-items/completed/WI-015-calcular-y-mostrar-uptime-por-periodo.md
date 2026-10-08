---
type: feature
id: WI-015
title: Calcular y mostrar uptime por período
knowledge_level: K2
status: completed
phase: next
initiative: Historial y uptime
domains:
  - Métricas e historial
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-015
source_initiative: RM-005
source_roadmap_initiative: RM-005
source_work_item_candidate: WI-CANDIDATE-015
source_title: Calcular y mostrar uptime por período
source_context: Materialized from roadmap candidate WI-CANDIDATE-015 under initiative RM-005.
source_initiative_title: Historial y uptime
related_domain: Métricas e historial
related_capabilities:
  - Cálculo de uptime
expected_value: 'Uptime por servicio en 24 h, 7 días y 30 días.'
risks:
  - Cálculo incorrecto en períodos con verificaciones no realizadas.
dependencies:
  - WI-014
source_signals:
  - 'Business rule: BR-07.'
summary: No se puede saber qué tan disponible ha estado un servicio.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Calcular y mostrar uptime por período

> Type: feature · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-005 — Historial y uptime
- Work Item Candidate: WI-CANDIDATE-015
- Related domain: Métricas e historial
- Related capabilities:
  - Cálculo de uptime

**Actor and outcome:** Equipo técnico y responsables técnicos: evalúan la disponibilidad de un servicio en el tiempo.

**Current behavior:** No se calcula el uptime.

**Target behavior:** El panel y el detalle muestran el porcentaje de uptime de cada servicio en 24 h, 7 días y 30 días, calculado a partir del historial.

**Entry points:** Tarjetas del panel y vista de detalle.

**End-to-end flow:** El usuario abre el panel o el detalle → ve el uptime por período → compara servicios.

**Problem:** No se puede saber qué tan disponible ha estado un servicio.

**Expected result:** El uptime por período se muestra y es coherente con el historial.

**Suggested Knowledge Level:** K2

**Impact analysis:**
- frontend: affected
- backend: affected
- database: reviewed-not-affected
- configuration: not-applicable
- authentication: unknown
- notifications: not-applicable
- documentation: affected
- operations: not-applicable

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Períodos exactos (24 h / 7 d / 30 d es un supuesto).
- Tratamiento de 'degradado' en el uptime.

**Scope confidence:** medium — Falta definir si 'degradado' cuenta como disponible.

**Dependencies:**
- WI-014

**Acceptance criteria:**
- [ ] Mobile-first: la vista se diseña primero para 390 px, sin scroll horizontal; en escritorio (≥ `md`) se **reacomoda** según el layout de WI-003.
- [ ] Se ve correctamente en tema claro y en tema oscuro (solo usa tokens semánticos).
- [ ] El uptime se calcula como el porcentaje de tiempo en estado operativo dentro del período (BR-07).
- [ ] Se muestran los períodos de 24 h, 7 días y 30 días.
- [ ] Los intervalos sin verificación por falla del monitor se excluyen del cálculo.
- [ ] E2E: con un historial conocido (p. ej. 1 h caído en 24 h), el detalle muestra ≈ 95,8 %.

**Out of scope:**
- Comparación contra SLA/SLO.

**How to test it (validation):**
1. `pnpm test` → pruebas del cálculo de uptime con historiales sintéticos.
2. Manual: comparar el valor mostrado con un cálculo a mano.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Conocimiento afectado actualizado (capabilities / current-state / ADR).
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿El tiempo en 'degradado' cuenta como disponible?
- [open] ¿Existen SLA/SLO acordados?

**Suggested ownership (code globs):**
- `src/features/history/**`
- `src/features/metrics/**`
- `app/**`

**Related domain / capability:** Métricas e historial / Cálculo de uptime

**Related decisions:** Ninguna.

## Implementation Notes

- `computeUptime()` (`src/features/uptime/server/uptime.ts`, función pura): porcentaje del tiempo observado en estado **operativo** (BR-07; degradado no cuenta), reconstruido con las transiciones de `service_status_changes` (incluida la última anterior a la ventana). Excluye el tiempo sin datos (antes de la primera evaluación) y los intervalos de verificaciones `skipped` por falla del monitor (`checked_at` + frecuencia del servicio). `null` sin datos.
- `getUptimeForServices()`: 24 h, 7 d y 30 d para N servicios con tres consultas (transiciones de la ventana, `DISTINCT ON` para el estado previo y verificaciones omitidas).
- `GET /api/dashboard` y `GET /api/services/[id]/detail` incluyen `uptime`; `UptimeStats` en las tarjetas del panel (línea compacta "24 h · 7 d · 30 d") y en el detalle (sección "Disponibilidad"), con color según el nivel (≥ 99 % verde, ≥ 95 % ámbar, < 95 % rojo) y dos decimales; `formatUptime()` en `src/lib/format.ts`.
- Validado: 7 pruebas unitarias nuevas (117 en total), incluido **1 h caído en 24 h ≈ 95,83 %**, degradado no cuenta, sin datos excluido, exclusión de intervalos omitidos; 3 de integración (37 en total). E2E con un servicio de historial conocido (1 h caído hace 10 h): tarjeta y detalle muestran **24 h 95,83 %**, 7 d y 30 d 97,92 % (solo hay 48 h de historia; el resto es tiempo sin datos); sin scroll horizontal en 390 px (oscuro) y 1280 px (claro).
- Supuesto: "degradado" no cuenta como disponible (según BR-07 / criterio de aceptación); la pregunta abierta del WI se mantiene para negocio.
- Pendiente: revisión humana.
