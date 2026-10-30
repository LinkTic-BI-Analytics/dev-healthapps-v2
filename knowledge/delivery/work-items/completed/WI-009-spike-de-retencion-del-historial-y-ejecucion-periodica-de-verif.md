---
type: spike
id: WI-009
title: Spike de retención del historial y ejecución periódica de verificaciones
knowledge_level: K2
status: completed
phase: now
initiative: Verificación y estado de salud
domains:
  - Plataforma
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-009
source_initiative: RM-003
source_roadmap_initiative: RM-003
source_work_item_candidate: WI-CANDIDATE-009
source_title: Spike de retención del historial y ejecución periódica de verificaciones
source_context: Materialized from roadmap candidate WI-CANDIDATE-009 under initiative RM-003.
source_initiative_title: Verificación y estado de salud
related_domain: Plataforma
related_capabilities:
  - Fundación técnica de la plataforma
  - Historial de estados
  - Verificación periódica de salud
expected_value: >-
  Decisión documentada (ADR) sobre el modelo de historial en PostgreSQL, su
  retención y el scheduler de verificaciones.
risks:
  - >-
    Crecimiento de las tablas de resultados en PostgreSQL sin una política de
    retención.
  - Elegir un scheduler inadecuado para el entorno de despliegue de Next.js.
dependencies:
  - WI-005
source_signals:
  - >-
    Capability Gap: No hay decisión sobre persistencia ni sobre la ejecución
    periódica de verificaciones.
  - 'Deferred Decision: A6.'
  - >-
    Decisión del equipo (2026-10-05): persistencia en PostgreSQL con Prisma (ver
    WI-005).
decision_candidates:
  - Modelo y retención del historial en PostgreSQL
  - Mecanismo de ejecución periódica de verificaciones
related_decisions: []
summary: >-
  Sin una decisión de retención y scheduling no se pueden implementar las
  verificaciones ni el historial.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Spike de retención del historial y ejecución periódica de verificaciones

> Type: spike · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-003 — Verificación y estado de salud
- Work Item Candidate: WI-CANDIDATE-009
- Related domain: Plataforma
- Related capabilities:
  - Fundación técnica de la plataforma
  - Historial de estados
  - Verificación periódica de salud

> Warning: This Work Item is related to technical decision candidates that have not been materialized as ADRs: Modelo y retención del historial en PostgreSQL, Mecanismo de ejecución periódica de verificaciones. Materialize them first (`kaddo adr` + adr-writing skill).

**Actor and outcome:** Equipo técnico: dispone de una decisión técnica clara antes de construir verificaciones e historial.

**Current behavior:** La persistencia está decidida (PostgreSQL con Prisma, WI-005), pero no hay decisión sobre cómo modelar y retener los resultados e historial, ni sobre cómo ejecutar tareas periódicas.

**Target behavior:** Uno o más ADR en `knowledge/tech/decisions/` con el modelo de almacenamiento de resultados e historial en PostgreSQL, la política de retención y el mecanismo de ejecución periódica elegido, con las alternativas evaluadas.

**Entry points:** `knowledge/tech/decisions/`, `knowledge/tech/current-state.md`.

**End-to-end flow:** Evaluar opciones → prototipo mínimo si es necesario → redactar ADR → revisión humana.

**Problem:** Sin una decisión de retención y scheduling no se pueden implementar las verificaciones ni el historial.

**Expected result:** ADR aprobado con el modelo y la retención del historial en PostgreSQL y el mecanismo de ejecución periódica.

**Suggested Knowledge Level:** K2

**Impact analysis:**
- frontend: not-applicable
- backend: affected
- database: affected
- configuration: affected
- authentication: reviewed-not-affected
- notifications: not-applicable
- documentation: affected
- operations: affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Infraestructura de despliegue disponible (afecta al scheduler).
- Volumen esperado de servicios y frecuencia de verificación.

**Scope confidence:** medium — Depende de restricciones de infraestructura aún no conocidas.

**Dependencies:**
- WI-005 (PostgreSQL con Prisma configurado, para el prototipo)

**Acceptance criteria:**
- [ ] Existe un ADR con contexto, opciones evaluadas, decisión y consecuencias.
- [ ] El ADR define cómo se almacenan los resultados de verificación y el historial en PostgreSQL (tablas, índices por servicio y fecha, agregación si aplica).
- [ ] El ADR define la política de retención del historial y cómo se depura.
- [ ] El ADR define cómo se ejecutan las verificaciones periódicas y cómo se evita el solapamiento.
- [ ] `knowledge/tech/current-state.md` refleja la dirección técnica decidida.

**Out of scope:**
- Elección de la base de datos y el ORM (ya decidido: PostgreSQL con Prisma, WI-005).
- Implementación de las verificaciones (WI-010).

**How to test it (validation):**
1. Revisión humana del ADR.
2. Si hubo prototipo: ejecutarlo y comprobar que escribe y lee un resultado de verificación en PostgreSQL mediante Prisma.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Conocimiento afectado actualizado (capabilities / current-state / ADR).
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [resuelta] ¿Qué base de datos se usa? → PostgreSQL con Prisma (WI-005).
- [open] ¿Dónde se despliega la aplicación? (condiciona el scheduler)
- [open] ¿Cuánto tiempo se conserva el historial?

**Suggested ownership (code globs):**
- `knowledge/tech/decisions/**`

**Related domain / capability:** Plataforma / Fundación técnica de la plataforma, Historial de estados, Verificación periódica de salud

**Related decisions:** Pendiente de ADR: Modelo y retención del historial en PostgreSQL, Mecanismo de ejecución periódica de verificaciones

## Implementation Notes

- ADR-004 (draft): verificaciones en un **proceso worker separado**; planificación con `next_check_at` y reclamo con `SELECT … FOR UPDATE SKIP LOCKED` (sin solapamiento, escalable a varias réplicas); intervalo y timeout por servicio (60 s / 10 s por defecto); concurrencia limitada (`CHECK_CONCURRENCY`); resultados `skipped` ante fallas del propio monitor (BR-08, `MONITOR_CANARY_URL` opcional); apagado ordenado.
- ADR-005 (draft): `service_checks` (resultados crudos, retención **30 días**), estado actual desnormalizado en `services` y `service_status_changes` (transiciones, retención **365 días**); uptime calculado con las transiciones; purga diaria por lotes en el worker.
- Además se registraron como ADR las decisiones previas: ADR-001 (PostgreSQL 18 + Prisma, **accepted** por decisión del equipo), ADR-002 (autenticación JWT + sesiones revocables, draft) y ADR-003 (roles y permisos, draft).
- `knowledge/tech/current-state.md` completado con la dirección técnica, restricciones y desconocidos.
- El prototipo de escritura y lectura de resultados en PostgreSQL se valida al implementar WI-010.
- Pendiente: **aceptación humana** de ADR-002 a ADR-005.
