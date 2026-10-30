---
type: feature
id: WI-013
title: Detalle de servicio con métricas y gráficas
knowledge_level: K2
status: completed
phase: now
initiative: Panel de monitoreo
domains:
  - Visualización y monitoreo
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-013
source_initiative: RM-004
source_roadmap_initiative: RM-004
source_work_item_candidate: WI-CANDIDATE-013
source_title: Detalle de servicio con métricas y gráficas
source_context: Materialized from roadmap candidate WI-CANDIDATE-013 under initiative RM-004.
source_initiative_title: Panel de monitoreo
related_domain: Visualización y monitoreo
related_capabilities:
  - Detalle de servicio
  - Recolección de métricas de rendimiento
expected_value: 'Tiempos de respuesta, fallos y resultados recientes en gráficas.'
risks:
  - Peso del bundle de Chart.js en móvil (cargarlo solo en el detalle).
dependencies:
  - WI-012
source_signals:
  - 'Business Goal: Disponer de un único punto de consulta.'
  - 'Decisión del equipo (2026-10-05): gráficas con Chart.js + react-chartjs-2.'
summary: >-
  El panel general no permite investigar por qué un servicio está degradado o
  caído.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Detalle de servicio con métricas y gráficas

> Type: feature · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-004 — Panel de monitoreo
- Work Item Candidate: WI-CANDIDATE-013
- Related domain: Visualización y monitoreo
- Related capabilities:
  - Detalle de servicio
  - Recolección de métricas de rendimiento

**Actor and outcome:** Equipo técnico: investiga el comportamiento reciente de un servicio.

**Current behavior:** No existe vista de detalle.

**Target behavior:** Una ruta de detalle muestra estado actual, gráfica de tiempos de respuesta, lista de verificaciones recientes con fallos destacados y los umbrales configurados.

**Entry points:** Ruta de detalle de servicio en `app/` (p. ej. `/services/[id]`).

**End-to-end flow:** El usuario hace clic en una tarjeta del panel → abre el detalle → ve la gráfica de tiempos de respuesta y las verificaciones recientes.

**Problem:** El panel general no permite investigar por qué un servicio está degradado o caído.

**Expected result:** El detalle muestra las métricas recientes de un servicio de forma visual.

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
- Ventana de tiempo por defecto de la gráfica.

**Scope confidence:** high — Librería de gráficas decidida (Chart.js + `react-chartjs-2`).

**Dependencies:**
- WI-012

**Acceptance criteria:**
- [ ] Mobile-first: la vista se diseña primero para 390 px, sin scroll horizontal; en escritorio (≥ `md`) se **reacomoda** según el layout de WI-003.
- [ ] Se ve correctamente en tema claro y en tema oscuro (solo usa tokens semánticos).
- [ ] En escritorio las métricas, la gráfica y la lista de verificaciones se reacomodan en columnas en lugar de apilarse.
- [ ] Los colores de la gráfica cambian con el tema.
- [ ] Chart.js y `react-chartjs-2` se instalan en este WI y la gráfica se carga solo en el detalle (sin afectar el bundle del panel).
- [ ] La gráfica usa los colores de estado y la línea de umbral de la línea gráfica (umbral en rojo discontinuo).
- [ ] Desde una tarjeta del panel se navega al detalle del servicio.
- [ ] El detalle muestra una gráfica de tiempos de respuesta de las verificaciones recientes, con la línea de umbral.
- [ ] El detalle lista las verificaciones recientes, con los fallos destacados y su motivo.
- [ ] Un servicio inexistente muestra una página de no encontrado.
- [ ] E2E: desde `/` hacer clic en un servicio degradado → ver en la gráfica las latencias por encima del umbral.

**Out of scope:**
- Uptime por período (WI-015).
- Exportación de datos.

**How to test it (validation):**
1. `pnpm test` → pruebas del componente de detalle y de la consulta de verificaciones recientes.
2. Manual: navegar del panel al detalle y validar la gráfica con datos conocidos.
3. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Conocimiento afectado actualizado (capabilities / current-state / ADR).
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [resuelta] ¿Qué librería de gráficas se usará? → Chart.js + `react-chartjs-2`.
- [open] ¿Qué ventana de tiempo se muestra por defecto?

**Suggested ownership (code globs):**
- `app/services/**`
- `src/components/**`

**Related domain / capability:** Visualización y monitoreo / Detalle de servicio, Recolección de métricas de rendimiento

**Related decisions:** Ninguna.

## Implementation Notes

- Ruta `/servicios/[id]` (requiere `services.read`; id inválido o inexistente → página "No encontrado" en `app/(app)/not-found.tsx`) con `ServiceDetailView`: estado (`StatusBadge` + "desde hace…"), descripción y URL, métricas en IBM Plex Mono (última respuesta resaltada si supera el umbral, umbral, fallos seguidos / umbral, última verificación), gráfica de tiempos de respuesta con rangos 1 h / 24 h y verificaciones recientes (20, la más reciente primero, fallos resaltados con su motivo, HTTP y latencia). Botón Editar con `services.manage`.
- `GET /api/services/[id]/detail?range=1h|24h` (máx. 1 500 puntos) y `useServiceDetail` con actualización cada 30 s.
- `ResponseTimeChart` con Chart.js + `react-chartjs-2` (instalados en este WI), cargado con `next/dynamic` (`ssr: false`) solo en el detalle; colores leídos de los tokens del tema activo (`resolveCssColor()` convierte oklch a rgba pintando un píxel) y recalculados al cambiar de tema; línea de umbral roja discontinua; puntos ámbar por encima del umbral y rojos en fallos; horas en formato 24 h.
- Escritorio (≥ `lg`): métricas y gráfica a la izquierda, verificaciones a la derecha; móvil: una columna. El nombre de cada servicio en `/servicios` enlaza al detalle; las tarjetas del panel también.
- Validado: 2 pruebas unitarias y 2 de integración nuevas (108 unitarias y 32 de integración en total). E2E: desde `/` clic en "API de Pagos" (degradado) → gráfica con las latencias por encima de la línea de 600 ms; **el panel no descarga Chart.js** y el detalle sí; 20 verificaciones listadas; sin scroll horizontal en 390 px (oscuro) y lista a la derecha en 1280 px (claro); servicio inexistente → "No encontrado"; gráfica visible en WebKit. Se corrigió la superposición de etiquetas del eje en móvil.
- Pendiente: revisión humana.
