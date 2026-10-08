<!-- Repositorio migrado a bi-analytics-linktic/dev-healthapps-v2 -->
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
cp .env.example .env      # JWT_*, SEED_*, CHECK_*… (las DB_* no se usan en Docker)
docker compose up         # app (next dev con hot reload) + worker + PostgreSQL 18
```

- La app queda en http://localhost:3000 y aplica las migraciones y el seed al arrancar.
- **Docker Compose siempre usa la base local** (contenedor `db`, usuario/contraseña `postgres`,
  base `health_apps`, esquema `app_health`, sin SSL). Las `DB_*` y `DATABASE_URL` del `.env` se
  sobrescriben en `docker-compose.yml`, así que el `.env` puede apuntar a Supabase sin que
  `docker compose up` lo toque.
- Si el puerto 5432 del equipo está ocupado: `LOCAL_DB_PORT=5433 docker compose up`.
- Si la base local se creó con otras credenciales (el volumen conserva las de la primera vez) y la
  app no puede autenticarse, recrea el volumen local: `docker compose down -v` (**borra los datos
  locales**, no los de Supabase).
- `docker-compose.yml` es **solo para desarrollo local**. En producción se usa la imagen del
  target `prod` del `Dockerfile`, conectada a Supabase con las variables `DB_*` inyectadas en
  tiempo de ejecución.
- Al arrancar, `app` y `worker` ejecutan `pnpm install --frozen-lockfile`: si cambian las dependencias, el contenedor se actualiza solo.
- Para ejecutar la app fuera de Docker contra la base local: `docker compose up db` y, en el
  `.env`, `DB_HOST=localhost`, `DB_USER=postgres`, `DB_PASSWORD=postgres`, `DB_NAME=health_apps`,
  `DB_SSLMODE=` (vacío). Con `pnpm dev` la app usa **lo que diga el `.env`**: si apunta a
  Supabase, trabajas contra Supabase.

## Imagen de producción

```bash
docker build --target prod -t health-apps .
docker run -p 3000:3000 -e DB_HOST=... -e DB_PORT=5432 -e DB_NAME=... \
  -e DB_USER=... -e DB_PASSWORD=... -e DB_SCHEMA=app_health health-apps
docker build --target migrator -t health-apps-migrator .   # aplica las migraciones (prisma migrate deploy)
```

## Base de datos en Supabase (esquema `app_health`)

La app comparte la base de Supabase con otros sistemas, así que **todo lo suyo vive en el esquema
`app_health`** y nada de lo que hace (app, worker, seed ni migraciones) toca otros esquemas.
Se conecta directo a PostgreSQL con Prisma: **no usa `supabase-js`**, así que no necesita
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ni `SUPABASE_SECRET_KEY`
(y una clave secreta nunca debe llevar el prefijo `NEXT_PUBLIC_`).

### Variables de conexión

Los datos salen de Supabase → *Connect* → *Session pooler* (no uses el *Transaction pooler*,
puerto 6543, para las migraciones):

```bash
DB_HOST=aws-0-<region>.pooler.supabase.com   # la región del proyecto, p. ej. us-west-2
DB_PORT=5432                                  # pooler en modo sesión
DB_NAME=postgres
DB_USER=app_health_owner.<project-ref>        # con el pooler, el usuario lleva .<project-ref>
DB_PASSWORD=...
DB_SCHEMA=app_health
DB_SSLMODE=require                            # obligatorio: sin esto la conexión va sin cifrar
```

- `DB_SSLMODE=require` cifra la conexión sin validar el certificado: la CA de Supabase no está en
  el almacén de Node, y con validación estricta falla con `self-signed certificate in certificate chain`.
- En lugar de las `DB_*` se puede usar `DATABASE_URL` (la URI de Supabase); `DB_SCHEMA` y
  `DB_SSLMODE` se le aplican igual.
- La contraseña va en claro en el `.env` (la app la codifica); el `.env` está en `.gitignore`.
- **En Vercel usa el *Transaction pooler* (`DB_PORT=6543`)**: el modo sesión admite solo 15 clientes
  y cada instancia de Vercel abre su propio pool (error `EMAXCONNSESSION`). Las migraciones siguen
  corriendo con el modo sesión (5432) desde tu máquina. El SQL crudo funciona igual porque el rol
  tiene `search_path = app_health` (ver `scripts/supabase/app-health-setup.sql`).

### Puesta en marcha (una sola vez por entorno)

1. Un administrador ejecuta [`scripts/supabase/app-health-setup.sql`](./scripts/supabase/app-health-setup.sql)
   en el SQL Editor como `postgres`, cambiando antes la contraseña. Crea el esquema `app_health`
   y el rol `app_health_owner`, dueño solo de ese esquema: la propia base le impide crear o
   modificar objetos en `public`, `auth`, `storage` o cualquier otro esquema.
2. Configura las variables de arriba **con `app_health_owner`, nunca con `postgres`**.
3. Comprueba la conexión (solo lectura): `pnpm exec prisma migrate status` debe mostrar
   `schema "app_health"` y las migraciones pendientes.
4. `pnpm db:deploy` crea las tablas en `app_health` (Prisma también crea ahí su tabla de control
   `_prisma_migrations`; las migraciones no califican el esquema).
5. Define `SEED_SUPERADMIN_*` y ejecuta `pnpm db:seed` (roles, permisos y el primer superadmin).

### Protecciones

- `DB_SCHEMA` por defecto es `app_health`; `public` y los esquemas de Supabase/PostgreSQL
  (`auth`, `storage`, `extensions`, `pg_*`, ...) se rechazan al arrancar (`src/lib/db/config.ts`).
- `prisma migrate dev`, `prisma migrate reset`, `prisma db push` y `prisma db execute` están
  bloqueados contra cualquier host que no sea local (`prisma.config.ts`). Las migraciones nuevas
  se crean en local (`docker compose up db` + `pnpm db:migrate`) y en Supabase solo se aplican
  con `pnpm db:deploy`.
- `pnpm test:integration` crea y borra datos de prueba: ejecútalo solo contra la base local.

## Despliegue en Vercel: verificaciones manuales

Las verificaciones periódicas las hace el **worker** (`src/worker/index.ts`), un proceso que corre
siempre en segundo plano. **Vercel no ejecuta procesos permanentes** (y en el plan gratuito el cron
solo puede correr una vez al día), así que en Vercel el worker no existe:

- La app detecta Vercel (`VERCEL=1`) y pasa a **modo `manual`**: el Panel y el detalle de cada
  servicio muestran un aviso con la limitación y el botón **Verificar ahora**.
- El botón llama a `POST /api/checks/run` (permiso `services.read`), que verifica en ese momento
  todos los servicios activos, guarda los resultados igual que el worker y aplica la retención.
  Un servicio verificado hace menos de 15 s se omite, para que varios clics no repitan peticiones.
- La petición puede tardar hasta el timeout del servicio más lento (`maxDuration` = 60 s).
- Sin nadie que pulse el botón no hay datos nuevos: el uptime y el historial solo reflejan las
  verificaciones hechas a mano.

Fuera de Vercel (Docker, contenedores) todo sigue igual: modo `worker`, verificaciones automáticas.
`CHECKS_MODE=worker|manual` fuerza el modo; por ejemplo `CHECKS_MODE=worker` en Vercel si el worker
se despliega aparte (imagen `worker` del `Dockerfile`) contra la misma base.

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
| `pnpm db:migrate` | Crea y aplica migraciones en desarrollo (solo base local) |
| `pnpm db:deploy` | Aplica migraciones en producción / Supabase |

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
