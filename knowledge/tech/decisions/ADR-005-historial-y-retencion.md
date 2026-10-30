---
type: adr
id: ADR-005
status: draft
date: 2026-10-05
code:
  - prisma/schema.prisma
  - src/features/checks/server/**
  - src/features/history/server/**
related_work_items: [WI-009, WI-010, WI-011, WI-014, WI-015]
---

# ADR-005 — Modelo de resultados, estado actual, historial y retención

## Context

Se necesitan: el estado actual de cada servicio (panel), los resultados recientes de verificación (gráficas de latencia y fallos), el historial de cambios de estado (BR-06) y el uptime por período (BR-07). Volumen estimado: 50 servicios × 1 verificación/min ≈ 72 000 filas/día.

## Options Considered

1. **Tres niveles en PostgreSQL** (propuesta): resultados crudos con retención corta, estado actual desnormalizado y transiciones de estado con retención larga.
2. Guardar solo resultados crudos y calcular todo a partir de ellos: sencillo, pero el uptime de 30 días recorre millones de filas.
3. Extensión TimescaleDB o agregados por hora: más eficiente a gran escala, pero no está garantizada en la instancia de producción. Se puede adoptar más adelante.

## Decision

Propuesta (pendiente de aceptación):

- **`service_checks`** (WI-010): una fila por verificación: `service_id`, `checked_at`, `outcome` (`success` | `failure` | `skipped`), `http_status`, `response_time_ms`, `error_message`. Índice `(service_id, checked_at DESC)`. **Retención: 30 días** (`CHECK_RESULTS_RETENTION_DAYS`).
- **Estado actual en `services`** (WI-010 y WI-011): `health_status` (enum `operativo` | `degradado` | `caido`, nulo hasta la primera verificación), `status_changed_at`, `last_checked_at`, `last_response_time_ms`, `consecutive_failures`, `next_check_at`.
- **`service_status_changes`** (WI-014): una fila por transición: `service_id`, `from_status`, `to_status`, `changed_at`. **Retención: 365 días** (`STATUS_HISTORY_RETENTION_DAYS`). El uptime por período (WI-015) se calcula con las transiciones, no con los resultados crudos.
- **Purga diaria** en el worker (ADR-004), con borrado por lotes para no bloquear la tabla.

## Consequences

- (+) El panel lee una sola tabla (`services`); las gráficas recientes y el uptime usan índices acotados.
- (+) El uptime de 30 días se calcula con pocas filas (las transiciones).
- (−) El estado actual está desnormalizado: debe actualizarse en la misma transacción que el resultado.
- (−) Con más de ~500 servicios o intervalos menores a 1 min habría que revisar agregados (opción 3).

## Related Capabilities

- Métricas e historial / Historial de estados; Cálculo de uptime
- Verificación de salud / Evaluación del estado de salud

## Related Work Items

- WI-009, WI-010, WI-011, WI-014, WI-015
