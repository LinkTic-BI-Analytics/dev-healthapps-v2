---
type: feature
id: WI-019
title: >-
  Autenticación JWT con revocación de tokens, usuarios, roles y permisos
  (backend)
knowledge_level: K3
status: completed
phase: now
initiative: Autenticación y usuarios
domains:
  - Identidad y acceso
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-019
source_initiative: RM-008
source_roadmap_initiative: RM-008
source_work_item_candidate: WI-CANDIDATE-019
source_title: >-
  Autenticación JWT con revocación de tokens, usuarios, roles y permisos
  (backend)
source_context: Materialized from roadmap candidate WI-CANDIDATE-019 under initiative RM-008.
source_initiative_title: Autenticación y usuarios
related_domain: Identidad y acceso
related_capabilities:
  - Autenticación de usuarios
  - Gestión de sesiones y revocación de tokens
  - Roles y permisos
expected_value: >-
  Backend de autenticación: usuarios con roles y permisos, login por email o
  username, tokens JWT revocables y endpoints protegidos por permiso.
risks:
  - Contraseñas o tokens almacenados en texto plano.
  - >-
    Tokens robados utilizables hasta su expiración si no se valida la
    revocación.
  - Enumeración de usuarios por mensajes de error distintos.
  - >-
    Escalada de privilegios (un admin que se asigna superadmin, o un usuario
    nuevo que obtiene permisos).
  - Secretos de JWT expuestos al navegador (prefijo NEXT_PUBLIC_).
dependencies:
  - WI-004
  - WI-005
source_signals:
  - >-
    Decisión del equipo (2026-10-05): autenticación JWT con capacidad de
    invalidar tokens.
  - >-
    Decisión del equipo (2026-10-05): roles superadmin, admin y nuevo; login por
    email o username; sin reglas de contraseña por ahora.
  - >-
    Decisión del equipo (2026-10-05): superadmin y admin crean usuarios; el
    autorregistro asigna el rol nuevo (sin permisos).
  - >-
    Decisión del equipo (2026-10-05): duración de los tokens configurable en
    .env (access token normalmente 60 min).
  - >-
    Decisión del equipo (2026-10-05): el módulo de gestión de roles se hace en
    el futuro.
decision_candidates:
  - >-
    Estrategia de autenticación: JWT de acceso + sesiones revocables en base de
    datos
  - >-
    Modelo de autorización: roles con permisos y revocación de permisos por
    usuario
related_decisions: []
summary: 'Health Apps no tiene usuarios, roles ni autenticación en el backend.'
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Autenticación JWT con revocación de tokens, usuarios, roles y permisos (backend)

> Type: feature · Level: K3

## Source

- Source: roadmap
- Roadmap Initiative: RM-008 — Autenticación y usuarios
- Work Item Candidate: WI-CANDIDATE-019
- Related domain: Identidad y acceso
- Related capabilities:
  - Autenticación de usuarios
  - Gestión de sesiones y revocación de tokens
  - Roles y permisos

> Warning: Las decisiones "Estrategia de autenticación" y "Modelo de autorización" aún no están materializadas como ADR. Formalízalas antes de implementar (`kaddo adr` + skill adr-writing).

> **Alcance:** solo backend (modelo de datos, tokens, autorización y endpoints). Las pantallas y la protección de rutas en la UI están en **WI-020**.

**Actor and outcome:**
- Usuario: inicia sesión con email **o** username y contraseña; puede cerrar sesión en un dispositivo o en todos.
- Superadmin y admin: crean usuarios.
- Visitante: se registra por su cuenta y queda con el rol `nuevo`, sin permisos.
- Sistema: rechaza cualquier token revocado y cualquier acción sin el permiso requerido.

**Current behavior:** No existen usuarios, roles, permisos ni autenticación.

**Target behavior:**

_Roles (sembrados por seed; su gestión llega en el futuro)_

| Rol | Permisos |
|---|---|
| `superadmin` | Acceso total. Tiene **siempre** todos los permisos; no se le pueden revocar. |
| `admin` | Los mismos permisos que `superadmin`, pero **se le pueden revocar permisos** de forma individual. |
| `nuevo` | Ningún permiso. Es el rol de los usuarios que se registran por su cuenta. |

_Modelo de datos_ (Prisma, según las convenciones de base de datos de `knowledge/tech/codebase.md`)

```
roles
├── id              (PK, uuid)
├── code            (único: superadmin, admin, nuevo)
├── name
├── description     (nullable)
├── created_at
└── updated_at

permissions
├── id              (PK, uuid)
├── code            (único, p. ej. users.create)
├── description     (nullable)
├── created_at
└── updated_at

role_permissions
├── id              (PK, uuid)
├── role_id         (FK -> roles.id, ON DELETE CASCADE)
├── permission_id   (FK -> permissions.id, ON DELETE CASCADE)
├── created_at
└── updated_at
    UNIQUE (role_id, permission_id)

users
├── id                  (PK, uuid)
├── email               (único, normalizado en minúsculas)
├── username            (único, normalizado en minúsculas)
├── password_hash
├── role_id             (FK -> roles.id, ON DELETE RESTRICT)
├── is_active           (por defecto true)
├── created_by_id       (FK -> users.id, nullable; null = autorregistro o seed)
├── last_login_at       (nullable)
├── password_changed_at (nullable)
├── created_at
└── updated_at

user_revoked_permissions
├── id              (PK, uuid)
├── user_id         (FK -> users.id, ON DELETE CASCADE)
├── permission_id   (FK -> permissions.id, ON DELETE CASCADE)
├── revoked_by_id   (FK -> users.id, nullable)
├── created_at
└── updated_at
    UNIQUE (user_id, permission_id)

user_sessions
├── id                  (PK, uuid; viaja en el JWT como `sid`)
├── user_id             (FK -> users.id, ON DELETE CASCADE)
├── refresh_token_hash  (único)
├── user_agent          (nullable)
├── ip_address          (nullable)
├── expires_at
├── last_used_at        (nullable)
├── revoked_at          (nullable)
├── revoked_reason      (nullable: logout, logout_all, rotation, reuse_detected, password_change, user_disabled)
├── created_at
└── updated_at
```

- **Permisos efectivos** de un usuario:
  - `superadmin`: todos.
  - Otro rol: los de su rol menos los de `user_revoked_permissions`.
  - `nuevo`: ninguno.
- La contraseña se guarda solo como hash (argon2id o bcrypt) en `password_hash`. **Por ahora no hay reglas de contraseña**; solo se exige que no esté vacía.
- Índices en todas las FK; `users.email` y `users.username` únicos.
- Todas las tablas viven en el esquema `DB_SCHEMA` (normalmente `health_extern`).

_Catálogo de permisos_
- Cada feature declara sus permisos con el formato `<recurso>.<acción>` y los registra en el seed. Este WI siembra `users.create` y `users.read`.
- El seed asigna **todos** los permisos del catálogo a `admin`. `superadmin` no los necesita en `role_permissions` porque siempre tiene acceso total.

_Tokens y revocación_
- **Access token (JWT):** contiene `sub` (user id), `sid` (session id), `role`, `jti`, `iat` y `exp`. Su duración se define en `JWT_ACCESS_TTL_MINUTES` (por defecto **60**).
- **Refresh token:** opaco y aleatorio. Solo se guarda su hash en `user_sessions` y se **rota** en cada uso. Su duración se define en `REFRESH_TOKEN_TTL_MINUTES`, que es **independiente** del access token y no puede ser menor que él (valor por defecto propuesto: 10080, es decir 7 días).
- **Invalidación:** un JWT es válido solo si su firma y `exp` son correctos **y** su sesión existe, no está revocada y no expiró. Revocar la sesión invalida de inmediato todos sus tokens.
  - *Logout:* revoca la sesión actual.
  - *Logout en todos los dispositivos:* revoca todas las sesiones del usuario.
  - *Cambio de contraseña o desactivación del usuario:* revoca todas sus sesiones.
  - *Reutilizar un refresh token ya rotado:* revoca todas las sesiones del usuario.
- Los tokens se entregan en **cookies `httpOnly`, `Secure` y `SameSite=Lax`**, nunca en el cuerpo para guardarlos en `localStorage`.

_Autorización en el servidor_ (`src/features/auth/server/`)
- `getCurrentUser()`: valida el JWT y la sesión en base de datos y devuelve el usuario con sus permisos efectivos.
- `requirePermission(code)`: lanza 401 si no hay sesión válida y 403 si falta el permiso. Todo Route Handler protegido lo usa.

_Endpoints_ (`app/api/`)
- `POST /api/auth/register`: autorregistro (email, username, contraseña) → rol `nuevo`. Público.
- `POST /api/auth/login`: `identifier` (email **o** username) + contraseña → crea la sesión y fija las cookies. Público.
- `POST /api/auth/refresh`: rota el refresh token.
- `POST /api/auth/logout`: revoca la sesión actual.
- `POST /api/auth/logout-all`: revoca todas las sesiones del usuario.
- `GET /api/auth/me`: usuario, rol y permisos efectivos (sin `password_hash`).
- `POST /api/users`: crea un usuario. Requiere `users.create`. Restricciones:
  - Solo un `superadmin` puede crear otro `superadmin`.
  - Un `admin` puede crear usuarios `admin` o `nuevo`.
  - Se registra `created_by_id`.

_Seed_ (`pnpm db:seed`, idempotente): roles, permisos, `role_permissions` y el primer `superadmin` desde `SEED_SUPERADMIN_EMAIL`, `SEED_SUPERADMIN_USERNAME` y `SEED_SUPERADMIN_PASSWORD`.

_Variables de entorno_ (solo servidor, **sin prefijo `NEXT_PUBLIC_`**), documentadas en `.env.example`:

| Variable | Descripción | Valor en `.env.example` |
|---|---|---|
| `JWT_ACCESS_SECRET` | Secreto para firmar el access token | `cambia-este-secreto` |
| `JWT_ACCESS_TTL_MINUTES` | Duración del access token | `60` |
| `REFRESH_TOKEN_TTL_MINUTES` | Duración del refresh token | `10080` _(propuesta: 7 días)_ |
| `SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_USERNAME` / `SEED_SUPERADMIN_PASSWORD` | Primer superadmin | valores de ejemplo |

**Entry points:** `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.*`, `src/features/auth/server/`, `src/features/auth/types/`, `src/features/users/server/`, `app/api/auth/**`, `app/api/users/**`, `.env.example`.

**End-to-end flow:** Visitante → `POST /api/auth/register` → usuario con rol `nuevo` → `POST /api/auth/login` con su username → cookies con los tokens → `GET /api/auth/me` devuelve permisos vacíos → `POST /api/users` responde 403. Un admin inicia sesión → `POST /api/users` crea un usuario → `POST /api/auth/logout` → el mismo access token es rechazado con 401.

**Problem:** Health Apps no tiene usuarios, roles ni autenticación en el backend.

**Expected result:** El backend autentica por email o username, emite tokens revocables, calcula los permisos efectivos por rol y por usuario, y protege los endpoints por permiso.

**Suggested Knowledge Level:** K3

**Impact analysis:**
- frontend: not-applicable (WI-020)
- backend: affected
- database: affected
- configuration: affected
- authentication: affected
- notifications: not-applicable
- documentation: affected
- operations: affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Si la revocación de permisos debe aplicarse también a nivel de rol (hoy: por usuario).
- Valor por defecto definitivo del refresh token.
- Límite de intentos de login (rate limiting).

**Scope confidence:** high — Roles, login, creación de usuarios y duración de los tokens están definidos.

**Dependencies:**
- WI-004 (utilidades de errores y HTTP)
- WI-005 (PostgreSQL con Prisma)

**Acceptance criteria:**
- [ ] Existen los modelos `Role`, `Permission`, `RolePermission`, `User`, `UserRevokedPermission` y `UserSession`, mapeados a `roles`, `permissions`, `role_permissions`, `users`, `user_revoked_permissions` y `user_sessions` con columnas en `snake_case`, PK `id` uuid, `created_at` y `updated_at`.
- [ ] Las FK tienen índice y el `ON DELETE` definido; `role_permissions` y `user_revoked_permissions` tienen `UNIQUE` sobre el par de FK.
- [ ] La migración se aplica en el esquema `DB_SCHEMA` (`health_extern`).
- [ ] `pnpm db:seed` crea de forma idempotente los roles `superadmin`, `admin` y `nuevo`, los permisos `users.create` y `users.read`, sus asignaciones y el primer `superadmin`.
- [ ] Login con email y login con username funcionan, sin distinguir mayúsculas.
- [ ] Credenciales incorrectas → el mismo mensaje genérico y el mismo código, sin revelar si el usuario existe.
- [ ] Un usuario con `is_active = false` no puede iniciar sesión.
- [ ] El registro crea el usuario con el rol `nuevo`; su `GET /api/auth/me` devuelve una lista de permisos vacía.
- [ ] `superadmin` pasa cualquier `requirePermission()`, aunque tenga registros en `user_revoked_permissions`.
- [ ] Un `admin` con `users.create` revocado recibe 403 en `POST /api/users`; otro `admin` sin revocaciones puede crear usuarios.
- [ ] Un `admin` no puede crear un `superadmin` (403); un `superadmin` sí puede.
- [ ] El access token expira según `JWT_ACCESS_TTL_MINUTES` y el refresh token según `REFRESH_TOKEN_TTL_MINUTES`; ambos se leen del `.env`.
- [ ] `/api/auth/refresh` rota el refresh token; reutilizar uno ya rotado revoca todas las sesiones del usuario.
- [ ] Tras `logout`, un access token de esa sesión que aún no expiró recibe 401; tras `logout-all`, todos los del usuario.
- [ ] Ninguna respuesta incluye `password_hash` ni hashes de tokens.
- [ ] Los secretos y TTL se leen de variables de servidor sin prefijo `NEXT_PUBLIC_`, documentadas en `.env.example`.

**Out of scope:**
- Pantallas de login, registro y creación de usuarios, y protección de rutas en la UI (WI-020).
- **Módulo de gestión de roles y permisos** (crear o editar roles, asignar o revocar permisos desde la UI): futuro.
- Cambiar el rol de un usuario existente (futuro, con el módulo de gestión de roles).
- Reglas de complejidad de contraseña.
- Recuperación de contraseña, MFA y SSO.

**How to test it (validation):**
1. `pnpm db:migrate` → existen las 6 tablas en `health_extern` (`\dt health_extern.*`).
2. `pnpm db:seed` dos veces → no hay duplicados.
3. `pnpm test` → pruebas de:
   - hash de contraseñas;
   - cálculo de permisos efectivos (superadmin, admin con y sin revocaciones, nuevo);
   - reglas de creación de usuarios;
   - emisión y verificación del JWT;
   - rotación y reutilización del refresh token;
   - revocación de sesiones.
4. Manual con `curl`: registro → login con username → `GET /api/auth/me` sin permisos → `POST /api/users` da 403.
5. Manual: login como admin → crear usuario → logout → repetir un request con el access token anterior → 401.
6. Manual: cambiar `JWT_ACCESS_TTL_MINUTES=1` → tras 1 minuto el access token es rechazado y `refresh` emite uno nuevo.
7. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] ADR de la estrategia de autenticación y ADR del modelo de autorización creados en `knowledge/tech/decisions/`.
- [ ] `knowledge/tech/codebase.md` (autenticación, permisos y variables) y `knowledge/product/capabilities.md` actualizados.
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [resuelta] ¿Hay roles? → Sí: `superadmin` (acceso total), `admin` (igual que superadmin, con permisos revocables) y `nuevo` (sin permisos).
- [resuelta] ¿El login acepta email o username? → Ambos.
- [resuelta] ¿Política de contraseñas? → Por ahora ninguna.
- [resuelta] ¿Quién crea usuarios? → Superadmin y admin; también es posible el autorregistro, que asigna el rol `nuevo`.
- [resuelta] ¿Duración de los tokens? → Configurable en `.env`, con una variable para cada token; access token normalmente 60 min.
- [asumida] El refresh token dura 7 días por defecto (`REFRESH_TOKEN_TTL_MINUTES=10080`). Confirmar.
- [asumida] Un `admin` puede crear usuarios `admin` y `nuevo`, pero no `superadmin`. Confirmar.
- [asumida] La revocación de permisos del admin es **por usuario** (un admin concreto), no del rol completo. Confirmar.
- [open] ¿Se requiere límite de intentos de login en esta primera versión?

**Suggested ownership (code globs):**
- `src/features/auth/server/**`
- `src/features/auth/types/**`
- `src/features/users/server/**`
- `app/api/auth/**`
- `app/api/users/**`
- `prisma/schema.prisma`
- `prisma/seed.*`

**Related domain / capability:** Identidad y acceso / Autenticación de usuarios, Gestión de sesiones y revocación de tokens, Roles y permisos

**Related decisions:** Pendiente de ADR: Estrategia de autenticación; Modelo de autorización

## Implementation Notes

- Modelos Prisma `Role`, `Permission`, `RolePermission`, `User`, `UserRevokedPermission`, `UserSession` → tablas `roles`, `permissions`, `role_permissions`, `users`, `user_revoked_permissions`, `user_sessions` (snake_case, PK uuid, `created_at`/`updated_at` timestamptz, índices en FK, UNIQUE en pares, ON DELETE explícito). Migración `auth_users_roles_permissions` aplicada en `health_extern`.
- Servicios en `src/features/auth/server/` y `src/features/users/server/user.service.ts`; endpoints `/api/auth/{register,login,refresh,logout,logout-all,me,change-password}` y `POST /api/users` (requiere `users.create`; admin no crea superadmin; registra `created_by_id`).
- JWT HS256 (`jose`) con `sub`, `sid`, `role`, `jti`, `iat`, `exp`, `iss`, `aud`; refresh token opaco (256 bits) con solo su SHA-256 en base; rotación en cada uso con detección de reutilización (margen de 30 s para pestañas concurrentes); argon2id; mismo mensaje para credenciales incorrectas y verificación de relleno cuando el usuario no existe.
- Variables: `JWT_ACCESS_SECRET` (≥ 32), `JWT_ACCESS_TTL_MINUTES` (60), `REFRESH_TOKEN_TTL_MINUTES` (10080), `AUTH_COOKIE_SECURE`, `SEED_SUPERADMIN_*`. `pnpm db:seed` idempotente.
- Extras: `POST /api/auth/change-password` (necesario para el criterio de revocación por cambio de contraseña) y `setUserActive()` (revoca sesiones al desactivar; sin endpoint, llega con la gestión de usuarios).
- Ajustes: `db:migrate` ahora ejecuta también `prisma generate` (Prisma 7 ya no lo hace solo); las pruebas de servidor usan `// @vitest-environment node`.
- Validado: 18 pruebas unitarias nuevas (48 en total) y 14 de integración contra PostgreSQL (registro → nuevo sin permisos; login con email y con username; mensaje genérico; inactivo; logout y logout-all invalidan tokens vigentes; rotación; reutilización → `reuse_detected`; cambio de contraseña; superadmin con revocaciones mantiene todo; admin crea admin/nuevo pero no superadmin; revocación individual al admin). Con `curl`: cookies `HttpOnly; Secure; SameSite=lax`, 403 para nuevo, 401 con el token anterior tras logout, expiración con TTL=1 y renovación con refresh. `typecheck`, `lint` y `build` pasan.
- Supuestos aplicados (confirmar): refresh de 7 días; admin no crea superadmin; revocación de permisos por usuario.
- Pendiente: ADR de estrategia de autenticación y de modelo de autorización; límite de intentos de login (no implementado); revisión humana.
