---
type: feature
id: WI-017
title: "Generar y notificar alertas por cambio de estado"
knowledge_level: K3
status: draft
phase: next
initiative: "Alertas"
domains:
  - "Alertas"
code: []
created_at: 2026-10-05
source: roadmap
source_id: WI-CANDIDATE-017
source_initiative: RM-006
source_roadmap_initiative: RM-006
source_work_item_candidate: WI-CANDIDATE-017
source_title: "Generar y notificar alertas por cambio de estado"
source_context: "Materialized from roadmap candidate WI-CANDIDATE-017 under initiative RM-006."
source_initiative_title: "Alertas"
related_domain: "Alertas"
related_capabilities:
  - "Generación y notificación de alertas"
expected_value: "Se notifica cuando un servicio pasa a degradado o fuera de servicio, y cuando se recupera."
risks:
  - "Fatiga por alertas (alertas repetidas o falsos positivos)."
dependencies:
  - "WI-011"
  - "WI-016"
source_signals:
  - "Business Goal: Reducir el tiempo de reacción ante incidentes."
  - "Business rules: BR-03, BR-04."
decision_candidates:
  - "Canal de notificación de alertas"
related_decisions: []
summary: "Los incidentes se detectan tarde si nadie está mirando el panel."
refined_by: work-item-agent
---

# Generar y notificar alertas por cambio de estado

> Type: feature · Level: K3

## Source

- Source: roadmap
- Roadmap Initiative: RM-006 — Alertas
- Work Item Candidate: WI-CANDIDATE-017
- Related domain: Alertas
- Related capabilities:
  - Generación y notificación de alertas

> Warning: This Work Item is related to technical decision candidates that have not been materialized as ADRs: Canal de notificación de alertas. Materialize them first (`kaddo adr` + adr-writing skill).

**Actor and outcome:** Equipo técnico: recibe una alerta cuando un servicio se cae, se degrada o se recupera.

**Current behavior:** No hay alertas; el equipo debe mirar el panel.

**Target behavior:** Cada transición a degradado o fuera de servicio, y cada recuperación, genera una alerta enviada por el canal decidido, sin duplicados mientras el estado se mantiene.

**Entry points:** Feature `alerts` (`server/`), disparado por los cambios de estado; canal configurado.

**End-to-end flow:** Cambio de estado detectado → se genera la alerta → se envía por el canal → el usuario la recibe con un enlace al detalle del servicio.

**Problem:** Los incidentes se detectan tarde si nadie está mirando el panel.

**Expected result:** El equipo recibe alertas oportunas y útiles ante incidentes.

**Suggested Knowledge Level:** K3

**Impact analysis:**
- frontend: reviewed-not-affected
- backend: affected
- database: affected
- configuration: affected
- authentication: not-applicable
- notifications: affected
- documentation: affected
- operations: affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Canal concreto (WI-016).

**Scope confidence:** medium — Depende de la decisión de WI-016.

**Dependencies:**
- WI-011
- WI-016

**Acceptance criteria:**
- [ ] La transición a fuera de servicio genera una alerta (BR-03).
- [ ] La transición a degradado genera una alerta (BR-04).
- [ ] La recuperación a operativo genera una alerta de recuperación.
- [ ] No se envían alertas repetidas mientras el estado no cambie.
- [ ] La alerta incluye el servicio, el estado, la hora y un enlace al detalle.
- [ ] Un fallo en el envío queda registrado y no interrumpe las verificaciones.
- [ ] E2E: detener un servicio de prueba → se recibe la alerta en el canal; reactivarlo → se recibe la alerta de recuperación.

**Out of scope:**
- Escalamiento y guardias (on-call).
- Silenciamiento programado de alertas.

**How to test it (validation):**
1. `pnpm test` → pruebas de generación de alertas y de no duplicación, con el canal simulado.
2. Manual: caída y recuperación de un servicio de prueba con el canal real configurado.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Conocimiento afectado actualizado (capabilities / current-state / ADR).
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿Se requiere un período de gracia antes de alertar, para evitar falsos positivos?

**Suggested ownership (code globs):**
- `src/features/alerts/**`

**Related domain / capability:** Alertas / Generación y notificación de alertas

**Related decisions:** Pendiente de ADR: Canal de notificación de alertas
