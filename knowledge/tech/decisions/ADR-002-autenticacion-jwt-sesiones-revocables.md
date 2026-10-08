---
type: adr
id: ADR-002
status: draft
date: 2026-10-05
code:
  - src/features/auth/server/**
  - app/api/auth/**
  - proxy.ts
related_work_items: [WI-019, WI-020]
---

# ADR-002 — Autenticación con JWT de acceso y sesiones revocables

## Context

El equipo pidió autenticación por **JWT con capacidad de invalidar tokens**. Un JWT por sí solo es válido hasta su expiración, así que hacía falta un mecanismo de revocación. La duración de los tokens debe configurarse en `.env` (access normalmente 60 min).

## Options Considered

1. **JWT de acceso + sesión en base de datos** (elegida): el JWT lleva `sid`; cada petición protegida valida que la sesión no esté revocada. Revocar la sesión invalida de inmediato sus tokens.
2. Lista negra de `jti` revocados: obliga a consultar la lista en cada petición y no permite "cerrar sesión en todos los dispositivos" sin recorrer todos los tokens.
3. Campo `token_version` en el usuario: invalida todo de golpe, pero no una sola sesión.
4. Sesiones opacas sin JWT: más simple, pero no cumple el requisito de JWT.

## Decision

Propuesta (pendiente de aceptación):

- Access token JWT HS256 (`jose`) con `sub`, `sid`, `role`, `jti`, `iss`, `aud`; duración `JWT_ACCESS_TTL_MINUTES` (60).
- Refresh token opaco de 256 bits; solo se guarda su SHA-256 en `user_sessions`; duración `REFRESH_TOKEN_TTL_MINUTES` (supuesto: 10080 = 7 días). Se **rota** en cada uso; reutilizar uno ya rotado revoca todas las sesiones (`reuse_detected`), con un margen de 30 s para pestañas concurrentes.
- Revocación: logout (sesión actual), logout-all, cambio de contraseña y desactivación del usuario.
- Tokens en cookies `httpOnly`, `Secure`, `SameSite=Lax` (no en `localStorage`, a diferencia de la guía de Savvi). El refresh token solo viaja a `/api/auth`.
- `proxy.ts` hace la verificación optimista (firma y expiración); la verificación segura (sesión vigente) se hace en el servidor.
- Contraseñas con argon2id; mismo mensaje para credenciales incorrectas.

## Consequences

- (+) Invalidación inmediata y por sesión; "cerrar sesión en todos los dispositivos".
- (+) Los tokens no son accesibles desde JavaScript (mitiga XSS).
- (−) Una consulta a la base por petición protegida (aceptable para el volumen esperado; se puede cachear).
- (−) Sin límite de intentos de login por ahora (pregunta abierta).

## Related Capabilities

- Identidad y acceso / Autenticación de usuarios; Gestión de sesiones y revocación de tokens

## Related Work Items

- WI-019, WI-020
