---
type: feature
id: WI-020
title: 'Pantallas de login, registro y creación de usuarios, y protección de rutas'
knowledge_level: K2
status: completed
phase: now
initiative: Autenticación y usuarios
domains:
  - Identidad y acceso
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-020
source_initiative: RM-008
source_roadmap_initiative: RM-008
source_work_item_candidate: WI-CANDIDATE-020
source_title: 'Pantallas de login, registro y creación de usuarios, y protección de rutas'
source_context: Materialized from roadmap candidate WI-CANDIDATE-020 under initiative RM-008.
source_initiative_title: Autenticación y usuarios
related_domain: Identidad y acceso
related_capabilities:
  - Autenticación de usuarios
  - Roles y permisos
expected_value: >-
  Los usuarios inician sesión, se registran y (si tienen permiso) crean usuarios
  desde la web; las rutas privadas quedan protegidas.
risks:
  - >-
    Mostrar u ocultar elementos solo en el cliente sin validar el permiso en el
    servidor.
  - Bucles de redirección entre /login y las rutas protegidas.
dependencies:
  - WI-003
  - WI-019
source_signals:
  - >-
    Decisión del equipo (2026-10-05): login por email o username; autorregistro
    con rol nuevo; superadmin y admin crean usuarios.
  - >-
    Decisión del equipo (2026-10-05): web mobile-first, responsive para
    escritorio, tema claro y oscuro.
decision_candidates: []
summary: No hay pantallas de autenticación ni protección de rutas en la web.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Pantallas de login, registro y creación de usuarios, y protección de rutas

> Type: feature · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-008 — Autenticación y usuarios
- Work Item Candidate: WI-CANDIDATE-020
- Related domain: Identidad y acceso
- Related capabilities:
  - Autenticación de usuarios
  - Roles y permisos

> **Alcance:** UI y protección de rutas. Consume los endpoints de **WI-019**.

**Actor and outcome:**
- Usuario: inicia sesión con email o username desde el móvil o el escritorio y accede a lo que sus permisos le permiten.
- Visitante: crea su propia cuenta.
- Superadmin y admin: crean usuarios desde la web.

**Current behavior:** No hay pantallas de autenticación; todas las rutas son públicas.

**Target behavior:**
- **`/login`:** campo "Email o usuario" + contraseña; mensajes en español; estados de carga y error; redirige a `callbackUrl` tras iniciar sesión.
- **`/registro`:** email, username y contraseña. Tras registrarse, el usuario queda con el rol `nuevo`.
- **Usuario `nuevo` (sin permisos):** al entrar ve una pantalla "Tu cuenta está pendiente de permisos", con la opción de cerrar sesión; no ve el resto de la navegación.
- **`/usuarios/nuevo`:** formulario de creación de usuarios (email, username, contraseña, rol). Solo es visible y accesible con el permiso `users.create`. El selector de rol solo ofrece `superadmin` si quien crea es `superadmin`.
- **Layout:** muestra el usuario actual y su rol, con *Cerrar sesión* y *Cerrar sesión en todos los dispositivos*. Los elementos de navegación se muestran según los permisos efectivos.
- **Protección de rutas:**
  - `proxy.ts` (Next.js 16) redirige a `/login?callbackUrl=…` si no hay un JWT válido. `/login` y `/registro` son públicas, y un usuario con sesión que entra a ellas va a `/`.
  - Las páginas y acciones protegidas validan la sesión y el permiso en el servidor (`getCurrentUser()` / `requirePermission()` de WI-019). Ocultar un botón no sustituye esa validación.
  - Si una petición recibe 401 por un access token expirado, el cliente llama una vez a `/api/auth/refresh` y reintenta; si el refresh falla, redirige a `/login`.
- Estructura de `codebase.md`: `src/features/auth/` (`components/`, `hooks/`, `services/`) y `src/features/users/` (`components/`, `hooks/`, `services/`).

**Entry points:** `app/login/`, `app/registro/`, `app/usuarios/nuevo/`, `proxy.ts`, `src/layouts/MainLayout`, `src/features/auth/`, `src/features/users/`.

**End-to-end flow:** El usuario abre `/` → `proxy.ts` redirige a `/login` → inicia sesión con su username → vuelve a `/` → ve la navegación según sus permisos → cierra sesión → `/` vuelve a redirigir a `/login`.

**Problem:** No hay pantallas de autenticación ni protección de rutas en la web.

**Expected result:** Login, registro y creación de usuarios funcionando en móvil y escritorio, con las rutas privadas protegidas.

**Suggested Knowledge Level:** K2

**Impact analysis:**
- frontend: affected
- backend: reviewed-not-affected (usa WI-019)
- database: not-applicable
- configuration: affected (`proxy.ts`)
- authentication: affected
- notifications: not-applicable
- documentation: affected
- operations: not-applicable

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Si el usuario `nuevo` debe ver algún contenido además de la pantalla de espera.

**Scope confidence:** high — Flujos y reglas de roles definidos en WI-019.

**Dependencies:**
- WI-003 (UI base, temas y layout)
- WI-019 (backend de autenticación)

**Acceptance criteria:**
- [ ] `/login` acepta email o username y redirige a `callbackUrl` tras iniciar sesión.
- [ ] Credenciales incorrectas muestran un mensaje genérico en español, sin indicar qué dato falló.
- [ ] `/registro` crea la cuenta y el usuario ve la pantalla de "pendiente de permisos".
- [ ] Un usuario sin sesión que abre una ruta privada es redirigido a `/login`; uno con sesión que abre `/login` va a `/`.
- [ ] `/usuarios/nuevo` solo es accesible con `users.create`; sin ese permiso responde con la página de acceso denegado (comprobado en el servidor, no solo ocultando el enlace).
- [ ] Un `admin` no ve la opción `superadmin` en el selector de rol.
- [ ] Cerrar sesión y cerrar sesión en todos los dispositivos funcionan desde el layout.
- [ ] Un access token expirado se renueva de forma transparente con el refresh token; si el refresh falla, se redirige a `/login`.
- [ ] No hay tokens en `localStorage` ni accesibles desde JavaScript.
- [ ] Mobile-first: las pantallas se diseñan primero para 390 px y se reacomodan en escritorio; funcionan en tema claro y oscuro; los campos tienen etiquetas accesibles y los botones miden al menos 44 px.
- [ ] E2E: registrarse → ver "pendiente de permisos" → cerrar sesión → iniciar sesión como superadmin con el email → crear un usuario `admin` → cerrar sesión → iniciar sesión con ese admin usando su username.

**Out of scope:**
- Módulo de gestión de roles y permisos (futuro).
- Listado, edición y desactivación de usuarios.
- Recuperación de contraseña.

**How to test it (validation):**
1. `pnpm test` → pruebas de los formularios (validación de campos vacíos, estados de carga y error) y del hook de sesión (renovación con refresh).
2. Manual: el flujo E2E de los criterios de aceptación, en 390 px y en 1280 px.
3. Manual: como usuario `nuevo`, abrir `/usuarios/nuevo` directamente por URL → acceso denegado.
4. Manual: DevTools → las cookies son `httpOnly` y `localStorage` no contiene tokens.
5. Manual: alternar entre tema claro y oscuro en `/login`, `/registro` y `/usuarios/nuevo`.
6. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] `knowledge/tech/codebase.md` actualizado si cambió algo de la protección de rutas.
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿El usuario `nuevo` debe ver algo más que la pantalla de "pendiente de permisos"?
- [open] ¿Se avisa a los admin cuando alguien se registra? (hoy: no)

**Suggested ownership (code globs):**
- `app/login/**`
- `app/registro/**`
- `app/usuarios/**`
- `proxy.ts`
- `src/features/auth/components/**`
- `src/features/auth/hooks/**`
- `src/features/auth/services/**`
- `src/features/users/components/**`
- `src/features/users/hooks/**`
- `src/features/users/services/**`
- `src/layouts/**`

**Related domain / capability:** Identidad y acceso / Autenticación de usuarios, Roles y permisos

**Related decisions:** Pendiente de ADR (en WI-019): Estrategia de autenticación; Modelo de autorización

## Implementation Notes

- Páginas: `/login` (email o usuario, aviso de sesión expirada, `callbackUrl`), `/registro` (crea cuenta `nuevo` con sesión), `/usuarios/nuevo` (permiso `users.create` comprobado en el servidor; `AccessDenied` si falta; selector de rol según `ASSIGNABLE_ROLES`). Grupo `app/(auth)` con layout de una columna en móvil y dos en escritorio.
- `PendingPermissions` para usuarios sin permisos (rol `nuevo`) con cierre de sesión; `UserMenu` (usuario, email, rol, cerrar sesión y cerrar sesión en todos los dispositivos) en el encabezado móvil y al pie de la barra lateral; navegación filtrada por permisos.
- `proxy.ts` (Next.js 16): verificación optimista del JWT; si no es válido → `GET /api/auth/session` (renueva con el refresh token y vuelve, o va a `/login?callbackUrl`). `safeCallbackUrl()` evita redirecciones abiertas. Verificación segura en `app/(app)/layout.tsx`.
- Cliente: `AuthService`, `UserService`, `AuthProvider` (`useAuth`), hooks `useLogin`, `useRegister`, `useLogout`, `useCreateUser` (validación zod compartida, errores por campo, toasts). `apiFetch` renueva la sesión una vez ante 401 (deduplicado) y lleva a `/login?expired=1` si no puede. Componentes `FormField` y `AccessDenied`; shadcn `input`, `label`, `dropdown-menu`, `select` con 44 px en móvil.
- Validado: 18 pruebas nuevas (66 en total), incluidas las de `LoginForm`, `CreateUserForm`, `safeCallbackUrl`, navegación por permisos y renovación en `apiFetch`. E2E con Playwright sobre el build de producción: sin sesión → `/login?callbackUrl`; registro → pendiente de permisos; usuario nuevo en `/usuarios/nuevo` → pendiente; logout; superadmin con email en mayúsculas; `/login` con sesión → `/`; superadmin ve Superadmin/Admin/Nuevo y crea un admin; admin con username ve solo Admin/Nuevo; cookies `httpOnly` sin tokens en `localStorage` ni `document.cookie`; access vencido → renovación transparente (307 → 303 → 200); sin scroll horizontal en 320 px y barra lateral en 1280 px; temas claro y oscuro (capturas revisadas).
- Pendiente: revisión humana; preguntas abiertas (contenido extra para usuarios nuevos; aviso a admins al registrarse alguien).
- **Corrección posterior (2026-10-05):** en Safari/WebKit el registro y el login no redirigían porque las cookies `Secure` llegaban por HTTP (`http://localhost`) y el navegador las descartaba (Chrome sí las acepta en localhost). Ahora `AUTH_COOKIE_SECURE=auto` (por defecto) pone `Secure` solo si la petición llega por HTTPS, también detrás de un proxy (`x-forwarded-proto`). Además, los botones de *Iniciar sesión* y *Crear cuenta* quedan deshabilitados hasta que la página se hidrata (`useHydrated`). Verificado en Chromium y WebKit: registro → pantalla de pendiente de permisos; login del superadmin → página de destino.
