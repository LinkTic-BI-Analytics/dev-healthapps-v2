---
type: feature
id: WI-008
title: Configurar parámetros esperados por servicio
knowledge_level: K2
status: completed
phase: now
initiative: Catálogo de servicios
domains:
  - Catálogo de servicios
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-008
source_initiative: RM-002
source_roadmap_initiative: RM-002
source_work_item_candidate: WI-CANDIDATE-008
source_title: Configurar parámetros esperados por servicio
source_context: Materialized from roadmap candidate WI-CANDIDATE-008 under initiative RM-002.
source_initiative_title: Catálogo de servicios
related_domain: Catálogo de servicios
related_capabilities:
  - Parámetros esperados por servicio
expected_value: >-
  Cada servicio tiene umbrales que definen operativo, degradado y fuera de
  servicio.
risks:
  - Umbrales por defecto poco realistas.
dependencies:
  - WI-007
source_signals:
  - 'Business rule: BR-05.'
  - 'Assumption: A3.'
summary: >-
  Sin parámetros esperados no se puede distinguir entre operativo, degradado y
  fuera de servicio.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Configurar parámetros esperados por servicio

> Type: feature · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-002 — Catálogo de servicios
- Work Item Candidate: WI-CANDIDATE-008
- Related domain: Catálogo de servicios
- Related capabilities:
  - Parámetros esperados por servicio

**Actor and outcome:** Equipo técnico: define qué se considera funcionamiento aceptable para cada servicio.

**Current behavior:** No existen umbrales.

**Target behavior:** Cada servicio tiene umbrales configurables (tiempo de respuesta máximo para operativo, fallos consecutivos para fuera de servicio) con valores por defecto.

**Entry points:** Formulario de servicio en `app/`.

**End-to-end flow:** El usuario edita un servicio → ajusta los umbrales → guarda → los nuevos umbrales se usan en la siguiente evaluación.

**Problem:** Sin parámetros esperados no se puede distinguir entre operativo, degradado y fuera de servicio.

**Expected result:** Cada servicio tiene umbrales persistidos, con valores por defecto si no se configuran.

**Suggested Knowledge Level:** K2

**Impact analysis:**
- frontend: affected
- backend: affected
- database: affected
- configuration: affected
- authentication: unknown
- notifications: not-applicable
- documentation: affected
- operations: reviewed-not-affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Valores por defecto concretos.

**Scope confidence:** medium — Los valores de los umbrales aún no están definidos por negocio.

**Dependencies:**
- WI-007

**Acceptance criteria:**
- [ ] Mobile-first: la vista se diseña primero para 390 px, sin scroll horizontal; en escritorio (≥ `md`) se **reacomoda** según el layout de WI-003.
- [ ] Se ve correctamente en tema claro y en tema oscuro (solo usa tokens semánticos).
- [ ] Un servicio nuevo recibe umbrales por defecto.
- [ ] Se pueden modificar los umbrales de un servicio, con validación de valores positivos.
- [ ] E2E: cambiar un umbral desde la UI → el valor persiste tras recargar.

**Out of scope:**
- Umbrales dinámicos o basados en aprendizaje.

**How to test it (validation):**
1. `pnpm test` → validación de umbrales y valores por defecto.
2. Manual: editar los umbrales de un servicio y verificar que persisten.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Conocimiento afectado actualizado (capabilities / current-state / ADR).
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿Qué valores concretos definen 'degradado' y 'fuera de servicio'?

**Suggested ownership (code globs):**
- `src/features/service-catalog/**`
- `app/services/**`

**Related domain / capability:** Catálogo de servicios / Parámetros esperados por servicio

**Related decisions:** Ninguna.

## Implementation Notes

- Columnas `degraded_response_time_ms` (DEFAULT 1000) y `down_after_failures` (DEFAULT 3) en `services`, con restricciones CHECK en la base (1–120000 ms y 1–100 fallos). Migración `service_thresholds` (SQL de CHECK agregado a mano a la migración generada).
- `DEFAULT_THRESHOLDS` y `THRESHOLD_LIMITS` en `src/features/service-catalog/constants/thresholds.ts` (supuesto: 1000 ms / 3 fallos, pendiente de confirmar por negocio).
- Validación zod: enteros positivos dentro de límites; acepta texto del input; opcionales al crear (aplica el DEFAULT de la base).
- Formulario de servicio con la sección "Parámetros esperados" y una explicación dinámica de cuándo el servicio se considera degradado y fuera de servicio.
- Ajuste visual: el color global de enlaces ya no se aplica a componentes (`a:not([data-slot])`), así los `Button asChild` conservan su color.
- Validado: 6 pruebas unitarias y 2 de integración nuevas (82 unitarias y 19 de integración en total), incluida la restricción CHECK de la base. E2E: valores por defecto 1000/3 en el formulario; 0 → mensaje claro; 750/4 persisten tras recargar; cambio a 6 persiste; sin scroll horizontal en 390 y 1280 px (tema claro y oscuro).
- Pendiente: confirmar los valores por defecto con negocio; revisión humana.
