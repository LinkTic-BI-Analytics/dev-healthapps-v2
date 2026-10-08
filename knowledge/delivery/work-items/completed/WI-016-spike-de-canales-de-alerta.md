---
type: spike
id: WI-016
title: Spike de canales de alerta
knowledge_level: K1
status: completed
phase: next
initiative: Alertas
domains:
  - Alertas
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-016
source_initiative: RM-006
source_roadmap_initiative: RM-006
source_work_item_candidate: WI-CANDIDATE-016
source_title: Spike de canales de alerta
source_context: Materialized from roadmap candidate WI-CANDIDATE-016 under initiative RM-006.
source_initiative_title: Alertas
related_domain: Alertas
related_capabilities:
  - Generación y notificación de alertas
expected_value: Decisión sobre canal(es) y destinatarios de las alertas.
risks:
  - Elegir un canal que el equipo no revisa.
dependencies: []
source_signals:
  - 'Deferred Decision: A5 (canal de alertas).'
decision_candidates:
  - Canal de notificación de alertas
related_decisions: []
summary: No se pueden implementar alertas sin saber por qué canal enviarlas.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Spike de canales de alerta

> Type: spike · Level: K1

## Source

- Source: roadmap
- Roadmap Initiative: RM-006 — Alertas
- Work Item Candidate: WI-CANDIDATE-016
- Related domain: Alertas
- Related capabilities:
  - Generación y notificación de alertas

> Warning: This Work Item is related to technical decision candidates that have not been materialized as ADRs: Canal de notificación de alertas. Materialize them first (`kaddo adr` + adr-writing skill).

**Actor and outcome:** Equipo técnico: sabe por dónde y a quién llegarán las alertas.

**Current behavior:** No hay decisión sobre canales de alerta.

**Target behavior:** ADR con canal(es) elegido(s), destinatarios, formato del mensaje y credenciales necesarias.

**Entry points:** `knowledge/tech/decisions/`.

**End-to-end flow:** Consultar al equipo → evaluar canales (correo, Slack/Teams, otro) → redactar ADR → revisión humana.

**Problem:** No se pueden implementar alertas sin saber por qué canal enviarlas.

**Expected result:** ADR aprobado sobre canales de alerta.

**Suggested Knowledge Level:** K1

**Impact analysis:**
- frontend: not-applicable
- backend: reviewed-not-affected
- database: not-applicable
- configuration: affected
- authentication: not-applicable
- notifications: affected
- documentation: affected
- operations: affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Herramientas de comunicación que usa el equipo.

**Scope confidence:** high — Decisión acotada.

**Dependencies:**
- _Ninguno._

**Acceptance criteria:**
- [ ] Existe un ADR con el canal o canales elegidos y las alternativas descartadas.
- [ ] El ADR define los destinatarios y el contenido mínimo de una alerta.
- [ ] El ADR lista la configuración y las credenciales necesarias.

**Out of scope:**
- Implementación del envío (WI-017).

**How to test it (validation):**
1. Revisión humana del ADR.
2. Opcional: prueba manual de envío de un mensaje al canal elegido.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Conocimiento afectado actualizado (capabilities / current-state / ADR).
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿Por qué canales y a quién se envían las alertas?

**Suggested ownership (code globs):**
- `knowledge/tech/decisions/**`

**Related domain / capability:** Alertas / Generación y notificación de alertas

**Related decisions:** Pendiente de ADR: Canal de notificación de alertas

## Implementation Notes

- ADR-006 (draft) en `knowledge/tech/decisions/ADR-006-canales-de-alerta.md`:
  - **Canales elegidos:** bandeja de alertas en la app (`/alertas`, con reconocimiento) + webhook de chat opcional (Slack/Teams/genérico).
  - **Descartados por ahora:** correo (SMTP y gestión de destinatarios), SMS/llamada y push web, cada uno con su motivo.
  - **Destinatarios:** usuarios con el permiso nuevo `alerts.read` (bandeja) y el canal configurado (webhook).
  - **Cuándo se alerta:** una alerta por transición (caído = crítica, degradado = advertencia, recuperación = informativa); nunca por `skipped`.
  - **Contenido mínimo:** servicio, severidad, estado anterior → nuevo, hora, motivo y enlace al detalle.
  - **Configuración y credenciales:** `ALERT_WEBHOOK_URL` (secreto), `ALERT_WEBHOOK_FORMAT`, `APP_BASE_URL`, `ALERT_WEBHOOK_TIMEOUT_MS`.
- Basado en el supuesto acordado con el equipo ("asumir y documentar"); la implementación corresponde a WI-017, que por decisión del equipo no se hará por ahora.
- Pendiente: **aceptación humana del ADR**; confirmar herramienta de chat (Slack o Teams) y canal; período de gracia.
