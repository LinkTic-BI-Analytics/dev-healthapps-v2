---
type: feature
id: WI-012
title: Panel general con estado de servicios
knowledge_level: K2
status: completed
phase: now
initiative: Panel de monitoreo
domains:
  - Visualización y monitoreo
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-012
source_initiative: RM-004
source_roadmap_initiative: RM-004
source_work_item_candidate: WI-CANDIDATE-012
source_title: Panel general con estado de servicios
source_context: Materialized from roadmap candidate WI-CANDIDATE-012 under initiative RM-004.
source_initiative_title: Panel de monitoreo
related_domain: Visualización y monitoreo
related_capabilities:
  - Panel general de monitoreo
expected_value: 'Tarjetas por servicio con estado, última verificación e indicadores globales.'
risks:
  - Saturación visual con muchos servicios.
dependencies:
  - WI-011
source_signals:
  - 'Business Goal: Disponer de un único punto de consulta.'
  - 'Constraint: Presentación visual, clara y fácil de interpretar.'
summary: No hay una vista central del estado del ecosistema.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Panel general con estado de servicios

> Type: feature · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-004 — Panel de monitoreo
- Work Item Candidate: WI-CANDIDATE-012
- Related domain: Visualización y monitoreo
- Related capabilities:
  - Panel general de monitoreo

**Actor and outcome:** Equipo técnico: identifica de un vistazo qué servicios están operativos, degradados o fuera de servicio.

**Current behavior:** `app/page.tsx` muestra el scaffold por defecto de Next.js.

**Target behavior:** La página principal muestra indicadores globales (total por estado) y una tarjeta por servicio con nombre, estado (color + texto), último tiempo de respuesta y última verificación.

**Entry points:** `app/page.tsx` (ruta `/`).

**End-to-end flow:** El usuario abre `/` → se cargan los servicios y su estado actual → ve los indicadores globales y las tarjetas → puede abrir el detalle de un servicio.

**Problem:** No hay una vista central del estado del ecosistema.

**Expected result:** Desde `/` se identifica en segundos el estado de cada servicio.

**Suggested Knowledge Level:** K2

**Impact analysis:**
- frontend: affected
- backend: affected
- database: reviewed-not-affected
- configuration: reviewed-not-affected
- authentication: unknown
- notifications: not-applicable
- documentation: affected
- operations: not-applicable

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Frecuencia de actualización de la vista (recarga automática o manual).

**Scope confidence:** high — Vista de lectura sobre datos ya calculados.

**Dependencies:**
- WI-011

**Acceptance criteria:**
- [ ] Mobile-first: la vista se diseña primero para 390 px, sin scroll horizontal; en escritorio (≥ `md`) se **reacomoda** según el layout de WI-003.
- [ ] Se ve correctamente en tema claro y en tema oscuro (solo usa tokens semánticos).
- [ ] En móvil las tarjetas van en una columna; en escritorio, en una rejilla de varias columnas junto con los indicadores globales.
- [ ] La página `/` muestra una tarjeta por cada servicio activo.
- [ ] Cada tarjeta muestra el estado con color y texto (no solo color), el último tiempo de respuesta y la última verificación.
- [ ] Se muestran indicadores globales: total de servicios operativos, degradados y fuera de servicio.
- [ ] El estado vacío (sin servicios) muestra un mensaje que lleva al registro de servicios.
- [ ] E2E: con un servicio caído, el usuario abre `/` y lo ve marcado como fuera de servicio.

**Out of scope:**
- Paneles personalizables.
- Gráficas históricas (WI-013).

**How to test it (validation):**
1. `pnpm test` → pruebas de los componentes de tarjeta e indicadores.
2. Manual: con servicios en los tres estados, abrir `/` y verificar las tarjetas y los indicadores.
3. `pnpm build` termina con éxito.
4. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Conocimiento afectado actualizado (capabilities / current-state / ADR).
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿La vista debe actualizarse automáticamente? ¿Cada cuánto?

**Suggested ownership (code globs):**
- `app/page.tsx`
- `app/layout.tsx`
- `src/components/**`

**Related domain / capability:** Visualización y monitoreo / Panel general de monitoreo

**Related decisions:** Ninguna.

## Implementation Notes

- `GET /api/dashboard` (requiere `services.read`): servicios activos con estado, última latencia, última verificación, umbral y las últimas 20 latencias (una sola consulta con `row_number() OVER (PARTITION BY service_id …)`); conteos por estado (`operativo`, `degradado`, `caido`, `sinDatos`); orden caído → degradado → sin datos → operativo.
- `/` (`DashboardView`): "Actualizado hace…", botón de actualizar, `HealthOverview` (estado general con el color del peor estado, barra de distribución y totales en IBM Plex Mono), filtros por estado con conteo, `ServiceHealthCard` (franja de color, `StatusBadge` con texto, latencia resaltada si supera el umbral, "hace X", mini gráfica SVG sin librerías y enlace al detalle). Estados de carga, error, vacío (con enlace a registrar servicio) y filtro sin resultados.
- Actualización automática cada 30 s solo con la pestaña visible (`useDashboard`), y al volver a la pestaña.
- `StatusBadge` admite `null` ("Sin datos"); clases de color por estado en `src/types/health-status.style.ts`; `formatRelativeTime()` en `src/lib/format.ts`.
- Validado: 7 pruebas unitarias nuevas y 1 de integración (106 unitarias y 30 de integración en total). E2E con datos reales (worker + servicios de prueba con respuestas rápidas, lentas y 503): la tarjeta "Integración ERP" se ve como **Caído**; "2 servicios requieren atención"; filtro de caídos; 390 px en una columna sin scroll horizontal (oscuro); 1280 px con resumen a la izquierda y tarjetas en 2 columnas (claro); también en WebKit.
- Supuesto: actualización cada 30 s (pregunta abierta del WI).
- Pendiente: revisión humana.
