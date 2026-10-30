---
type: chore
id: WI-004
title: 'Utilidades compartidas: errores y cliente HTTP'
knowledge_level: K1
status: completed
phase: now
initiative: Configuración inicial del proyecto Next.js
domains:
  - Plataforma
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-004
source_initiative: RM-001
source_roadmap_initiative: RM-001
source_work_item_candidate: WI-CANDIDATE-004
source_title: 'Utilidades compartidas: errores y cliente HTTP'
source_context: Materialized from roadmap candidate WI-CANDIDATE-004 under initiative RM-001.
source_initiative_title: Configuración inicial del proyecto Next.js
related_domain: Plataforma
related_capabilities:
  - Fundación técnica de la plataforma
expected_value: >-
  Base común para que todos los services y hooks manejen errores de la misma
  forma.
risks:
  - Divergencia entre el formato de error del backend y el del cliente.
dependencies:
  - WI-002
source_signals:
  - >-
    Convenciones de `knowledge/tech/codebase.md` (services, hooks, tipos y
    manejo de errores).
summary: 'Sin utilidades comunes, cada feature manejaría los errores de forma distinta.'
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Utilidades compartidas: errores y cliente HTTP

> Type: chore · Level: K1

## Source

- Source: roadmap
- Roadmap Initiative: RM-001 — Configuración inicial del proyecto Next.js
- Work Item Candidate: WI-CANDIDATE-004
- Related domain: Plataforma
- Related capabilities:
  - Fundación técnica de la plataforma

> **Alcance:** configuración inicial del proyecto. Este Work Item **no incluye lógica de negocio**.

**Actor and outcome:** Equipo técnico: reutiliza un mismo manejo de errores y llamadas HTTP en todas las features.

**Current behavior:** No existen tipos ni helpers compartidos.

**Target behavior:**
- `src/types/api-error.type.ts`: tipo `ApiError`, `isApiError()` y `getErrorMessages()` (que cubre `message` como arreglo).
- `src/lib/parse-http-error-response.ts`: convierte cualquier respuesta fallida (JSON, texto o HTML) en `ApiError`.
- `src/lib/api-fetch.ts`: `apiFetch()` con un mensaje claro cuando el servidor no responde.
- Un helper para que los Route Handlers devuelvan errores con el formato `ApiError`.

**Entry points:** `src/types/`, `src/lib/`.

**End-to-end flow:** Un service llama a `apiFetch()` → si la respuesta falla, recibe un `ApiError` → el hook muestra los mensajes con `getErrorMessages()`.

**Problem:** Sin utilidades comunes, cada feature manejaría los errores de forma distinta.

**Expected result:** Tipos y helpers de error y HTTP disponibles y probados.

**Suggested Knowledge Level:** K1

**Impact analysis:**
- frontend: affected
- backend: affected
- database: not-applicable
- configuration: not-applicable
- authentication: not-applicable
- notifications: not-applicable
- documentation: affected
- operations: not-applicable

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- _Ninguno._

**Scope confidence:** high — Patrón ya definido en `codebase.md`.

**Dependencies:**
- WI-002

**Acceptance criteria:**
- [ ] `isApiError()` distingue un `ApiError` de otros errores.
- [ ] `getErrorMessages()` devuelve un arreglo tanto si `message` es string como si es arreglo.
- [ ] `parseHttpErrorResponse()` produce un `ApiError` válido para respuestas JSON, de texto y HTML (p. ej. 413 de un proxy).
- [ ] `apiFetch()` lanza un `ApiError` con un mensaje accionable cuando el servidor no responde.
- [ ] Los mensajes de error están en español y dicen qué hacer.
- [ ] Todas las utilidades tienen pruebas unitarias.

**Out of scope:**
- Cualquier funcionalidad de negocio (servicios monitoreados, verificaciones, estados, alertas).
- Services y hooks de dominio.

**How to test it (validation):**
1. `pnpm test` → pruebas de `api-error`, `parseHttpErrorResponse` y `apiFetch` (con `fetch` simulado).
2. `pnpm typecheck` → sin errores.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan (y `pnpm test` cuando exista).
- [ ] `knowledge/tech/codebase.md` y `knowledge/tech/current-state.md` actualizados si cambió algo.
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- _Ninguno._

**Suggested ownership (code globs):**
- `src/types/**`
- `src/lib/parse-http-error-response.ts`
- `src/lib/api-fetch.ts`
- `src/lib/api-error-response.ts`

**Related domain / capability:** Plataforma / Fundación técnica de la plataforma

**Related decisions:** Ninguna.

## Implementation Notes

- `src/types/api-error.type.ts`: `ApiError`, `isApiError()`, `getErrorMessages()` (string o arreglo).
- `src/lib/parse-http-error-response.ts`: JSON con formato `ApiError`, JSON con otro formato, texto plano y HTML de proxy (p. ej. 413) → `ApiError` con mensajes accionables en español.
- `src/lib/api-fetch.ts`: `apiFetch<T>()` con `credentials: same-origin`, cuerpo `json`, manejo de 204 y error de red (`NetworkError`, `statusCode: 0`).
- Servidor: `src/lib/http-error.ts` (`HttpError`) y `src/lib/api-error-response.ts` (`apiErrorResponse`, `toApiErrorResponse`, que oculta los detalles de errores no controlados).
- Validado: 15 pruebas nuevas (24 en total); `typecheck` y `lint` pasan.
- Pendiente: revisión humana.
