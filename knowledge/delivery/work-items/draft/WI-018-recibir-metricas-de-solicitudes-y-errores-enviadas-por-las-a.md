---
type: feature
id: WI-018
title: "Recibir métricas de solicitudes y errores enviadas por las aplicaciones"
knowledge_level: K3
status: draft
phase: later
initiative: "Métricas de operación reportadas por las aplicaciones"
domains:
  - "Métricas e historial"
code: []
created_at: 2026-10-05
source: roadmap
source_id: WI-CANDIDATE-018
source_initiative: RM-007
source_roadmap_initiative: RM-007
source_work_item_candidate: WI-CANDIDATE-018
source_title: "Recibir métricas de solicitudes y errores enviadas por las aplicaciones"
source_context: "Materialized from roadmap candidate WI-CANDIDATE-018 under initiative RM-007."
source_initiative_title: "Métricas de operación reportadas por las aplicaciones"
related_domain: "Métricas e historial"
related_capabilities:
  - "Ingesta de métricas de operación reportadas por las aplicaciones"
expected_value: "Mostrar la cantidad y frecuencia de solicitudes y los errores por servicio."
risks:
  - "Requiere cambios en cada aplicación monitoreada; contrato de integración por definir."
dependencies:
  - "WI-005"
  - "WI-013"
source_signals:
  - "Open Question: ¿Las aplicaciones enviarán métricas (push) o se obtendrán de otra fuente?"
  - "Assumption: A2 (diferido del MVP)."
decision_candidates:
  - "Contrato de ingesta de métricas"
related_decisions: []
summary: "El sondeo no revela el volumen de solicitudes ni los errores internos de las aplicaciones."
refined_by: work-item-agent
---

# Recibir métricas de solicitudes y errores enviadas por las aplicaciones

> Type: feature · Level: K3

## Source

- Source: roadmap
- Roadmap Initiative: RM-007 — Métricas de operación reportadas por las aplicaciones
- Work Item Candidate: WI-CANDIDATE-018
- Related domain: Métricas e historial
- Related capabilities:
  - Ingesta de métricas de operación reportadas por las aplicaciones

> Warning: This Work Item is related to technical decision candidates that have not been materialized as ADRs: Contrato de ingesta de métricas. Materialize them first (`kaddo adr` + adr-writing skill).

**Actor and outcome:** Equipo técnico: ve la cantidad y frecuencia de solicitudes y los errores reales de cada aplicación.

**Current behavior:** Solo se dispone de las métricas obtenidas por sondeo.

**Target behavior:** Las aplicaciones envían métricas agregadas de solicitudes y errores a Health Apps, que las almacena y las muestra en el detalle del servicio.

**Entry points:** Endpoint de ingesta; vista de detalle de servicio.

**End-to-end flow:** La aplicación envía las métricas → Health Apps las valida y las asocia al servicio → el usuario las ve en el detalle.

**Problem:** El sondeo no revela el volumen de solicitudes ni los errores internos de las aplicaciones.

**Expected result:** El detalle de cada servicio muestra las solicitudes y los errores reportados.

**Suggested Knowledge Level:** K3

**Impact analysis:**
- frontend: affected
- backend: affected
- database: affected
- configuration: affected
- authentication: affected
- notifications: unknown
- documentation: affected
- operations: affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Formato y mecanismo de envío.
- Autenticación de las aplicaciones que envían métricas.

**Scope confidence:** low — Contrato de integración sin definir; probablemente requiera un spike previo y dividir este WI.

**Dependencies:**
- WI-005
- WI-013

**Acceptance criteria:**
- [ ] Una aplicación autorizada puede enviar métricas asociadas a su servicio.
- [ ] Se rechazan los envíos no autorizados o con un formato inválido.
- [ ] El detalle del servicio muestra la cantidad y frecuencia de solicitudes y los errores reportados.
- [ ] E2E: una aplicación de prueba envía métricas → aparecen en su detalle.

**Out of scope:**
- Trazas distribuidas y análisis de logs.

**How to test it (validation):**
1. `pnpm test` → pruebas de validación y autorización de la ingesta.
2. Manual: enviar métricas desde una aplicación de prueba y verlas en el detalle.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Conocimiento afectado actualizado (capabilities / current-state / ADR).
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿Qué formato y mecanismo de envío usarán las aplicaciones?
- [open] ¿Conviene un spike previo para definir el contrato de integración?

**Suggested ownership (code globs):**
- `src/features/metrics/**`
- `app/api/**`

**Related domain / capability:** Métricas e historial / Ingesta de métricas de operación reportadas por las aplicaciones

**Related decisions:** Pendiente de ADR: Contrato de ingesta de métricas
