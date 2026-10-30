---
type: feature
id: WI-010
title: Ejecutar verificaciones periódicas de salud
knowledge_level: K3
status: completed
phase: now
initiative: Verificación y estado de salud
domains:
  - Verificación de salud
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-010
source_initiative: RM-003
source_roadmap_initiative: RM-003
source_work_item_candidate: WI-CANDIDATE-010
source_title: Ejecutar verificaciones periódicas de salud
source_context: Materialized from roadmap candidate WI-CANDIDATE-010 under initiative RM-003.
source_initiative_title: Verificación y estado de salud
related_domain: Verificación de salud
related_capabilities:
  - Verificación periódica de salud
  - Recolección de métricas de rendimiento
expected_value: >-
  Cada servicio activo se verifica periódicamente y se registran el resultado,
  el tiempo de respuesta y la hora.
risks:
  - Verificaciones solapadas o bloqueantes.
  - Falsos fallos por timeouts del propio monitor.
dependencies:
  - WI-009
  - WI-005
  - WI-007
source_signals:
  - 'Business Goal: Detectar tempranamente caídas, errores y degradación.'
  - 'Business rule: BR-02.'
  - 'Assumption: A2.'
decision_candidates:
  - Mecanismo de ejecución periódica de verificaciones
related_decisions: []
summary: >-
  No hay datos actualizados sobre si los servicios responden ni sobre cuánto
  tardan.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Ejecutar verificaciones periódicas de salud

> Type: feature · Level: K3

## Source

- Source: roadmap
- Roadmap Initiative: RM-003 — Verificación y estado de salud
- Work Item Candidate: WI-CANDIDATE-010
- Related domain: Verificación de salud
- Related capabilities:
  - Verificación periódica de salud
  - Recolección de métricas de rendimiento

> Warning: This Work Item is related to technical decision candidates that have not been materialized as ADRs: Mecanismo de ejecución periódica de verificaciones. Materialize them first (`kaddo adr` + adr-writing skill).

**Actor and outcome:** Health Apps (sistema): comprueba periódicamente cada servicio activo.

**Current behavior:** No se verifica ningún servicio.

**Target behavior:** Cada servicio activo se verifica periódicamente por HTTP; se guardan el resultado (éxito/fallo), el código de respuesta, el tiempo de respuesta y la hora.

**Entry points:** Mecanismo de ejecución periódica decidido en WI-009; feature `checks`.

**End-to-end flow:** El scheduler se dispara → obtiene los servicios activos → hace una solicitud HTTP con timeout → registra el resultado y la latencia → actualiza la última verificación.

**Problem:** No hay datos actualizados sobre si los servicios responden ni sobre cuánto tardan.

**Expected result:** Cada servicio activo tiene resultados de verificación recientes y su última verificación registrada.

**Suggested Knowledge Level:** K3

**Impact analysis:**
- frontend: reviewed-not-affected
- backend: affected
- database: affected
- configuration: affected
- authentication: not-applicable
- notifications: reviewed-not-affected
- documentation: affected
- operations: affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Frecuencia de verificación.
- Timeout por defecto.

**Scope confidence:** medium — Depende del ADR de WI-009 y de la frecuencia aún no definida.

**Dependencies:**
- WI-009
- WI-005
- WI-007

**Acceptance criteria:**
- [ ] Cada servicio activo se verifica según la frecuencia configurada.
- [ ] Se registran el resultado, el código HTTP, el tiempo de respuesta y la hora de cada verificación.
- [ ] Un timeout se registra como fallo con su motivo.
- [ ] Los servicios inactivos no se verifican.
- [ ] Una verificación lenta no bloquea las de los demás servicios.
- [ ] Si el monitor no puede ejecutar la verificación (p. ej. sin red local), se marca como verificación no realizada, no como fallo del servicio (BR-08).

**Out of scope:**
- Cálculo del estado de salud (WI-011).
- Verificaciones no HTTP (TCP, DNS).

**How to test it (validation):**
1. `pnpm test` → pruebas del feature `checks` con servicios simulados (éxito, error HTTP, timeout).
2. Manual: registrar un servicio de prueba que responde y otro que no → verificar los resultados registrados.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Conocimiento afectado actualizado (capabilities / current-state / ADR).
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿Con qué frecuencia se verifica cada servicio?
- [open] ¿Algunos servicios requieren autenticación para su verificación?

**Suggested ownership (code globs):**
- `src/features/checks/**`
- `src/features/metrics/**`

**Related domain / capability:** Verificación de salud / Verificación periódica de salud, Recolección de métricas de rendimiento

**Related decisions:** Pendiente de ADR: Mecanismo de ejecución periódica de verificaciones

## Implementation Notes

- Migración `service_checks`: tabla `service_checks` (enum `check_outcome`: success | failure | skipped; `http_status`, `response_time_ms`, `error_message`; índices `(service_id, checked_at DESC)` y `checked_at`) y columnas en `services`: `check_interval_seconds` (60), `timeout_ms` (10000), `next_check_at`, `last_checked_at`, `last_response_time_ms`, `consecutive_failures`, con CHECK en la base.
- `src/features/checks/server/`: `http-check.ts` (GET con timeout, mensajes de error accionables), `check-runner.ts` (`claimDueServices` con `FOR UPDATE SKIP LOCKED`, `recordCheckResult` transaccional, canary BR-08, `purgeOldChecks` por lotes) y `config.ts`.
- Worker `src/worker/index.ts` (`pnpm worker` / `pnpm worker:dev`): ciclo con concurrencia limitada, verificaciones independientes, purga diaria y apagado ordenado con SIGTERM. Target `worker` en el `Dockerfile` (usuario `node`) y servicio `worker` en `docker-compose.yml`.
- Formulario de servicio con frecuencia (s) y tiempo de espera (ms).
- Ajustes de Docker: `npm_config_verify_deps_before_run=false` (pnpm 11 intentaba reinstalar dependencias dentro del contenedor) y lockfile copiado en todas las etapas; tras cambiar dependencias usar `docker compose up --build -V`.
- Validado: 6 pruebas unitarias y 7 de integración nuevas (88 unitarias y 26 de integración en total): solo se reclaman activos y vencidos; reclamos simultáneos sin duplicados; éxito, 503 y timeout con su motivo; fallos consecutivos y reinicio; una verificación lenta no bloquea a una rápida; canary sin conexión → `skipped` sin contar fallo; purga por retención. Worker real contra un servidor HTTP local: verificación cada 10 s según la frecuencia; 200/404/conexión rechazada registrados; servicios inactivos no verificados; SIGTERM detiene ordenadamente. `docker compose up` con app + worker + db; imagen `worker` de producción conecta a la base y se detiene con SIGTERM. `typecheck`, `lint` y `build` pasan.
- Pendiente: aceptación de ADR-004 y ADR-005; frecuencia por defecto definitiva; revisión humana.
