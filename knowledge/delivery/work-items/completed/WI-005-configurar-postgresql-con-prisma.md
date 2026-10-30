---
type: chore
id: WI-005
title: Configurar PostgreSQL con Prisma
knowledge_level: K2
status: completed
phase: now
initiative: Configuración inicial del proyecto Next.js
domains:
  - Plataforma
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-005
source_initiative: RM-001
source_roadmap_initiative: RM-001
source_work_item_candidate: WI-CANDIDATE-005
source_title: Configurar PostgreSQL con Prisma
source_context: Materialized from roadmap candidate WI-CANDIDATE-005 under initiative RM-001.
source_initiative_title: Configuración inicial del proyecto Next.js
related_domain: Plataforma
related_capabilities:
  - Fundación técnica de la plataforma
expected_value: >-
  Aplicación conectada a PostgreSQL mediante Prisma, con el esquema configurable
  por entorno y sin modelos de negocio todavía.
risks:
  - >-
    Múltiples instancias del cliente Prisma durante el hot reload de desarrollo
    (agotamiento de conexiones).
  - Credenciales de base de datos expuestas en el repositorio.
  - Conexión al esquema equivocado si `DB_SCHEMA` no se respeta.
dependencies:
  - WI-002
source_signals:
  - >-
    Decisión del equipo (2026-10-05): persistencia en PostgreSQL con Prisma como
    ORM.
  - >-
    Decisión del equipo (2026-10-05): conexión por variables de entorno con el
    esquema configurable (`DB_SCHEMA`, por defecto `public`; normalmente
    `health_extern`).
  - >-
    Decisión del equipo (2026-10-05): PostgreSQL en la última versión estable
    (18).
decision_candidates:
  - Persistencia en PostgreSQL con Prisma
related_decisions: []
summary: >-
  No hay conexión a base de datos sobre la que las features puedan persistir
  datos.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Configurar PostgreSQL con Prisma

> Type: chore · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-001 — Configuración inicial del proyecto Next.js
- Work Item Candidate: WI-CANDIDATE-005
- Related domain: Plataforma
- Related capabilities:
  - Fundación técnica de la plataforma

> Warning: La decisión "Persistencia en PostgreSQL con Prisma" fue tomada por el equipo (2026-10-05) pero aún no está materializada como ADR. Formalízala antes de implementar (`kaddo adr` + skill adr-writing).

> **Alcance:** configuración inicial del proyecto. Este Work Item **no incluye lógica de negocio**.

**Actor and outcome:** Equipo técnico: dispone de una conexión a PostgreSQL lista para que cada feature agregue sus modelos.

**Current behavior:** No hay ORM, base de datos ni variables de entorno.

**Target behavior:**
- Prisma instalado y configurado con `provider = "postgresql"`; `prisma/schema.prisma` **sin modelos de negocio**.
- Variables documentadas en `.env.example` (sin credenciales reales):

  | Variable | Descripción | Valor en `.env.example` |
  |---|---|---|
  | `DB_HOST` | Host de PostgreSQL | `localhost` |
  | `DB_PORT` | Puerto | `5432` |
  | `DB_NAME` | Base de datos | `health_apps` |
  | `DB_USER` | Usuario | `postgres` |
  | `DB_PASSWORD` | Contraseña | `postgres` _(solo local)_ |
  | `DB_SCHEMA` | Esquema | `public` _(en `.env` normalmente `health_extern`)_ |
  | `DATABASE_URL` | URL que consume Prisma, compuesta a partir de las anteriores, con `?schema=${DB_SCHEMA}` | derivada |

- Si `DB_SCHEMA` no está definida, se usa `public`. Las variables `DB_*` nunca llevan el prefijo `NEXT_PUBLIC_`.
- Cliente Prisma único en `src/lib/db/`, protegido contra múltiples instancias en el hot reload y usado solo en el servidor.
- Scripts `db:generate`, `db:migrate` y `db:deploy` en `package.json`.
- El cliente Prisma se genera en `postinstall` o en el build (verificar lo recomendado para la versión usada).

**Entry points:** `prisma/schema.prisma`, `src/lib/db/`, `.env.example`, `.gitignore`, `package.json`.

**End-to-end flow:** El desarrollador copia `.env.example` a `.env` → define `DB_SCHEMA=health_extern` → `pnpm db:generate` → la aplicación se conecta a PostgreSQL en ese esquema.

**Problem:** No hay conexión a base de datos sobre la que las features puedan persistir datos.

**Expected result:** La aplicación se conecta a PostgreSQL mediante Prisma, en el esquema indicado por `DB_SCHEMA`.

**Suggested Knowledge Level:** K2

**Impact analysis:**
- frontend: reviewed-not-affected
- backend: affected
- database: affected
- configuration: affected
- authentication: not-applicable
- notifications: not-applicable
- documentation: affected
- operations: affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Versión de Prisma y si requiere `prisma.config.ts` o un driver adapter (`@prisma/adapter-pg`): esto define dónde se compone `DATABASE_URL` a partir de las `DB_*`.
- Cómo se garantiza que el esquema `DB_SCHEMA` exista antes de la primera migración de negocio (script de inicialización en Docker o la propia migración).

**Scope confidence:** high — Tecnología y variables decididas; quedan detalles de versión.

**Dependencies:**
- WI-002

**Acceptance criteria:**
- [ ] `prisma/schema.prisma` usa `provider = "postgresql"`, toma la conexión de `DATABASE_URL` y no contiene modelos de negocio.
- [ ] `.env.example` define `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SCHEMA=public` y `DATABASE_URL` compuesta con `?schema=`.
- [ ] Sin `DB_SCHEMA`, la conexión usa `public`.
- [ ] `.env` está en `.gitignore`; no se suben credenciales.
- [ ] El cliente Prisma se instancia una sola vez en `src/lib/db/` y no se importa desde componentes cliente.
- [ ] Existen los scripts `db:generate`, `db:migrate` y `db:deploy`.
- [ ] Existe una prueba de integración que se conecta y ejecuta `SELECT current_schema()`, que devuelve el valor de `DB_SCHEMA` (con `health_extern` en `.env`).
- [ ] `pnpm build` funciona con la configuración de base de datos.

**Out of scope:**
- Cualquier funcionalidad de negocio (servicios monitoreados, verificaciones, estados, alertas).
- Modelos de negocio y sus migraciones (cada WI de dominio agrega los suyos; p. ej. `Service` en WI-007).
- Docker y `docker-compose.yml` (WI-006).
- Instancia de PostgreSQL de producción.

**How to test it (validation):**
1. Con PostgreSQL disponible (local o el de WI-006): `cp .env.example .env`, definir `DB_SCHEMA=health_extern` → `pnpm db:generate` sin errores.
2. `pnpm test` → la prueba de conexión devuelve `health_extern` como esquema actual.
3. Manual: con `next dev` en ejecución, editar un archivo varias veces → el número de conexiones en PostgreSQL no crece.
4. Manual: `git status` no muestra `.env`.
5. `pnpm build` → éxito.
6. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan (y `pnpm test` cuando exista).
- [ ] `knowledge/tech/codebase.md` y `knowledge/tech/current-state.md` actualizados si cambió algo.
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.
- [ ] ADR "Persistencia en PostgreSQL con Prisma" creado en `knowledge/tech/decisions/`.

**Open questions:**
- [open] ¿Cómo se ejecutan las migraciones en producción (`prisma migrate deploy` al arrancar o como paso del despliegue)?

**Suggested ownership (code globs):**
- `prisma/**`
- `src/lib/db/**`
- `.env.example`

**Related domain / capability:** Plataforma / Fundación técnica de la plataforma

**Related decisions:** Pendiente de ADR: Persistencia en PostgreSQL con Prisma

## Implementation Notes

- **Prisma 7.10.0** (última estable; `latest` en npm apunta a 8.0.0-rc) + `@prisma/adapter-pg` + `pg`. `prisma/schema.prisma` sin modelos de negocio; cliente generado en `src/generated/prisma` (gitignored, `postinstall`).
- `src/lib/db/config.ts`: compone la URL desde `DB_*` (codifica la contraseña), aplica `?schema=DB_SCHEMA` (por defecto `public`), valida el nombre del esquema y acepta `DATABASE_URL` como alternativa opcional. La comparten `prisma.config.ts` y el cliente.
- `src/lib/db/index.ts`: cliente único (`globalThis` en desarrollo), `server-only`, esquema por opción del adaptador y por `search_path`.
- `.env.example` con `DB_*` y `DB_SCHEMA=public`; `.gitignore` permite `.env.example` (antes `.env*` lo ignoraba). Scripts `db:generate`, `db:migrate`, `db:deploy`, `test:integration`; `pnpm-workspace.yaml` permite los builds de Prisma y esbuild.
- Extra: `GET /api/health` (estado de la app y la base) para el healthcheck de Docker (WI-006).
- **Desviación:** `DATABASE_URL` no se escribe compuesta en `.env.example` (Prisma 7 no expande variables); se compone en código y es opcional.
- Validado contra un PostgreSQL 18 temporal con `DB_SCHEMA=health_extern`: `db:migrate` crea el esquema; la prueba de integración devuelve `current_schema() = health_extern`; 6 pruebas unitarias de configuración; `/api/health` responde 200; las conexiones se mantienen en 1 tras 3 recargas en caliente; `typecheck`, `lint` y `build` pasan.
- Pendiente: ADR "Persistencia en PostgreSQL con Prisma"; cómo se ejecutan las migraciones en producción; revisión humana.
