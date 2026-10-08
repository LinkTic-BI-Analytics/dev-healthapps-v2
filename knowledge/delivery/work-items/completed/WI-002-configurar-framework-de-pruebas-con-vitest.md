---
type: chore
id: WI-002
title: Configurar framework de pruebas con Vitest
knowledge_level: K1
status: completed
phase: now
initiative: Configuración inicial del proyecto Next.js
domains:
  - Plataforma
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-002
source_initiative: RM-001
source_roadmap_initiative: RM-001
source_work_item_candidate: WI-CANDIDATE-002
source_title: Configurar framework de pruebas con Vitest
source_context: Materialized from roadmap candidate WI-CANDIDATE-002 under initiative RM-001.
source_initiative_title: Configuración inicial del proyecto Next.js
related_domain: Plataforma
related_capabilities:
  - Fundación técnica de la plataforma
expected_value: Poder validar cada Work Item con pruebas automatizadas desde el inicio.
risks:
  - Configuración incompatible con Next.js 16 / React 19.
dependencies:
  - WI-001
source_signals:
  - 'Capability Gap: no hay framework de pruebas configurado.'
  - 'Propuesta de `codebase.md`: Vitest.'
summary: El proyecto no tiene forma de validar automáticamente los cambios.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Configurar framework de pruebas con Vitest

> Type: chore · Level: K1

## Source

- Source: roadmap
- Roadmap Initiative: RM-001 — Configuración inicial del proyecto Next.js
- Work Item Candidate: WI-CANDIDATE-002
- Related domain: Plataforma
- Related capabilities:
  - Fundación técnica de la plataforma

> **Alcance:** configuración inicial del proyecto. Este Work Item **no incluye lógica de negocio**.

**Actor and outcome:** Equipo técnico: ejecuta las pruebas con un único comando.

**Current behavior:** No existe framework de pruebas ni script `test`.

**Target behavior:**
- Vitest configurado con soporte para TypeScript, el alias `@/*` y pruebas de componentes React (entorno DOM + Testing Library).
- Scripts `test` (una ejecución) y `test:watch`.
- Una prueba de ejemplo de una función pura y otra de un componente.

**Entry points:** `package.json`, `vitest.config.*`, archivos `*.test.ts(x)`.

**End-to-end flow:** El desarrollador ejecuta `pnpm test` → se ejecutan las pruebas → resultado de éxito o fallo.

**Problem:** El proyecto no tiene forma de validar automáticamente los cambios.

**Expected result:** `pnpm test` ejecuta pruebas unitarias y de componentes y termina con éxito.

**Suggested Knowledge Level:** K1

**Impact analysis:**
- frontend: affected
- backend: reviewed-not-affected
- database: not-applicable
- configuration: affected
- authentication: not-applicable
- notifications: not-applicable
- documentation: affected
- operations: not-applicable

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- _Ninguno._

**Scope confidence:** high — Alcance técnico acotado.

**Dependencies:**
- WI-001

**Acceptance criteria:**
- [ ] Existen los scripts `test` y `test:watch`.
- [ ] `pnpm test` ejecuta una prueba de función pura y una de componente, y ambas pasan.
- [ ] Los imports con `@/*` funcionan en las pruebas.
- [ ] Una prueba que falla hace que `pnpm test` termine con código distinto de cero.
- [ ] `codebase.md` (sección *How to test*) documenta cómo ejecutar las pruebas.

**Out of scope:**
- Cualquier funcionalidad de negocio (servicios monitoreados, verificaciones, estados, alertas).
- Playwright y pruebas en navegador (pendiente de decisión).
- Storybook (pendiente de decisión).
- Integración en CI.

**How to test it (validation):**
1. `pnpm test` → éxito.
2. Manual: romper una prueba → `pnpm test` falla.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan (y `pnpm test` cuando exista).
- [ ] `knowledge/tech/codebase.md` y `knowledge/tech/current-state.md` actualizados si cambió algo.
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿Se incluyen Playwright y Storybook en esta fase o más adelante?

**Suggested ownership (code globs):**
- `package.json`
- `vitest.config.*`
- `vitest.setup.*`
- `src/**/*.test.ts`
- `src/**/*.test.tsx`

**Related domain / capability:** Plataforma / Fundación técnica de la plataforma

**Related decisions:** Ninguna.

## Implementation Notes

- Vitest 5 + `@vitejs/plugin-react` + jsdom + Testing Library (`react`, `dom`, `user-event`, `jest-dom`).
- `vitest.config.mts` con `resolve.tsconfigPaths` (alias `@/*` nativo), `vitest.setup.ts` y tipos globales en `tsconfig.json`.
- Scripts `test` y `test:watch`. Pruebas de ejemplo: `src/lib/format.test.ts` (función pura `formatLatency`) y `app/page.test.tsx` (componente).
- Node fijado en 24 (`.nvmrc`, `engines`, `@types/node@24`): Vitest 5 requiere Node >= 22.12.
- Validado: `pnpm test` pasa (3 pruebas); una prueba rota hace que termine con código 1; `typecheck` y `lint` pasan.
- Pendiente: revisión humana. Playwright y Storybook siguen sin decidir (fuera de alcance).
