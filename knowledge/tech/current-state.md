---
type: current-state
project_state: ai-assisted
generated_by: kaddo-bootstrap
template_version: 1
refined_by: implementation-agent
---

> Idioma del proyecto: **español**. Escribe este conocimiento en español. Mantén en inglés el código, los nombres de archivo, los comandos y las claves de configuración.

# Current State

## Initial technical direction

- **Aplicación web** Next.js 16 (App Router) + React 19 + TypeScript estricto + Tailwind CSS 4, **mobile-first** y responsive, con tema claro y oscuro (línea gráfica en `resources/lineagrafica/`).
- **Backend en la misma aplicación:** Route Handlers delgados (`app/api/**`) que delegan en `src/features/<feature>/server/`. Estructura y convenciones en `knowledge/tech/codebase.md`.
- **Persistencia:** PostgreSQL 18 con Prisma 7.10 y `@prisma/adapter-pg`, esquema configurable con `DB_SCHEMA` (normalmente `health_extern`) — [ADR-001](./decisions/ADR-001-persistencia-postgresql-prisma.md).
- **Autenticación:** JWT de acceso + sesiones revocables en base de datos, cookies `httpOnly` — [ADR-002](./decisions/ADR-002-autenticacion-jwt-sesiones-revocables.md) (draft).
- **Autorización:** roles `superadmin`, `admin` y `nuevo` con permisos `<recurso>.<acción>` revocables por usuario — [ADR-003](./decisions/ADR-003-modelo-de-autorizacion-roles-permisos.md) (draft).
- **Verificaciones periódicas:** proceso worker separado que reclama servicios vencidos con `FOR UPDATE SKIP LOCKED` — [ADR-004](./decisions/ADR-004-ejecucion-periodica-de-verificaciones.md) (draft).
- **Historial:** resultados crudos con retención de 30 días, estado actual en `services` y transiciones de estado con retención de 365 días — [ADR-005](./decisions/ADR-005-historial-y-retencion.md) (draft).
- **Contenedores:** un `Dockerfile` multi-stage (`dev`, `prod`, `migrator`, `worker`) y `docker-compose.yml` solo para desarrollo local; en producción la base es una instancia aparte.

## Known constraints

- Node.js >= 24 (Vitest 5 requiere >= 22.12).
- Prisma 7 no carga `.env` ni regenera el cliente después de migrar (resuelto en `prisma.config.ts` y `scripts/db-migrate.sh`).
- Next.js 16: `middleware` se llama `proxy.ts`; `params` y `searchParams` son promesas.
- Las variables `DB_*`, `JWT_*`, `SEED_*` y las del worker son solo de servidor (nunca `NEXT_PUBLIC_`).
- El tema claro usa valores **provisionales** hasta que la línea gráfica entregue los oficiales.
- Equipo pequeño: el MVP se limita a configuración inicial, autenticación, catálogo, verificación, estado y panel.

## Unknowns

- [open] Valores oficiales del tema claro.
- [open] Cómo se ejecutan las migraciones en producción (hay un target `migrator` disponible).
- [open] Frecuencia de verificación y umbrales por defecto definitivos (hoy: 60 s, 1000 ms y 3 fallos, supuestos).
- [open] Canal de alertas: propuesta en ADR-006 (bandeja en la app + webhook de Slack o Teams), pendiente de aceptación.
- [open] Contrato de envío de métricas desde las aplicaciones (WI-018).
- [open] Límite de intentos de login.
