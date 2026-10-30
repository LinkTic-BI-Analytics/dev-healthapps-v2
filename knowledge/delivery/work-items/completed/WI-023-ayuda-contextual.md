---
type: feature
id: WI-023
title: Ayuda contextual con botón de ayuda y UI sin textos explicativos
knowledge_level: K2
status: completed
phase: now
initiative: Panel de monitoreo
domains:
  - Visualización y monitoreo
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-023
source_initiative: RM-004
source_roadmap_initiative: RM-004
source_work_item_candidate: WI-CANDIDATE-023
source_title: Ayuda contextual con botón de ayuda y UI sin textos explicativos
source_context: Materialized from roadmap candidate WI-CANDIDATE-023 under initiative RM-004.
source_initiative_title: Panel de monitoreo
related_domain: Visualización y monitoreo
related_capabilities:
  - Panel general de monitoreo
  - Detalle de servicio
expected_value: >-
  Interfaz más limpia y, a la vez, explicaciones completas disponibles bajo
  demanda en cada pantalla.
risks:
  - 'La ayuda se desactualiza si cambian las reglas (umbrales, estados).'
dependencies:
  - WI-012
  - WI-013
  - WI-021
source_signals:
  - >-
    Pedido del equipo (2026-10-05): ícono de ayuda que abra un popup bien
    explicativo solo al hacer clic; el resto de la UI más limpia, sin mucho
    texto.
decision_candidates: []
summary: >-
  Las pantallas mezclan textos explicativos con los datos; la explicación
  completa debe estar solo en la ayuda.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Ayuda contextual con botón de ayuda y UI sin textos explicativos

> Type: feature · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-004 — Panel de monitoreo
- Work Item Candidate: WI-CANDIDATE-023
- Related domain: Visualización y monitoreo
- Related capabilities:
  - Panel general de monitoreo
  - Detalle de servicio

**Actor and outcome:** Usuario de Health Apps: ve pantallas limpias y, cuando lo necesita, pulsa el botón de ayuda para entender en detalle qué significa cada elemento y cómo se calcula.

**Current behavior:** Varias pantallas muestran subtítulos y notas explicativas (p. ej. "Definen cuándo el servicio está operativo…", "Línea discontinua roja: umbral…").

**Target behavior:**
- Botón de ayuda (icono "?") en el encabezado de: Panel, Servicios, Registrar/Editar servicio, Detalle del servicio, Crear usuario y Alertas.
- Al hacer clic se abre una ventana de ayuda (diálogo) con explicaciones completas y organizadas por secciones, ejemplos visuales de los estados y cómo se calcula cada dato. Solo se abre al hacer clic; se cierra con el botón, la tecla Escape o tocando fuera.
- Se retiran de la interfaz los subtítulos y notas explicativas; quedan solo títulos, etiquetas de campo y datos. Los mensajes de error y estados vacíos se mantienen (son retroalimentación, no explicación).

**Entry points:** `src/features/help/`, encabezados de `app/(app)/**`, `src/features/*/components`.

**End-to-end flow:** El usuario abre el panel → ve los datos sin texto explicativo → pulsa "?" → lee qué significa cada estado y cada dato de la tarjeta → cierra la ayuda.

**Problem:** Las pantallas mezclan textos explicativos con los datos; la explicación completa debe estar solo en la ayuda.

**Expected result:** Pantallas más limpias y una ayuda completa por pantalla, accesible con un clic.

**Suggested Knowledge Level:** K2

**Impact analysis:**
- frontend: affected
- backend: not-applicable
- database: not-applicable
- configuration: not-applicable
- authentication: not-applicable
- notifications: not-applicable
- documentation: affected
- operations: not-applicable

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:** Ninguno.

**Scope confidence:** high — Cambio de interfaz acotado.

**Dependencies:**
- WI-012, WI-013, WI-021

**Acceptance criteria:**
- [ ] Cada pantalla listada tiene un botón de ayuda accesible ("Ayuda: <pantalla>") de al menos 44 px en móvil.
- [ ] La ayuda solo se abre al hacer clic y explica, como mínimo: estados de salud y sus reglas, datos de la tarjeta, uptime, gráfica, componentes del /health, historial, verificaciones (éxito/fallo/omitida), campos del formulario de servicio, activar/desactivar/eliminar y roles.
- [ ] La ayuda se puede leer completa en 390 px (desplazamiento interno) y en escritorio, en tema claro y oscuro.
- [ ] Se eliminan de la interfaz los subtítulos y notas explicativas; los errores y estados vacíos se mantienen.
- [ ] E2E: abrir y cerrar la ayuda del panel y del detalle en móvil y escritorio.

**Out of scope:**
- Tours guiados o ayuda paso a paso.
- Traducciones a otros idiomas.

**How to test it (validation):**
1. `pnpm test` → el botón abre la ayuda con su contenido y se cierra con Escape.
2. E2E en 390 y 1280 px, tema claro y oscuro.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] `knowledge/tech/codebase.md` actualizado (convención: las explicaciones van en la ayuda).
- [ ] Revisión humana completada.

**Open questions:** Ninguna.

**Suggested ownership (code globs):**
- `src/features/help/**`

**Related domain / capability:** Visualización y monitoreo / Panel general de monitoreo, Detalle de servicio

**Related decisions:** Ninguna.

## Implementation Notes

- `HelpButton` (`src/features/help/components/`, shadcn `dialog`): botón "?" (44 px en móvil, etiqueta accesible "Ayuda: <pantalla>") que abre la ayuda **solo al hacer clic**; se cierra con ✕, Escape o tocando fuera; contenido desplazable dentro del diálogo (`max-h-[85dvh]`). Piezas reutilizables: `HelpSection`, `HelpTerms`, `HealthStatesHelp` (estados con su pastilla real y sus reglas) y `HealthBodyHelp` (lectura del JSON del /health).
- Ayuda por pantalla (`src/features/help/content/`): Panel (estados, resumen, tarjeta, uptime, componentes con falla, filtros, actualización cada 30 s), Servicios (activar/desactivar vs eliminar, permisos), Configurar un servicio (cada campo con ejemplos, valores por defecto y cómo se decide el estado, localhost en Docker, formatos de /health), Detalle (métricas, cálculo del uptime con ejemplo 95,83 %, gráfica, componentes, historial, verificaciones éxito/fallo/omitida, retenciones), Crear usuario (roles y quién crea qué) y Alertas (próximamente).
- UI más limpia: se quitaron subtítulos y notas explicativas de Servicios, Registrar servicio, Crear usuario, Alertas, el login, el formulario de servicio ("Definen cuándo…" y la frase dinámica de umbrales), la nota bajo la gráfica, "(tiempo en estado operativo)" y las descripciones de los estados vacíos. Se mantienen errores, estados vacíos y el aviso del registro sobre los permisos.
- Validado: 2 pruebas nuevas (141 unitarias en total): la ayuda no está abierta hasta el clic, se cierra con Escape y cubre los temas. Revisado en la app del equipo (puerto 3000): botón de 44 px y ayuda desplazable en 390 px (oscuro); ayuda del detalle en 1280 px (claro); listado sin subtítulo. `typecheck`, `lint` y `build` pasan.
- Pendiente: revisión humana del contenido de la ayuda.
