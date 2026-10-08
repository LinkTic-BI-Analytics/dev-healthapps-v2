---
type: adr
id: ADR-001
status: accepted
date: 2026-10-05
code:
  - prisma/**
  - src/lib/db/**
  - Dockerfile
  - docker-compose.yml
related_work_items: [WI-005, WI-006]
---

# ADR-001 — Persistencia en PostgreSQL 18 con Prisma

## Context

Health Apps necesita guardar usuarios, servicios monitoreados, resultados de verificación e historial de estados. El equipo debía elegir motor, ORM y forma de ejecutarlo en desarrollo y producción.

## Options Considered

1. **PostgreSQL + Prisma** (elegida): relacional, transacciones, índices y restricciones; Prisma da tipos y migraciones versionadas.
2. PostgreSQL + SQL directo (`pg`): más control, pero sin tipos generados ni migraciones gestionadas.
3. Base de series de tiempo (p. ej. TimescaleDB): mejor para métricas masivas, pero agrega una dependencia que la instancia de producción no garantiza.

## Decision

Decisión del equipo (2026-10-05):

- **PostgreSQL 18** (última estable a la fecha) con **Prisma 7.10** y el adaptador `@prisma/adapter-pg`.
- Conexión por variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `DB_SCHEMA` (por defecto `public`; normalmente `health_extern`). `DATABASE_URL` es opcional.
- Desarrollo local con `docker-compose.yml` (PostgreSQL 18 + app); en producción, una **instancia de PostgreSQL aparte**. Un único `Dockerfile` multi-stage para desarrollo y producción.
- Convenciones de tablas de `knowledge/tech/codebase.md` (plural, `snake_case`, PK uuid, `created_at`/`updated_at`).

## Consequences

- (+) Tipos generados, migraciones versionadas (`prisma/migrations`) y un solo motor para todo.
- (+) El esquema configurable permite convivir con otras aplicaciones en la misma base.
- (−) Prisma 7 no carga `.env` ni regenera el cliente tras migrar: se resolvió con `prisma.config.ts` y `scripts/db-migrate.sh`.
- (−) El volumen de resultados de verificación crece rápido: requiere política de retención (ADR-005).
- Pendiente: decidir si las migraciones de producción corren con el target `migrator` como paso del despliegue.

## Related Capabilities

- Plataforma / Fundación técnica de la plataforma

## Related Work Items

- WI-005, WI-006
