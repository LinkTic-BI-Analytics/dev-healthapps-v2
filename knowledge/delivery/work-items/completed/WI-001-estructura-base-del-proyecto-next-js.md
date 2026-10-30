---
type: chore
id: WI-001
title: Estructura base del proyecto Next.js
knowledge_level: K1
status: completed
phase: now
initiative: Configuración inicial del proyecto Next.js
domains:
  - Plataforma
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-001
source_initiative: RM-001
source_roadmap_initiative: RM-001
source_work_item_candidate: WI-CANDIDATE-001
source_title: Estructura base del proyecto Next.js
source_context: Materialized from roadmap candidate WI-CANDIDATE-001 under initiative RM-001.
source_initiative_title: Configuración inicial del proyecto Next.js
related_domain: Plataforma
related_capabilities:
  - Fundación técnica de la plataforma
expected_value: >-
  Proyecto limpio, con la estructura de carpetas y convenciones de
  `codebase.md`, listo para construir encima.
risks:
  - Romper imports existentes al cambiar el alias `@/*`.
dependencies: []
source_signals:
  - 'Capability Gap: el repositorio solo tiene el scaffold de create-next-app.'
  - >-
    Decisión del equipo (2026-10-05): seguir la guía de estructura adaptada en
    `knowledge/tech/codebase.md`.
summary: >-
  El repositorio no tiene la estructura ni las convenciones acordadas, solo el
  scaffold de ejemplo.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Estructura base del proyecto Next.js

> Type: chore · Level: K1

## Source

- Source: roadmap
- Roadmap Initiative: RM-001 — Configuración inicial del proyecto Next.js
- Work Item Candidate: WI-CANDIDATE-001
- Related domain: Plataforma
- Related capabilities:
  - Fundación técnica de la plataforma

> **Alcance:** configuración inicial del proyecto. Este Work Item **no incluye lógica de negocio**.

**Actor and outcome:** Equipo técnico: trabaja sobre un proyecto con estructura y convenciones definidas desde el primer commit.

**Current behavior:** Scaffold de create-next-app: página de ejemplo, metadatos `Create Next App`, fuentes Geist, `lang="en"`, alias `@/*` → `./*`, sin carpeta `src/`.

**Target behavior:**
- Existe la estructura `src/` (`components/ui/`, `features/`, `layouts/`, `hooks/`, `lib/`, `types/`) con un `.gitkeep` o `README` breve donde esté vacía.
- El alias `@/*` apunta a `src/*` en `tsconfig.json`.
- Se elimina el contenido de ejemplo del scaffold (página de Next.js y SVG de `public/` no usados).
- `app/layout.tsx` declara `lang="es"`, título `Health Apps` y descripción; la `viewport` se define con la API vigente de Next.js 16 (verificar en `node_modules/next/dist/docs/`).
- `app/page.tsx` muestra un placeholder mínimo, sin contenido de negocio.
- TypeScript mantiene `strict: true`; existe el script `typecheck` (`tsc --noEmit`).
- `README.md` describe el proyecto, los requisitos (Node, pnpm) y los scripts.

**Entry points:** `app/layout.tsx`, `app/page.tsx`, `tsconfig.json`, `package.json`, `README.md`, `src/`.

**End-to-end flow:** El desarrollador clona el repo → `pnpm install` → `pnpm dev` → ve el placeholder de Health Apps en `/`.

**Problem:** El repositorio no tiene la estructura ni las convenciones acordadas, solo el scaffold de ejemplo.

**Expected result:** Proyecto Next.js limpio con la estructura de `codebase.md` y los scripts de calidad básicos.

**Suggested Knowledge Level:** K1

**Impact analysis:**
- frontend: affected
- backend: not-applicable
- database: not-applicable
- configuration: affected
- authentication: not-applicable
- notifications: not-applicable
- documentation: affected
- operations: not-applicable

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- API exacta de `viewport`/metadatos en Next.js 16.

**Scope confidence:** high — Cambios de configuración acotados.

**Dependencies:**
- _Ninguno._

**Acceptance criteria:**
- [ ] La estructura `src/` existe según `knowledge/tech/codebase.md`.
- [ ] `@/*` resuelve a `src/*` (un import de prueba con el alias compila).
- [ ] No queda contenido de ejemplo del scaffold.
- [ ] `<html lang="es">`, título `Health Apps` y viewport configurados.
- [ ] Existen los scripts `typecheck` y `lint`, y ambos pasan.
- [ ] `pnpm build` termina con éxito.
- [ ] `README.md` documenta requisitos y scripts.
- [ ] E2E: `pnpm dev` → abrir `/` en el navegador → se ve el placeholder de Health Apps sin errores en consola.

**Out of scope:**
- Cualquier funcionalidad de negocio (servicios monitoreados, verificaciones, estados, alertas).
- Tokens de diseño y librerías de UI (WI-003).
- Base de datos y Docker (WI-005, WI-006).

**How to test it (validation):**
1. `pnpm typecheck` → sin errores.
2. `pnpm lint` → sin errores.
3. `pnpm build` → éxito.
4. Manual: `pnpm dev` y abrir `/` en 390 px y en escritorio → placeholder visible.
5. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan (y `pnpm test` cuando exista).
- [ ] `knowledge/tech/codebase.md` y `knowledge/tech/current-state.md` actualizados si cambió algo.
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿Se agrega Prettier o se mantiene solo ESLint?

**Suggested ownership (code globs):**
- `app/layout.tsx`
- `app/page.tsx`
- `tsconfig.json`
- `package.json`
- `README.md`
- `src/**`

**Related domain / capability:** Plataforma / Fundación técnica de la plataforma

**Related decisions:** Ninguna.

## Implementation Notes

- Estructura `src/` creada (`components/ui`, `features`, `layouts`, `hooks`, `lib`, `types`) con `.gitkeep`.
- Alias `@/*` → `./src/*` en `tsconfig.json`.
- Scaffold eliminado (SVG de `public/`, página de ejemplo, fuentes Geist); `app/layout.tsx` con `lang="es"`, `metadata` y `viewport` (API de Next.js 16).
- Scripts `typecheck` y `lint`; `engines.node >= 20.9`; `README.md` reescrito.
- `resources/**` excluido de ESLint (prototipo de diseño, no es código del proyecto).
- Validado: `pnpm typecheck`, `pnpm lint` y `pnpm build` pasan; `pnpm dev` sirve `/` con `<html lang="es">` y título `Health Apps`.
- Pendiente: revisión humana. Prettier no se agregó (pregunta abierta).
