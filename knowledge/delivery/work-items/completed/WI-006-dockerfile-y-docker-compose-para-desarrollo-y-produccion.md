---
type: chore
id: WI-006
title: Dockerfile y Docker Compose para desarrollo y producción
knowledge_level: K2
status: completed
phase: now
initiative: Configuración inicial del proyecto Next.js
domains:
  - Plataforma
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-006
source_initiative: RM-001
source_roadmap_initiative: RM-001
source_work_item_candidate: WI-CANDIDATE-006
source_title: Dockerfile y Docker Compose para desarrollo y producción
source_context: Materialized from roadmap candidate WI-CANDIDATE-006 under initiative RM-001.
source_initiative_title: Configuración inicial del proyecto Next.js
related_domain: Plataforma
related_capabilities:
  - Fundación técnica de la plataforma
expected_value: >-
  Entorno local reproducible con un solo comando e imagen de producción lista
  para desplegar.
risks:
  - Imagen de producción con dependencias de desarrollo o secretos incluidos.
  - Diferencias entre PostgreSQL local y la instancia de producción.
dependencies:
  - WI-001
  - WI-005
source_signals:
  - >-
    Decisión del equipo (2026-10-05): un único `Dockerfile` para desarrollo y
    producción.
  - >-
    Decisión del equipo (2026-10-05): PostgreSQL 18 con Docker Compose solo en
    desarrollo local; en producción, instancia aparte.
decision_candidates:
  - Persistencia en PostgreSQL con Prisma
related_decisions: []
summary: No hay un entorno local reproducible ni una imagen de despliegue.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Dockerfile y Docker Compose para desarrollo y producción

> Type: chore · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-001 — Configuración inicial del proyecto Next.js
- Work Item Candidate: WI-CANDIDATE-006
- Related domain: Plataforma
- Related capabilities:
  - Fundación técnica de la plataforma

> Warning: La decisión "Persistencia en PostgreSQL con Prisma" fue tomada por el equipo (2026-10-05) pero aún no está materializada como ADR. Formalízala antes de implementar (`kaddo adr` + skill adr-writing).

> **Alcance:** configuración inicial del proyecto. Este Work Item **no incluye lógica de negocio**.

**Actor and outcome:** Equipo técnico: levanta el entorno local con un solo comando y construye la imagen de producción con el mismo `Dockerfile`.

**Current behavior:** No hay archivos de Docker.

**Target behavior:**
- **`Dockerfile` multi-stage**, usado en desarrollo y en producción:
  - target `dev`: ejecuta `next dev` con el código montado como volumen (hot reload).
  - target `prod`: `pnpm build` y ejecución con `next start` o la salida `standalone` (verificar en `node_modules/next/dist/docs/`); solo lo necesario para ejecutar, usuario no root, sin `.env` ni credenciales; el cliente Prisma se genera en el build.
- **`.dockerignore`** que excluye `node_modules`, `.next` y `.env`.
- **`docker-compose.yml` (solo desarrollo local)**:
  - servicio `db`: imagen `postgres:18`, volumen persistente, healthcheck, configurado con las variables `DB_*` del `.env`; crea el esquema `DB_SCHEMA` si no existe.
  - servicio `app`: target `dev`, se conecta a `db` por el nombre del servicio y arranca cuando la base está lista.
- En producción, la imagen `prod` se conecta a una **instancia de PostgreSQL aparte** con las mismas variables, inyectadas en tiempo de ejecución.

**Entry points:** `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `README.md`.

**End-to-end flow:** El desarrollador clona el repo → `cp .env.example .env` (con `DB_SCHEMA=health_extern`) → `docker compose up` → la aplicación queda accesible y conectada a PostgreSQL 18.

**Problem:** No hay un entorno local reproducible ni una imagen de despliegue.

**Expected result:** `docker compose up` levanta la aplicación y PostgreSQL en local, y `docker build --target prod` produce la imagen de producción.

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
- La imagen `postgres:18` cambió la ruta de datos respecto a versiones anteriores: verificar en su documentación el punto de montaje del volumen.
- PostgreSQL 19 está en beta (lanzamiento previsto para octubre de 2026): confirmar si se adopta si sale antes de implementar.

**Scope confidence:** high — Enfoque y versiones decididos.

**Dependencies:**
- WI-001
- WI-005

**Acceptance criteria:**
- [ ] Existe un único `Dockerfile` multi-stage con los targets `dev` y `prod`, y un `.dockerignore`.
- [ ] `docker build --target prod` produce una imagen que corre con un usuario no root, sin `.env` ni dependencias de desarrollo.
- [ ] La imagen `prod` arranca con las variables `DB_*` inyectadas en tiempo de ejecución y se conecta a una base externa.
- [ ] `docker-compose.yml` define `db` (`postgres:18`, volumen y healthcheck) y `app` (target `dev`), configurados con el `.env`.
- [ ] Con `DB_SCHEMA=health_extern`, el esquema existe en la base local después de `docker compose up`.
- [ ] El hot reload funciona dentro del contenedor `app`.
- [ ] `README.md` indica que `docker-compose.yml` es solo para desarrollo local y que en producción se usa la imagen `prod` con una instancia de base de datos aparte.
- [ ] E2E: en un clon limpio, `cp .env.example .env` + `docker compose up` → la aplicación es accesible en el navegador y la prueba de conexión de WI-005 pasa contra el contenedor `db`.

**Out of scope:**
- Cualquier funcionalidad de negocio (servicios monitoreados, verificaciones, estados, alertas).
- Pipeline de CI/CD y despliegue.
- Provisión de la instancia de PostgreSQL de producción.

**How to test it (validation):**
1. `docker compose up` → `db` y `app` en estado saludable.
2. `psql` → `\dn` muestra el esquema `health_extern`.
3. Editar un componente → el cambio se ve sin reiniciar el contenedor.
4. `docker build --target prod -t health-apps .` → éxito; `docker run --rm health-apps whoami` no devuelve `root`.
5. `docker run` de la imagen `prod` con las `DB_*` apuntando a una base de prueba → la aplicación arranca y conecta.
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
- [open] ¿Cómo se ejecutan las migraciones en producción?

**Suggested ownership (code globs):**
- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`

**Related domain / capability:** Plataforma / Fundación técnica de la plataforma

**Related decisions:** Pendiente de ADR: Persistencia en PostgreSQL con Prisma

## Implementation Notes

- `Dockerfile` multi-stage sobre `node:24-alpine`: `deps` (pnpm con caché, genera Prisma), `dev` (genera cliente, aplica migraciones y corre `next dev` en 0.0.0.0), `builder`, `migrator` (`prisma migrate deploy`) y `prod` (salida `standalone`, usuario `nextjs` no root, `HEALTHCHECK` a `/api/health`, sin `.env`). `next.config.ts` con `output: "standalone"`.
- `.dockerignore` (excluye `node_modules`, `.next`, `.env*`, `.git`, `knowledge`, `resources`).
- `docker-compose.yml` (solo local): `db` = `postgres:18`, volumen en `/var/lib/postgresql` (PGDATA de la imagen 18 = `/var/lib/postgresql/18/docker`), healthcheck, script `docker/postgres/init/01-create-schema.sh` que crea `DB_SCHEMA`; `app` = target `dev`, `DB_HOST=db`, código montado con `node_modules` y `.next` propios del contenedor.
- Cambio en `src/lib/db/index.ts`: el cliente de Prisma se crea en el primer uso (Proxy) para que `next build` no requiera las variables DB_* (en producción se inyectan al ejecutar).
- Se quitó `# syntax=docker/dockerfile:1` (no se pudo descargar por timeout de red; el BuildKit integrado soporta `--mount=type=cache`).
- Validado: `docker compose up` → `db` healthy y `app` arriba; `/api/health` 200; esquema `health_extern` creado; hot reload dentro del contenedor (cambio visible sin reiniciar); `pnpm test:integration` contra el contenedor `db`; `docker build --target prod` (300 MB); `whoami` = `nextjs`; la imagen `prod` conecta a la base externa con `DB_*` en tiempo de ejecución; no hay `.env` en la imagen.
- Pendiente: decisión de cómo migrar en producción (está disponible el target `migrator`); ADR de persistencia; revisión humana.
