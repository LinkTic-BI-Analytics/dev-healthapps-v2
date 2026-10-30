---
type: codebase
project_state: ai-assisted
generated_by: kaddo-bootstrap
template_version: 1
refined_by: codebase-agent
---

> Idioma del proyecto: **español**. Escribe este conocimiento en español. Mantén en inglés el código, los nombres de archivo, los comandos y las claves de configuración.

# Codebase Map

Cómo se organiza el proyecto, qué convenciones se siguen y qué se espera de cualquier código nuevo.

> **Origen de las convenciones:** las secciones de estructura, capas y buenas prácticas se adaptan de la guía *"Estructura y buenas prácticas — Savvi Frontend"* del equipo. Health Apps difiere de Savvi en que **no consume un backend aparte**: su backend vive en la misma aplicación Next.js (Route Handlers + Prisma + PostgreSQL). Lo exclusivo de Savvi (S3, OpenAI, JWT contra NestJS, deuda heredada) no aplica y se omitió.

## Stack

| Pieza | Versión / herramienta | Estado |
| --- | --- | --- |
| Framework | Next.js 16: **App Router**, Turbopack | instalado |
| UI | React 19 + TypeScript 5 (`strict: true`) | instalado |
| Estilos | Tailwind CSS v4 (config dentro del CSS) | instalado |
| Gestor de paquetes | pnpm | instalado |
| Base de datos | PostgreSQL 18 + Prisma (ORM) | decidido (WI-005) |
| Contenedores | `Dockerfile` multi-stage (dev y prod) + `docker-compose.yml` (solo local) | decidido (WI-006) |
| Primitivas UI | Radix UI + shadcn | decidido (WI-003) |
| Iconos | `lucide-react` | decidido (WI-003) |
| Gráficas | Chart.js + `react-chartjs-2` | decidido (se instala en WI-013) |
| Feedback | `react-hot-toast` | decidido (WI-003) |
| Pruebas | Vitest (WI-002); Playwright pendiente de decisión | decidido / _pendiente_ |
| Documentación viva | Storybook | _pendiente de decisión_ |
| Tipografía | IBM Plex Sans + IBM Plex Mono (`next/font`) | decidido (línea gráfica, WI-003) |

Scripts actuales: `pnpm dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`. Se agregan durante la configuración inicial: `typecheck` (WI-001), `test` y `test:watch` (WI-002), y `db:generate`, `db:migrate` y `db:deploy` (WI-005).

## Repository structure

Estado actual: solo el scaffold de Next.js. Aún no hay código de producción de Health Apps.

```
app/            # App Router: layout.tsx, page.tsx, globals.css (scaffold por defecto)
public/         # Recursos estáticos
knowledge/      # Conocimiento del proyecto (business, product, tech, delivery)
.kaddo/         # Configuración de Kaddo
```

Estructura objetivo (propuesta):

```
salud-apps/
├── app/                          # App Router: solo rutas y composición de página
│   ├── layout.tsx                # fuentes, providers, layout principal
│   ├── globals.css               # tokens de diseño (Tailwind v4)
│   ├── page.tsx                  # panel general de monitoreo
│   ├── services/                 # gestión de servicios y detalle /services/[id]
│   └── api/                      # Route Handlers: única puerta HTTP al backend
│       ├── services/  checks/  history/  alerts/
├── src/
│   ├── components/               # UI reutilizable, SIN reglas de negocio
│   │   └── ui/                   # primitivas shadcn/Radix (button, dialog, select…)
│   ├── features/<feature>/       # una carpeta por dominio (ver "Organización por features")
│   ├── layouts/                  # layout principal, navegación
│   ├── hooks/                    # hooks transversales
│   ├── lib/                      # helpers sin estado (HTTP, formato, errores)
│   │   └── db/                   # cliente Prisma único (solo servidor)
│   └── types/                    # tipos compartidos (api-error.type.ts)
├── prisma/                       # schema.prisma y migraciones (PostgreSQL)
├── public/
├── Dockerfile                    # imagen multi-stage (targets dev y prod)
├── docker-compose.yml            # solo desarrollo local: app (target dev) + PostgreSQL 18
└── .env.example                  # variables DB_* (ver "Entornos y variables")
```

**Alias de importación:** `@/*` → `src/*`. Configurado en `tsconfig.json` (WI-001). Usa siempre el alias para cruzar carpetas y deja las rutas relativas solo para moverte dentro de la misma feature.

## Organización por features

Cada dominio de `knowledge/product/capabilities.md` vive en `src/features/<feature>/`:

| Feature | Dominio | Responsabilidad |
| --- | --- | --- |
| `service-catalog` | Catálogo de servicios | registro de servicios monitoreados y sus parámetros esperados |
| `checks` | Verificación de salud | ejecución de verificaciones periódicas |
| `health-status` | Verificación de salud | cálculo del estado: operativo / degradado / fuera de servicio |
| `metrics` | Métricas e historial | tiempos de respuesta, solicitudes, errores, uptime |
| `history` | Métricas e historial | historial de cambios de estado |
| `alerts` | Alertas | reglas y envío de alertas |
| `dashboard` | Visualización y monitoreo | composición del panel general y del detalle |

> El dominio "Catálogo de servicios" se llama `service-catalog` y no `services`, para no confundirse con la subcarpeta `services/` (cliente HTTP) de cada feature.

Forma de cada feature:

```
src/features/<feature>/
├── components/          # UI del dominio
│   └── modals/          # modales del dominio
├── hooks/               # estado + orquestación (cliente)
├── services/            # cliente HTTP del dominio → app/api/**
├── server/              # SOLO servidor: casos de uso y repositorios Prisma
├── types/               # modelos y DTOs
├── utils/               # lógica pura (filtros, formato, defaults, validación)
└── constants/           # constantes del dominio
```

**Dónde poner cada cosa**

| Lo que vas a escribir | Va en |
| --- | --- |
| Componente que solo sirve a un dominio | `src/features/<feature>/components/` |
| Componente reutilizable por varios dominios | `src/components/` |
| Llamada HTTP desde el cliente | `src/features/<feature>/services/` |
| Estado + toasts + orquestación | `src/features/<feature>/hooks/` |
| Acceso a datos (Prisma) y reglas de negocio | `src/features/<feature>/server/` |
| Endpoint HTTP | `app/api/<recurso>/route.ts` (delgado: valida y delega en `server/`) |
| Función pura (formato, filtros, validación) | `src/features/<feature>/utils/` o `src/lib/` |
| Tipo del dominio | `src/features/<feature>/types/` |
| Helper usado por todo el sistema | `src/lib/` |

### Límites entre features

- `checks` produce resultados de verificación; no decide el estado.
- `health-status` evalúa resultados y métricas frente a los umbrales de `service-catalog`.
- `alerts` reacciona a cambios de estado; no ejecuta verificaciones.
- La UI solo consume datos; no contiene lógica de evaluación de salud.
- Una feature no importa el `server/` de otra desde el cliente; la comunicación entre dominios ocurre en el servidor.

## Arquitectura en capas

```
app/<ruta>/page.tsx            →  compone la pantalla; sin fetch ni lógica de negocio
  └── hook de feature          →  estado, carga, toasts, orquestación (cliente)
        └── service            →  fetch a /api/**, parseo de error, normalización
              └── app/api/<recurso>/route.ts   →  valida entrada, delega
                    └── features/<f>/server/   →  casos de uso + repositorio
                          └── src/lib/db (Prisma) → PostgreSQL (esquema DB_SCHEMA)

Tareas en segundo plano (verificaciones periódicas, alertas)
  └── features/<f>/server/ directamente (sin pasar por HTTP)
```

Reglas:

1. **Los componentes no hacen `fetch` directo.** Siempre pasan por un service.
2. **Los services no muestran toasts.** Lanzan `ApiError`; el hook decide qué mostrar.
3. **Los hooks no lanzan.** Devuelven `boolean` (o `null`) y notifican al usuario.
4. **Las páginas no arman payloads del API**: reciben el del formulario y delegan.
5. **Prisma solo se usa en `server/` y `src/lib/db/`**, nunca en componentes, hooks ni services de cliente.
6. **Los Route Handlers son delgados:** validan, llaman a `server/` y traducen errores a respuestas HTTP con el formato `ApiError`.

## Services (cliente HTTP)

- Un objeto `XService` exportado por dominio, con métodos nombrados según la intención (`getAll`, `getById`, `create`, `update`, `remove`…).
- Estándar: `fetch` + un `handleResponse<T>()` que, si `!res.ok`, lanza el resultado de `parseHttpErrorResponse(res)`.
- **Normaliza en el borde:** lo que el API entrega con un formato raro se corrige en el service, no en la vista (p. ej. `decimal` de Postgres que llega como string → `Number(...)`).
- Las URLs son relativas a la propia app (`/api/...`); no se necesita una URL de API externa.

Helpers previstos en `src/lib/`:

| Helper | Para qué |
| --- | --- |
| `parse-http-error-response.ts` | convierte cualquier respuesta fallida en `ApiError` |
| `api-fetch.ts` | `apiFetch()` con mensaje claro si el API no responde |
| `db/` | cliente Prisma único (singleton protegido contra el hot reload) |
| `utils.ts` | `cn()` |

## Hooks de feature

- Exponen datos + `loading` + acciones + `reload`.
- Las acciones devuelven `boolean` para que la página decida, por ejemplo, si cerrar el modal.
- Concentran los mensajes al usuario (un `toast` por mensaje de validación del API).
- Recargan desde el servidor después de escribir (`await load()`), salvo en los borrados, donde se actualiza la lista en memoria.

## Tipos y manejo de errores

- Un archivo de tipos por dominio: modelo (p. ej. `MonitoredService`), DTO de creación, DTO de edición y payload del formulario. Comenta el porqué cuando el tipo no es obvio.
- Error estándar en `src/types/api-error.type.ts`, con `isApiError()` y `getErrorMessages()` (que cubre `message` como arreglo).
- Uso en hooks:

  ```ts
  if (isApiError(error)) getErrorMessages(error).forEach((m) => toast.error(m));
  else toast.error("Error al …");
  ```

- **Evita `any`.**
- Los mensajes de error deben decir qué hacer, no solo qué falló.

## Estado y persistencia local

- Estado de servidor: hooks de feature (sin React Query ni store global).
- Estado de UI: `useState` en el componente más cercano.
- Formularios: estado controlado con `useState` (sin librería de formularios).
- `localStorage` solo para conveniencias (p. ej. filtros del panel o el tema), **nunca para tokens**, siempre con `try/catch` y guarda de SSR (`typeof window === "undefined"`), y con el prefijo **`health_apps_`**.

## Línea gráfica y diseño responsive

Health Apps es una **aplicación web**, **mobile-first** y responsive para escritorio. La línea gráfica está en `resources/lineagrafica/Health Apps.dc.html` (prototipo interactivo). El prototipo asume una app iOS; esa suposición quedó reemplazada: se reutilizan su identidad visual y sus flujos, pero en una web.

**Tokens** (se definen en `app/globals.css` con `@theme` de Tailwind v4 en WI-003, como tokens semánticos con un valor por tema). Valores del **tema oscuro**; los del **tema claro** aún no están en `resources/lineagrafica/`:

| Grupo | Token | Valor |
| --- | --- | --- |
| Superficies | fondo / superficie / elevada | `#0f1214` / `#161a1d` / `#1f2427`, `#20262a` |
| Bordes | borde | `#262c30`, `#2c3236` |
| Texto | principal / secundario / atenuado / tenue | `#e8edf0` / `#c9d1d6` / `#8d989f` / `#6c777e` |
| Estado | operativo | `oklch(0.78 0.16 155)` (tinte `/ .14`) |
| Estado | degradado | `oklch(0.82 0.15 80)` (tinte `/ .14`) |
| Estado | caído | `oklch(0.66 0.21 25)` (tinte `/ .16`) |
| Acento | enlaces y elementos activos | `oklch(0.8 0.12 200)` |
| Tipografía | texto / cifras y códigos | IBM Plex Sans / IBM Plex Mono |
| Radios | tarjetas / pastillas | 8, 10, 16 px / 9999 px |

Reglas:

- **Mobile-first:** cada vista se diseña primero para 390 px; el corte a escritorio es `md`. Sin scroll horizontal entre 320 px y 1440 px.
- **Escritorio (≥ `md`): el layout cambia y se reacomoda**, no solo se estira. La navegación inferior pasa a una barra lateral _(propuesta)_, el contenido se organiza en varias columnas (p. ej. rejilla de tarjetas en el panel; métricas y gráfica lado a lado en el detalle) y se limita a un ancho máximo.
- Elementos táctiles de al menos 44×44 px en móvil.
- **Tema claro y tema oscuro.** Por defecto se sigue el tema del sistema; el usuario puede cambiarlo y la preferencia se guarda en `localStorage` (`health_apps_theme`). Sin parpadeo al cargar. Los componentes nunca usan colores fijos, solo tokens semánticos.
- El estado de salud siempre se comunica con color **y** texto.
- Las cifras (latencia, uptime, conteos) usan IBM Plex Mono.
- **Contraste (WCAG AA):** el texto principal, el secundario (`muted-foreground`, `text-secondary`), el acento y los colores de estado superan 4.5:1 en ambos temas. `text-subtle` (`#6c777e` en el tema oscuro, valor de la línea gráfica) llega a ~3.8–4.1:1: úsalo solo para texto auxiliar no esencial o de 18 px o más.
- **Tema claro: valores PROVISIONALES** derivados del oscuro (en `app/globals.css`), hasta que la línea gráfica entregue los oficiales.
- Implementación (WI-003): `next-themes` (`attribute="class"`, `defaultTheme="system"`, `storageKey="health_apps_theme"`); el selector `ThemeToggle` rota entre sistema, claro y oscuro. Botones de shadcn con 44 px de alto en móvil.

## Base de datos (Prisma 7)

- **Prisma 7.10** (última estable) con el adaptador `@prisma/adapter-pg`. El generador `prisma-client` escribe el cliente en `src/generated/prisma/` (ignorado en Git; se regenera en `postinstall`).
- `prisma.config.ts` y el cliente (`src/lib/db/index.ts`) obtienen la conexión de la misma función, `getDatabaseConfig()` (`src/lib/db/config.ts`), que compone la URL desde las `DB_*` con `?schema=DB_SCHEMA` y valida el nombre del esquema.
- El cliente aplica el esquema de dos formas: la opción `schema` del adaptador (consultas de Prisma) y `search_path` (SQL crudo y `current_schema()`).
- `db` es un cliente único por proceso (en desarrollo se guarda en `globalThis` para sobrevivir al hot reload) y se importa con `import "server-only"`: solo en el servidor.
- Scripts: `pnpm db:generate`, `pnpm db:migrate` (desarrollo; crea el esquema si no existe y regenera el cliente, porque Prisma 7 ya no lo hace solo), `pnpm db:seed`, `pnpm db:deploy` (producción) y `pnpm test:integration` (pruebas `*.integration.test.ts` contra la base real del `.env`).
- `GET /api/health` responde el estado de la aplicación y de la base (200 / 503).
- **Supabase:** la base es compartida y la app solo usa el esquema `app_health`, con el rol `app_health_owner` (`scripts/supabase/app-health-setup.sql`). `prisma.config.ts` bloquea `migrate dev`, `migrate reset`, `db push` y `db execute` contra hosts no locales; en Supabase solo se usa `pnpm db:deploy`.

## Worker de verificaciones (WI-010, ADR-004)

- Proceso aparte (`src/worker/index.ts`): `pnpm worker` (producción, target `worker` del `Dockerfile`) y `pnpm worker:dev` (servicio `worker` del `docker-compose.yml`, se reinicia al cambiar el código). Se ejecuta con `tsx --conditions=react-server` para poder importar módulos con `server-only`.
- Cada `CHECK_TICK_SECONDS` reclama servicios activos vencidos con `FOR UPDATE SKIP LOCKED` (`claimDueServices`), los verifica con `CHECK_CONCURRENCY` como máximo y guarda cada resultado en `service_checks` (`recordCheckResult`), actualizando `last_checked_at`, `last_response_time_ms` y `consecutive_failures` en la misma transacción.
- `performHttpCheck` (`src/features/checks/server/http-check.ts`): GET con timeout por servicio; 2xx/3xx = éxito; 4xx/5xx, timeout o error de red = fallo con un mensaje accionable.
- `MONITOR_CANARY_URL` (opcional): si falla, los fallos se guardan como `skipped` y no cuentan (BR-08).
- `CHECK_LOCALHOST_ALIAS` (opcional): traduce `localhost`/`127.0.0.1` de las URLs a otro host. En `docker-compose.yml` vale `host.docker.internal`, para que el worker en Docker alcance servicios que corren en el equipo anfitrión.
- Purga diaria de `service_checks` según `CHECK_RESULTS_RETENTION_DAYS`. Apagado ordenado con `SIGTERM`.
- **Estado de salud (WI-011):** `evaluateHealthStatus()` (`src/features/health-status/server/evaluate.ts`, función pura) se aplica en la misma transacción que registra la verificación: `skipped` no cambia el estado; fallo → `degradado` hasta alcanzar `down_after_failures` y luego `caido`; éxito → `degradado` si supera `degraded_response_time_ms`, si no `operativo`. El estado vive en `services.health_status` (enum `health_status`, nulo hasta la primera evaluación) con `status_changed_at`.
- **Eliminar servicios (WI-022):** `DELETE /api/services/[id]` (`services.manage`) borra el servicio y, en cascada, sus verificaciones y su historial. `recordCheckResult` bloquea la fila (`FOR UPDATE`) y lanza `ServiceDeletedError` si el servicio ya no existe; el worker descarta esa verificación sin error. UI: `DeleteServiceDialog` (confirmación) en el listado y `DeleteServiceSection` en la edición.
- **Componentes del /health (WI-021):** `performHttpCheck` lee hasta 256 KB del cuerpo; si es JSON, `analyzeHealthBody()` (`src/features/checks/server/health-body.ts`, pura) detecta sin configuración el estado general (`status`/`state`/`health` o booleanos `healthy`/`ok`/`up` en la raíz) y los componentes anidados con estado (nombrados por `connection`/`name`/`id`/… o por su clave). Compatible con reporter-api, NestJS Terminus, Spring Boot Actuator y `health+json`. Estado general en falla → fallo; componentes con falla o estado en advertencia → `degradado` con `degraded_reason`. El último estado de componentes se guarda en `services.last_components` (JSONB) y el extracto del cuerpo (≤ 2 KB) solo en verificaciones con problema (`service_checks.body_excerpt`). UI: línea en la tarjeta del panel y sección "Componentes" en el detalle.
- **Uptime (WI-015):** `computeUptime()` (`src/features/uptime/server/uptime.ts`, función pura) = tiempo en `operativo` / tiempo observado del período, reconstruido con `service_status_changes` (incluida la última transición anterior a la ventana); excluye el tiempo sin datos y los intervalos de verificaciones `skipped` (BR-08). `getUptimeForServices()` calcula 24 h, 7 d y 30 d para varios servicios con tres consultas. Se muestra en las tarjetas del panel y en el detalle (`UptimeStats`).
- **Historial (WI-014):** cada cambio de estado se guarda en `service_status_changes` (`from_status`, `to_status`, `changed_at`) dentro de la misma transacción; la purga diaria aplica `STATUS_HISTORY_RETENTION_DAYS` (365).
- En los contenedores se desactiva la verificación de dependencias de pnpm 11 (`npm_config_verify_deps_before_run=false`). En desarrollo, `app` y `worker` ejecutan `pnpm install --frozen-lockfile` al arrancar (el `node_modules` del contenedor se actualiza solo si cambian las dependencias).

## Convenciones de base de datos

Todas las tablas siguen este estándar (ejemplo de referencia):

```
users
├── id          (PK)
├── name
├── email
├── created_at
└── updated_at

user_directions
├── id          (PK)
├── direccion
├── user_id     (FK -> users.id)
├── created_at
└── updated_at
```

- **Tablas** en `snake_case` y en **plural** (`users`, `user_sessions`). Las tablas hijas llevan como prefijo la entidad dueña (`user_*`).
- **PK** siempre `id`, de tipo **uuid**.
- **FK** con el nombre `<entidad_en_singular>_id` (`user_id`), con índice y con un `ON DELETE` explícito (`CASCADE` para datos que dependen del padre, `RESTRICT` en el resto de casos).
- **Columnas** en `snake_case`; los booleanos con el prefijo `is_`/`has_`; las fechas con el sufijo `_at` y de tipo `timestamptz`.
- **Toda tabla** tiene `created_at` (por defecto `now()`) y `updated_at` (actualizado automáticamente).
- Restricciones `UNIQUE` en las claves naturales (p. ej. `email`) y `NOT NULL` salvo que el dato sea realmente opcional.
- Nunca se guardan secretos en claro: contraseñas → `password_hash`; tokens → `*_token_hash`.
- **En Prisma:** modelos en `PascalCase` y singular (`User`, `UserSession`) y campos en `camelCase` (`createdAt`), mapeados a la base con `@@map("users")` y `@map("created_at")`. Ids con `@id @default(uuid()) @db.Uuid`, `updatedAt` con `@updatedAt` y fechas con `@db.Timestamptz`.
- Las tablas viven en el esquema `DB_SCHEMA` (`app_health`, en Supabase). `public` y los esquemas de Supabase están prohibidos; ver README → "Base de datos en Supabase".
- Cada cambio de esquema se hace con una migración versionada de Prisma; nunca se modifica la base a mano.

## Autenticación

Se define en WI-019 (backend) y WI-020 (pantallas y protección de rutas):

- **JWT de acceso de vida corta + refresh token opaco rotado**, ligados a una sesión en `user_sessions`. Revocar la sesión invalida de inmediato todos sus tokens.
- Los tokens viajan en **cookies `httpOnly`, `Secure` y `SameSite=Lax`**. A diferencia de la guía de referencia (Savvi), **no se usa `localStorage` para tokens**.
- `proxy.ts` (Next.js 16; antes `middleware`) hace la verificación optimista del JWT. La verificación segura (sesión no revocada) se hace en `src/features/auth/server/` antes de cualquier acceso a datos.
- Ningún componente lee ni arma tokens a mano.
- **Implementación (WI-019):**
  - `src/features/auth/server/`: `auth.service.ts` (registro, login, refresh con rotación y detección de reutilización con un margen de 30 s, `authenticate()`, cambio de contraseña, revocación), `jwt.ts` (HS256 con `jose`; sin `server-only` para poder usarse en `proxy.ts`), `crypto.ts` (argon2id con `@node-rs/argon2`; SHA-256 del refresh token), `permissions.ts`, `config.ts` y `request.ts` (cookies, `getCurrentUser()`, `requireUser()`, `requirePermission()`).
  - Cookies: `health_apps_access` (path `/`) y `health_apps_refresh` (path `/api/auth`), `httpOnly`, `SameSite=Lax`; `Secure` según `AUTH_COOKIE_SECURE` (`auto` por defecto: solo si la petición llega por HTTPS; Safari descarta cookies `Secure` recibidas por HTTP, incluso en localhost).
  - Endpoints: `POST /api/auth/{register,login,refresh,logout,logout-all,change-password}`, `GET /api/auth/me`, `POST /api/users`.
  - **Apps externas (tokens Bearer, sin cookies):** `POST /api/auth/token` (`{identifier, password}`) devuelve `{tokenType, accessToken, expiresIn, refreshToken, refreshExpiresIn, user}`; `POST /api/auth/token/refresh` (`{refreshToken}`) rota igual que `/refresh`; `POST /api/auth/token/revoke` (`{refreshToken}`) cierra la sesión y responde siempre 204. `getCurrentUser()` acepta `Authorization: Bearer <accessToken>` además de la cookie, así que todo endpoint protegido (incluido `GET /api/auth/me`, que la app externa usa para validar el token y leer rol y permisos) funciona con Bearer. Las apps externas no validan el JWT localmente: el secreto HS256 no se comparte y la revocación solo se conoce en la base.
  - Los Route Handlers usan `handleRoute()` y `parseJsonBody()` (`src/lib/route-handler.ts`); la validación es con `zod` (`src/features/auth/utils/validation.ts`), compartida con el cliente.
  - `pnpm db:seed` siembra roles, permisos y el primer superadmin (`SEED_SUPERADMIN_*`).
- **Protección de rutas y UI (WI-020):**
  - `proxy.ts` verifica el JWT (optimista) en las páginas; si no es válido redirige a `GET /api/auth/session?callbackUrl=…`, que renueva la sesión con el refresh token (su cookie solo viaja a `/api/auth`) y vuelve a la página, o manda a `/login`. `callbackUrl` se valida con `safeCallbackUrl()` (solo rutas internas).
  - `app/(app)/layout.tsx` hace la verificación segura (`getCurrentUser()`), monta `AuthProvider` y muestra `PendingPermissions` a usuarios sin permisos (rol `nuevo`). Las páginas protegidas comprueban el permiso en el servidor (`hasPermission`) y muestran `AccessDenied`.
  - `app/(auth)/` (login y registro): layout de una columna en móvil y dos en escritorio.
  - `apiFetch` renueva la sesión una sola vez ante un 401 (compartida entre peticiones simultáneas, `configureApiSession()` desde `AuthProvider`) y, si no puede, lleva a `/login?expired=1`.
  - La navegación se filtra por permisos (`NavItem.permission`); es solo una ayuda visual.
- Login por email **o** username. La duración de los tokens se configura en `.env`: `JWT_ACCESS_TTL_MINUTES` (normalmente 60) y `REFRESH_TOKEN_TTL_MINUTES`, de forma independiente.

### Roles y permisos

| Rol | Permisos |
| --- | --- |
| `superadmin` | Todos, siempre; no se le pueden revocar. |
| `admin` | Los mismos que `superadmin`, pero se le pueden revocar permisos por usuario (`user_revoked_permissions`). |
| `nuevo` | Ninguno. Es el rol del autorregistro. |

- Los permisos usan el formato `<recurso>.<acción>` (p. ej. `users.create`, `services.manage`). **Cada feature declara sus permisos** y los agrega al seed; `admin` recibe todos los del catálogo.
- Todo Route Handler o acción protegida llama a `requirePermission("<permiso>")` en el servidor (401 sin sesión, 403 sin permiso). Ocultar elementos en la UI según los permisos es solo una ayuda visual.
- El módulo de gestión de roles y permisos (UI) llegará en el futuro.

## Entornos y variables

| Variable | Ámbito | Descripción |
| --- | --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | servidor | conexión a PostgreSQL |
| `DB_SCHEMA` | servidor | esquema; por defecto `app_health`. Se rechazan `public` y los esquemas reservados de Supabase/PostgreSQL |
| `DB_SSLMODE` | servidor | vacío/`disable` en local; `require` en Supabase (cifra sin validar la CA) |
| `DATABASE_URL` | servidor | **Opcional.** Si se define, tiene prioridad sobre las `DB_*`; la aplicación siempre le aplica `?schema=${DB_SCHEMA}` (`src/lib/db/config.ts`) |
| `JWT_ACCESS_SECRET` | servidor | secreto de firma del access token, mínimo 32 caracteres (WI-019) |
| `AUTH_COOKIE_SECURE` | servidor | `auto` (por defecto: `Secure` solo con HTTPS, también detrás de proxy), `true` o `false` |
| `JWT_ACCESS_TTL_MINUTES` | servidor | duración del access token; normalmente `60` |
| `REFRESH_TOKEN_TTL_MINUTES` | servidor | duración del refresh token (por defecto propuesto: `10080`, 7 días) |
| `SEED_SUPERADMIN_EMAIL`, `SEED_SUPERADMIN_USERNAME`, `SEED_SUPERADMIN_PASSWORD` | servidor | primer superadmin creado por `pnpm db:seed` (WI-019) |

- **Las variables `DB_*`, `JWT_*` y `SEED_*` nunca llevan el prefijo `NEXT_PUBLIC_`**: con él, el valor quedaría incluido en el bundle del navegador. Solo las leen `src/lib/db/` y `prisma/`.
- Las variables `NEXT_PUBLIC_*` se incluyen en tiempo de build; úsalas solo para valores no sensibles.
- Desarrollo local: `docker compose up` (app con el target dev + PostgreSQL 18).
- Producción: imagen del target `prod` del `Dockerfile` (salida `standalone` de Next.js, Node 24 Alpine, usuario `nextjs` no root, `HEALTHCHECK` contra `/api/health`), conectada a una instancia de PostgreSQL aparte, con las variables inyectadas en tiempo de ejecución. El target `migrator` aplica las migraciones (`prisma migrate deploy`).
- En local, `docker/postgres/init/01-create-schema.sh` crea el esquema `DB_SCHEMA` al inicializar el volumen; `postgres:18` guarda los datos en `/var/lib/postgresql/18/docker` (se monta `/var/lib/postgresql`).

## Convenciones de código

- `"use client"` en todo componente con estado, efectos o eventos; las páginas lo declaran cuando usan hooks.
- Un componente por archivo, con `export default`; el nombre del archivo es el del componente (`PascalCase.tsx`).
- Hooks en `camelCase.ts` con prefijo `use`.
- Services `*.service.ts`, tipos `*.types.ts` / `*.type.ts`, utilidades `*.utils.ts` o con nombre descriptivo, repositorios `*.repository.ts`.
- Código, nombres de archivo y claves en inglés. **Comentarios en español y sobre el porqué**, no sobre el qué.
- Interfaz, mensajes y documentación en español (es-CO).
- Estilos con Tailwind + `cn()`; sin CSS suelto salvo `globals.css`.
- Nada de lógica en `app/**/page.tsx` más allá de componer y enrutar callbacks.
- **Textos de ayuda (WI-023):** las pantallas muestran solo títulos, etiquetas, datos, errores y estados vacíos. Las explicaciones (qué significa cada dato, cómo se calcula, reglas) van en el botón de ayuda de cada pantalla (`HelpButton` + contenido en `src/features/help/content/`). Si cambia una regla (umbrales, estados, uptime), actualiza también su ayuda.
- Antes de escribir código, consulta las guías de `node_modules/next/dist/docs/` (ver `AGENTS.md`): esta versión de Next.js tiene cambios incompatibles.

## Entry points

- `app/layout.tsx`: layout raíz (aún con metadatos por defecto de `create-next-app`).
- `app/page.tsx`: página inicial (scaffold por defecto; será el panel general de Health Apps).

## How to run

Actual:

```bash
pnpm install
pnpm dev      # servidor de desarrollo
pnpm build    # build de producción
pnpm start    # servir el build
pnpm lint     # ESLint
```

Con Docker (WI-005 y WI-006):

```bash
cp .env.example .env     # DB_SCHEMA=app_health
docker compose up        # app (dev, aplica migraciones al arrancar) + PostgreSQL 18
# o solo la base y la app en el anfitrión:
docker compose up db && pnpm dev
```

## How to test

**Vitest** (configurado en WI-002, `vitest.config.mts`): entorno `jsdom`, Testing Library y `@testing-library/jest-dom`; `globals: true`; resolución del alias `@/*` nativa de Vite.

```bash
pnpm test          # una ejecución
pnpm test:watch    # modo observación
```

- Las pruebas viven junto al código: `*.test.ts` / `*.test.tsx` en `src/**` o `app/**`.
- Las pruebas de código de servidor declaran `// @vitest-environment node` en la primera línea (el entorno por defecto es `jsdom`).
- `vitest.setup.ts` agrega polyfills de punteros y `scrollIntoView` para los componentes de Radix en jsdom.
- Node.js >= 24 (ver `.nvmrc`).

Propuesta (guía de referencia):
- Vitest para lógica pura, hooks y `server/`; Playwright para pruebas en navegador.
- Los componentes reutilizables llevan `*.stories.tsx` junto al componente, con `satisfies Meta<typeof X>` + `StoryObj`, `tags: ["autodocs"]`, `fn()` para las acciones y una historia por estado relevante (normal, cargando, vacío, error).

### Calidad antes de subir

```bash
pnpm lint            # ESLint
pnpm exec tsc --noEmit   # tipos
pnpm build           # build de producción
pnpm test            # pruebas (tras WI-002)
```

Todos deben pasar.

## Checklist para una feature nueva

1. Crear `src/features/<feature>/` con `types/`, `services/`, `hooks/`, `components/` y, si accede a datos, `server/`.
2. Definir el modelo y los DTOs en `types/` (y el modelo Prisma con su migración) antes de escribir la primera llamada.
3. Escribir el repositorio y los casos de uso en `server/`, y el Route Handler delgado en `app/api/`.
4. Escribir el service con `handleResponse` + `parseHttpErrorResponse`.
5. Escribir el hook: `loading`, acciones que devuelven `boolean` y toasts en español.
6. Construir la UI reutilizando `src/components/`; crear ahí lo que sirva a más de un dominio.
7. Cubrir los cuatro estados: normal, cargando, vacío y error.
8. Agregar `*.stories.tsx` si el componente es reutilizable.
9. Verificar móvil (`md` es el corte) y accesibilidad (foco, `aria-label`; el estado de salud se comunica con color **y** texto).
10. Correr lint + tipos + build + pruebas.

## Minimum criteria to start development

- Lista inicial de aplicaciones/servicios a monitorear y cómo verificar cada uno.
- Definición de umbrales para operativo / degradado / fuera de servicio.
- Configuración inicial completa (WI-001 a WI-006), sin lógica de negocio.
- Política de retención del historial definida (WI-009).
- Decisión sobre el mecanismo de ejecución periódica de verificaciones.
- Canal(es) de alertas definidos.

## Open questions

- [resuelta] ¿Dónde se almacenan los datos? → PostgreSQL con Prisma como ORM (decisión del equipo, 2026-10-05; ver WI-005).
- [resuelta] ¿Cómo se ejecuta la base de datos? → PostgreSQL 18 con Docker Compose en desarrollo local; instancia aparte en producción. Un único `Dockerfile` para desarrollo y producción. Esquema configurable con `DB_SCHEMA` (por defecto `public`; normalmente `health_extern`).
- [resuelta] ¿Qué estructura y convenciones sigue el código? → Las de la guía *Savvi Frontend*, adaptadas (organización por features en `src/features/`, arquitectura en capas).
- [resuelta] ¿Se adoptan las librerías de la guía? → Sí: shadcn/Radix, `lucide-react`, `react-hot-toast` y Chart.js.
- [resuelta] ¿Dónde está la línea gráfica? → `resources/lineagrafica/`. Web mobile-first y responsive para escritorio.
- [open] ¿Se incluyen Playwright y Storybook en la configuración inicial?
- [resuelta] ¿Hay tema claro? → Sí, la línea gráfica lleva tema claro y oscuro.
- [open] ¿Dónde están los valores del tema claro? `resources/lineagrafica/` solo contiene el oscuro.
- [resuelta] ¿El layout cambia en escritorio? → Sí, se reacomoda (barra lateral propuesta y varias columnas).
- [open] ¿Cómo se modela y retiene el historial en PostgreSQL? (WI-009)
- [open] ¿Cómo se ejecutarán las verificaciones periódicas (cron, worker separado, servicio externo)?
- [open] ¿Las métricas se obtendrán por sondeo activo o las aplicaciones las enviarán (push)?
- [resuelta] ¿Se requiere autenticación? → Sí: JWT con revocación de tokens mediante sesiones (WI-019).
- [resuelta] ¿Roles y permisos? → `superadmin`, `admin` (permisos revocables) y `nuevo` (sin permisos); el módulo de gestión llegará en el futuro.
