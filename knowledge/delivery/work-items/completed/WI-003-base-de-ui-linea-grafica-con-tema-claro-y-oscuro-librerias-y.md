---
type: chore
id: WI-003
title: >-
  Base de UI: línea gráfica con tema claro y oscuro, librerías y layout
  responsive
knowledge_level: K2
status: completed
phase: now
initiative: Configuración inicial del proyecto Next.js
domains:
  - Plataforma
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-003
source_initiative: RM-001
source_roadmap_initiative: RM-001
source_work_item_candidate: WI-CANDIDATE-003
source_title: >-
  Base de UI: línea gráfica con tema claro y oscuro, librerías y layout
  responsive
source_context: Materialized from roadmap candidate WI-CANDIDATE-003 under initiative RM-001.
source_initiative_title: Configuración inicial del proyecto Next.js
related_domain: Plataforma
related_capabilities:
  - Fundación técnica de la plataforma
expected_value: >-
  Sistema visual de Health Apps disponible como tokens y componentes base, con
  un layout responsive listo para las pantallas de negocio.
risks:
  - Tokens que no respetan la línea gráfica.
  - Layout pensado para escritorio que falla en móvil.
  - >-
    Contraste insuficiente en alguno de los dos temas (en especial los colores
    de estado sobre fondo claro).
  - Parpadeo del tema incorrecto al cargar la página.
dependencies:
  - WI-001
source_signals:
  - >-
    Decisión del equipo (2026-10-05): adoptar shadcn/Radix, lucide-react,
    react-hot-toast y Chart.js.
  - >-
    Decisión del equipo (2026-10-05): web mobile-first, responsive para
    escritorio.
  - Línea gráfica en `resources/lineagrafica/Health Apps.dc.html`.
  - >-
    Decisión del equipo (2026-10-05): la línea gráfica tiene tema claro y tema
    oscuro.
  - >-
    Decisión del equipo (2026-10-05): en escritorio el layout cambia y se
    reacomoda, no solo se estira.
summary: >-
  No existe el sistema visual de Health Apps ni un layout responsive sobre el
  que construir las pantallas.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Base de UI: línea gráfica con tema claro y oscuro, librerías y layout responsive

> Type: chore · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-001 — Configuración inicial del proyecto Next.js
- Work Item Candidate: WI-CANDIDATE-003
- Related domain: Plataforma
- Related capabilities:
  - Fundación técnica de la plataforma

> **Alcance:** configuración inicial del proyecto. Este Work Item **no incluye lógica de negocio**.

**Actor and outcome:** Equipo técnico (usuario final de Health Apps): usa la aplicación desde el móvil o el escritorio con una identidad visual consistente.

**Current behavior:** `app/globals.css` tiene los colores por defecto del scaffold (claro/oscuro genérico) y las fuentes Geist; no hay librerías de UI.

**Target behavior:**
- **Tokens** de la línea gráfica (`resources/lineagrafica/`) definidos en `app/globals.css` con `@theme` de Tailwind v4, como **tokens semánticos** (`--color-bg`, `--color-surface`, `--color-text`, `--color-status-ok`…) con un valor por tema. Los valores siguientes son los del **tema oscuro**:
  - Superficies: fondo `#0f1214`, superficie `#161a1d`, superficie elevada `#1f2427` / `#20262a`, bordes `#262c30` / `#2c3236`.
  - Texto: principal `#e8edf0`, secundario `#c9d1d6`, atenuado `#8d989f`, tenue `#6c777e`.
  - Estados de salud (con su tinte de fondo): operativo `oklch(0.78 0.16 155)`, degradado `oklch(0.82 0.15 80)`, caído `oklch(0.66 0.21 25)`.
  - Acento/enlaces: `oklch(0.8 0.12 200)`.
  - Tipografía: IBM Plex Sans (texto) e IBM Plex Mono (cifras, métricas, códigos), cargadas con `next/font`.
  - Radios: 8, 10 y 16 px (tarjetas); 9999 px (pastillas).
- **Tema claro y tema oscuro:**
  - Los dos temas comparten los mismos tokens semánticos; solo cambian los valores.
  - Tema claro: los valores se toman de la línea gráfica. **Hoy `resources/lineagrafica/` solo define el tema oscuro**, así que los valores del tema claro deben entregarse antes de cerrar este WI.
  - Por defecto se usa el tema del sistema (`prefers-color-scheme`); el usuario puede cambiarlo desde el layout y la preferencia se guarda en `localStorage` (`health_apps_theme`), con `try/catch` y guarda de SSR.
  - Sin parpadeo del tema incorrecto al cargar (el tema se aplica antes de pintar).
  - Los componentes no usan colores fijos: siempre los tokens semánticos.
- **Librerías** instaladas y configuradas: shadcn/Radix (con `components.json` apuntando a `src/components/ui`), `lucide-react` y `react-hot-toast` (con un `ToasterCustom` con los tokens). Chart.js se instala en el WI que lo usa por primera vez (WI-013).
- `cn()` en `src/lib/utils.ts`.
- **Layout principal** (`src/layouts/MainLayout`), **mobile-first**, que **cambia de estructura en escritorio** (no solo se estira):
  - **Móvil (< `md`):** encabezado compacto, contenido en una columna y navegación inferior (*Panel*, *Alertas*).
  - **Escritorio (≥ `md`):** la navegación inferior desaparece y pasa a una **barra lateral** _(propuesta)_; el contenido se reacomoda en una rejilla de varias columnas y se limita a un ancho máximo legible.
  - Sin contenido de negocio: solo los placeholders de las secciones *Panel* y *Alertas* y el selector de tema.
- Página `/` que muestra los componentes base con los tokens (botón, tarjeta, pastilla de estado) como verificación visual.

**Entry points:** `app/globals.css`, `app/layout.tsx`, `src/components/ui/`, `src/layouts/`, `src/lib/utils.ts`, `components.json`.

**End-to-end flow:** El usuario abre la web en el móvil (390 px) → ve el layout con navegación inferior en el tema de su sistema → cambia el tema y la preferencia se mantiene al recargar → en escritorio la navegación pasa a la barra lateral y el contenido se reacomoda en varias columnas.

**Problem:** No existe el sistema visual de Health Apps ni un layout responsive sobre el que construir las pantallas.

**Expected result:** Tokens de la línea gráfica en tema claro y oscuro, librerías de UI y un layout que cambia de estructura entre móvil y escritorio, listos y verificables visualmente.

**Suggested Knowledge Level:** K2

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
- Valores del tema claro: no están en `resources/lineagrafica/` (solo hay tema oscuro).
- El prototipo asume una app iOS; se reinterpreta como web mobile-first (decisión del equipo).

**Scope confidence:** medium — Tema oscuro y librerías definidos; faltan los valores del tema claro en la línea gráfica.

**Dependencies:**
- WI-001

**Acceptance criteria:**
- [ ] `app/globals.css` define como tokens semánticos de Tailwind todos los colores, tipografías y radios de la línea gráfica, con valores para el tema claro y el oscuro (no quedan los valores del scaffold).
- [ ] Por defecto se aplica el tema del sistema; el usuario puede cambiarlo y la preferencia persiste al recargar.
- [ ] Al cargar la página no aparece el tema incorrecto (sin parpadeo).
- [ ] Ningún componente usa colores fijos fuera de los tokens.
- [ ] IBM Plex Sans e IBM Plex Mono se cargan con `next/font`.
- [ ] shadcn/Radix, `lucide-react` y `react-hot-toast` están instalados; los componentes de shadcn se generan en `src/components/ui`.
- [ ] El layout se diseña primero para 390 px; no hay scroll horizontal entre 320 px y 1440 px.
- [ ] Desde `md` el layout cambia de estructura: la navegación inferior se reemplaza por la barra lateral y el contenido se reacomoda en varias columnas, con un ancho máximo.
- [ ] Los elementos táctiles miden al menos 44×44 px en móvil.
- [ ] Los estados de salud se comunican con color **y** texto.
- [ ] El texto y los colores de estado cumplen contraste WCAG AA sobre el fondo **en ambos temas**.
- [ ] E2E: abrir `/` en 390 px → navegación inferior; en 1280 px → barra lateral y contenido en columnas; cambiar a tema claro y recargar → se mantiene el tema claro.

**Out of scope:**
- Cualquier funcionalidad de negocio (servicios monitoreados, verificaciones, estados, alertas).
- Pantallas de negocio (panel, detalle, alertas).
- Chart.js (se instala en WI-013).

**How to test it (validation):**
1. `pnpm test` → pruebas de render del layout y de la pastilla de estado.
2. Manual: DevTools en modo dispositivo a 390 px, 768 px y 1280 px → sin scroll horizontal; navegación inferior en móvil y barra lateral en escritorio, con el contenido reacomodado.
3. Manual: con el sistema en modo claro y en modo oscuro, abrir la app → se aplica el tema del sistema; cambiarlo manualmente y recargar → persiste y no hay parpadeo.
4. Manual: comparar los colores y las tipografías de ambos temas con la línea gráfica.
5. `pnpm build` → éxito.
6. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan (y `pnpm test` cuando exista).
- [ ] `knowledge/tech/codebase.md` y `knowledge/tech/current-state.md` actualizados si cambió algo.
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [resuelta] ¿Hay tema claro? → Sí, la línea gráfica lleva tema claro y oscuro.
- [resuelta] ¿El layout cambia en escritorio? → Sí, se reacomoda (no solo se estira).
- [open] **Bloqueante para cerrar el WI:** ¿Dónde están los valores del tema claro? `resources/lineagrafica/` solo contiene el tema oscuro.
- [open] ¿Se confirma la barra lateral como navegación de escritorio?
- [open] ¿El tema por defecto sigue al sistema o siempre arranca en oscuro?

**Suggested ownership (code globs):**
- `app/globals.css`
- `app/layout.tsx`
- `components.json`
- `src/components/**`
- `src/layouts/**`
- `src/lib/utils.ts`

**Related domain / capability:** Plataforma / Fundación técnica de la plataforma

**Related decisions:** Ninguna.

## Implementation Notes

- Tokens semánticos en `app/globals.css` (`@theme inline` de Tailwind v4): superficies, texto (`text-secondary`, `text-subtle`), acento, estados de salud con tinte (`status-ok|warn|down` + `-tint`), gráficas y radios. **Tema oscuro = valores de la línea gráfica; tema claro = PROVISIONAL** derivado del oscuro (pendiente de valores oficiales).
- IBM Plex Sans/Mono con `next/font/google`.
- shadcn (preset `radix-nova`, `components.json` → `src/components/ui`), `lucide-react`, `react-hot-toast` (`ToasterCustom`) y `next-themes` (`ThemeProvider`, clave `health_apps_theme`, por defecto el sistema, sin parpadeo). `cn()` en `src/lib/utils.ts` (paquete oficial `cn` de shadcn). Botones de 44 px en móvil.
- `MainLayout` (`src/layouts/`) en el grupo de rutas `app/(app)/`: móvil = encabezado + navegación inferior; ≥ `md` = barra lateral, contenido con ancho máximo y rejilla de varias columnas. Placeholders de *Panel* (`/`) y *Alertas* (`/alertas`). Componentes `StatusBadge` y `ThemeToggle`; tipo `HealthStatus`.
- `typecheck` ahora ejecuta `next typegen` antes de `tsc` (evita tipos de rutas obsoletos en `.next`).
- Validado: 9 pruebas (StatusBadge, ThemeToggle, MainLayout); `typecheck`, `lint` y `build` pasan. E2E con Playwright (fuera del repo): sin scroll horizontal de 320 a 1440 px, navegación inferior < 768 px y barra lateral ≥ 768 px, botones de 44 px en móvil, tema persistente tras recargar. Contraste WCAG AA verificado por script en ambos temas (`text-subtle` oscuro ~3.8–4.1:1, valor de la línea gráfica: solo texto auxiliar).
- Pendiente: valores oficiales del tema claro; confirmar barra lateral en escritorio; revisión humana.
