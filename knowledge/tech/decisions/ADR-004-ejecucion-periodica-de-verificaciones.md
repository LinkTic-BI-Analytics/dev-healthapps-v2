---
type: adr
id: ADR-004
status: draft
date: 2026-10-05
code:
  - src/worker/**
  - src/features/checks/server/**
  - Dockerfile
  - docker-compose.yml
related_work_items: [WI-009, WI-010, WI-017]
---

# ADR-004 — Verificaciones periódicas en un proceso worker separado

## Context

Cada servicio activo debe verificarse periódicamente (WI-010) sin que una verificación lenta bloquee a las demás, sin verificaciones duplicadas si hay varias réplicas y sin marcar caído un servicio por una falla del propio monitor (BR-08). La aplicación web se despliega como contenedor (ADR-001).

## Options Considered

1. **Proceso worker separado** (propuesta): mismo código y misma imagen base, comando `pnpm worker`; en local, servicio `worker` en `docker-compose.yml`; en producción, un contenedor más.
2. Temporizador dentro del servidor Next.js (`instrumentation.ts`): un solo contenedor, pero mezcla tráfico web con tareas de fondo, y cada réplica web ejecutaría verificaciones.
3. Cron externo que llama a un endpoint protegido: depende de infraestructura externa y de un secreto compartido; la duración de la petición limita las verificaciones lentas.
4. Cola de trabajos (p. ej. BullMQ + Redis): robusto, pero agrega Redis solo para esto.

## Decision

Propuesta (pendiente de aceptación):

- **Worker separado** (`src/worker/index.ts`), sin servidor HTTP, que reutiliza `src/features/*/server`.
- **Planificación en la base:** cada servicio guarda `next_check_at`. Cada `CHECK_TICK_SECONDS` (por defecto 5) el worker **reclama** los servicios activos vencidos con `SELECT … FOR UPDATE SKIP LOCKED` y adelanta su `next_check_at` en la misma transacción. Dos workers nunca verifican el mismo servicio a la vez; se puede escalar a varias réplicas.
- **Frecuencia y timeout por servicio:** `check_interval_seconds` (por defecto 60, mínimo 10) y `timeout_ms` (por defecto 10 000).
- **Concurrencia limitada:** como máximo `CHECK_CONCURRENCY` (por defecto 10) verificaciones simultáneas por worker; una verificación lenta no bloquea las demás.
- **Fallas del monitor (BR-08):** si la verificación no se puede ejecutar por un problema propio (error interno, o falla de la URL de control `MONITOR_CANARY_URL` si está definida), el resultado se guarda como `skipped` y no cuenta como fallo del servicio.
- Apagado ordenado con `SIGTERM`: deja de reclamar y espera las verificaciones en curso.

## Consequences

- (+) Separación clara entre web y tareas de fondo; se escala por separado.
- (+) Sin dependencias nuevas: PostgreSQL coordina a los workers.
- (−) Un contenedor más que desplegar y monitorear.
- (−) La precisión del intervalo es la del tick (±5 s), suficiente para monitoreo.

## Related Capabilities

- Verificación de salud / Verificación periódica de salud

## Related Work Items

- WI-009, WI-010, WI-011, WI-017
