# Health Apps

Centro de monitoreo centralizado del estado, la disponibilidad y el rendimiento de las
aplicaciones y servicios en operación. Aplicación web **mobile-first**, responsive para
escritorio.

El conocimiento del proyecto (negocio, producto, arquitectura, roadmap y Work Items) vive en
[`knowledge/`](./knowledge). La estructura y las convenciones de código están en
[`knowledge/tech/codebase.md`](./knowledge/tech/codebase.md).

## Requisitos

- Node.js >= 24 (ver `.nvmrc`)
- pnpm 11

## Desarrollo local con Docker

```bash
cp .env.example .env      # define DB_SCHEMA (normalmente health_extern)
docker compose up         # app (next dev con hot reload) + worker + PostgreSQL 18
```

- La app queda en http://localhost:3000 y aplica las migraciones al arrancar.
- `docker-compose.yml` es **solo para desarrollo local**. En producción se usa la imagen del
  target `prod` del `Dockerfile`, conectada a una instancia de PostgreSQL aparte con las mismas
  variables `DB_*` inyectadas en tiempo de ejecución.
- Al arrancar, `app` y `worker` ejecutan `pnpm install --frozen-lockfile`: si cambian las dependencias, el contenedor se actualiza solo.
- Para ejecutar la app fuera de Docker, deja solo la base: `docker compose up db` y `pnpm dev`.

## Imagen de producción

```bash
docker build --target prod -t health-apps .
docker run -p 3000:3000 -e DB_HOST=... -e DB_PORT=5432 -e DB_NAME=... \
  -e DB_USER=... -e DB_PASSWORD=... -e DB_SCHEMA=health_extern health-apps
docker build --target migrator -t health-apps-migrator .   # aplica las migraciones (prisma migrate deploy)
```

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Sirve el build de producción |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Verificación de tipos (`next typegen` + `tsc --noEmit`) |
| `pnpm test` | Pruebas unitarias (Vitest) |
| `pnpm test:integration` | Pruebas contra la base de datos del `.env` |
| `pnpm db:migrate` | Crea y aplica migraciones en desarrollo |
| `pnpm db:deploy` | Aplica migraciones en producción |

## Estructura

```
app/        rutas y composición de páginas (App Router)
src/
  components/  UI reutilizable, sin reglas de negocio
  features/    una carpeta por dominio
  layouts/     layout principal y navegación
  hooks/       hooks transversales
  lib/         helpers sin estado
  types/       tipos compartidos
```
