# Autenticación con Health Apps — guía para frontend

Cómo iniciar sesión en otra app con los usuarios de Health Apps. La API devuelve **tokens Bearer en JSON** (no usa cookies): la app guarda los tokens y los envía en cada petición.

> **URL base:** `https://<dominio-de-health-apps>` (pídela al equipo de backend). En los ejemplos se usa `API_URL`.

> ⚠️ **CORS:** hoy los endpoints no envían cabeceras CORS. Si van a llamarlos **desde el navegador** (SPA en otro dominio), avisen al equipo de backend con los orígenes que necesitan habilitar. Desde un backend propio (BFF, server actions, rutas API de Next.js, etc.) funciona sin cambios.

---

## Resumen del flujo

1. **Login:** `POST /api/auth/token` con usuario/email y contraseña → `accessToken` + `refreshToken`.
2. **Peticiones:** enviar `Authorization: Bearer <accessToken>`.
3. **Validar sesión / datos del usuario:** `GET /api/auth/me`.
4. **Token vencido (401):** `POST /api/auth/token/refresh` con el `refreshToken` → tokens nuevos. Reintentar la petición una sola vez.
5. **Logout:** `POST /api/auth/token/revoke` con el `refreshToken`.

| Token | Vigencia por defecto | Uso |
|---|---|---|
| `accessToken` (JWT) | 60 min (`expiresIn` en segundos) | Cabecera `Authorization` |
| `refreshToken` (opaco) | 7 días (`refreshExpiresIn` en segundos) | Solo para `/token/refresh` y `/token/revoke` |

No decodifiquen ni validen el JWT por su cuenta: la única fuente de verdad es `GET /api/auth/me` (una sesión puede revocarse antes de que el token venza).

---

## Endpoints

Todas las peticiones con cuerpo llevan `Content-Type: application/json`.

### `POST /api/auth/token` — iniciar sesión

```json
{ "identifier": "ana@empresa.com", "password": "••••••" }
```

`identifier` acepta **email o nombre de usuario** (no distingue mayúsculas).

**200 OK**

```json
{
  "tokenType": "Bearer",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "refreshToken": "g8C0mW...",
  "refreshExpiresIn": 604800,
  "user": {
    "id": "e636bd74-e953-4900-a9b1-782e535f67c8",
    "email": "ana@empresa.com",
    "username": "ana",
    "role": "admin",
    "permissions": ["services.read", "services.manage", "users.create", "users.read"]
  }
}
```

| Código | Cuándo | `message` |
|---|---|---|
| 400 | Faltan campos | `["Ingresa tu email o usuario."]`, etc. |
| 401 | Credenciales incorrectas | `Email, usuario o contraseña incorrectos.` |
| 403 | Cuenta desactivada | `Tu cuenta está desactivada. Contacta a un administrador.` |

### `GET /api/auth/me` — usuario actual

```
Authorization: Bearer <accessToken>
```

**200 OK** → `{ "user": { id, email, username, role, permissions } }`
**401** → token ausente, vencido o sesión revocada.

### `POST /api/auth/token/refresh` — renovar tokens

```json
{ "refreshToken": "g8C0mW..." }
```

**200 OK** → misma respuesta que el login, con **ambos tokens nuevos**. El `refreshToken` usado queda invalidado: guarden siempre el nuevo.
**401** → refresh token inválido, vencido o revocado → mandar al usuario al login.

> **Importante:** no reutilicen un refresh token ya usado. Si un refresh token rotado se usa de nuevo pasados 30 s, el backend lo trata como robo y **cierra todas las sesiones del usuario**. Si varias peticiones reciben 401 a la vez, hagan **un solo** refresh compartido (ver ejemplo abajo).

### `POST /api/auth/token/revoke` — cerrar sesión

```json
{ "refreshToken": "g8C0mW..." }
```

**204 No Content** siempre (aunque el token no exista). Desde ese momento el `accessToken` de esa sesión también deja de funcionar. Borren los tokens locales igualmente.

---

## Formato de errores

Todos los errores tienen esta forma:

```ts
type ApiError = {
  statusCode: number;
  message: string | string[]; // en validación (400) llega un array, un mensaje por problema
  error: string;              // "Bad Request", "Unauthorized", ...
};
```

Los mensajes están en español y se pueden mostrar directamente al usuario.

---

## Roles y permisos

`user.role`: `superadmin` | `admin` | `nuevo` (`nuevo` = autorregistrado, sin permisos).

`user.permissions` (permisos efectivos, ya calculados):

| Código | Significado |
|---|---|
| `users.read` | Ver usuarios |
| `users.create` | Crear usuarios |
| `services.read` | Ver servicios monitoreados y su estado |
| `services.manage` | Registrar, editar y desactivar servicios |

Usen `permissions` (no `role`) para mostrar u ocultar opciones. Es solo para la UI: el backend siempre vuelve a comprobar el permiso.

---

## Ejemplo de cliente (TypeScript)

```ts
const API_URL = process.env.HEALTH_APPS_URL!;

type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: "superadmin" | "admin" | "nuevo";
  permissions: string[];
};

type TokenResponse = {
  tokenType: "Bearer";
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  user: AuthUser;
};

// Adapten el almacenamiento a su app (ver "Dónde guardar los tokens").
let accessToken: string | null = null;
let refreshToken: string | null = null;

function saveTokens(t: TokenResponse) {
  accessToken = t.accessToken;
  refreshToken = t.refreshToken;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await res.json(); // ApiError
  return res.status === 204 ? (undefined as T) : res.json();
}

export async function login(identifier: string, password: string): Promise<AuthUser> {
  const tokens = await post<TokenResponse>("/api/auth/token", { identifier, password });
  saveTokens(tokens);
  return tokens.user;
}

// Un solo refresh en curso, compartido por todas las peticiones que reciban 401.
let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    if (!refreshToken) return false;
    try {
      saveTokens(await post<TokenResponse>("/api/auth/token/refresh", { refreshToken }));
      return true;
    } catch {
      accessToken = refreshToken = null;
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/** fetch autenticado: ante un 401 renueva la sesión una vez y reintenta. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const send = () =>
    fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${accessToken}` },
    });

  let res = await send();
  if (res.status === 401 && (await refreshSession())) res = await send();
  if (res.status === 401) {
    // Sesión terminada: redirigir al login.
  }
  return res;
}

export async function getMe(): Promise<AuthUser | null> {
  const res = await apiFetch("/api/auth/me");
  return res.ok ? (await res.json()).user : null;
}

export async function logout(): Promise<void> {
  if (refreshToken) await post("/api/auth/token/revoke", { refreshToken }).catch(() => {});
  accessToken = refreshToken = null;
}
```

---

## Dónde guardar los tokens

- **Recomendado:** que el backend de su app (BFF / servidor de Next.js) haga el login y guarde los tokens en una **cookie `httpOnly`** propia. El navegador nunca ve los tokens.
- **Si es una SPA pura:** `accessToken` **solo en memoria**. Eviten `localStorage` para el `refreshToken` (cualquier XSS puede robarlo); si no hay alternativa, asuman ese riesgo de forma explícita.
- Nunca pongan tokens en la URL ni en logs.

---

## Checklist de integración

- [ ] Login con email **y** con usuario.
- [ ] Mostrar los mensajes de error del backend (`message` puede ser array).
- [ ] Reintento automático tras 401 con **un único** refresh concurrente.
- [ ] Guardar siempre el refresh token nuevo tras cada refresh.
- [ ] Redirigir al login cuando el refresh falla.
- [ ] Logout llama a `/token/revoke` y borra los tokens locales.
- [ ] Opciones de la UI según `permissions`.
- [ ] Si se llama desde el navegador: CORS habilitado por backend para su origen.
