---
type: feature
id: WI-024
title: Panel interactivo con animaciones
knowledge_level: K2
status: completed
phase: now
initiative: Panel de monitoreo
domains:
  - Visualización y monitoreo
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-024
source_initiative: RM-004
source_roadmap_initiative: RM-004
source_work_item_candidate: WI-CANDIDATE-024
source_title: Panel interactivo con animaciones
source_context: Materialized from roadmap candidate WI-CANDIDATE-024 under initiative RM-004.
source_initiative_title: Panel de monitoreo
related_domain: Visualización y monitoreo
related_capabilities:
  - Panel general de monitoreo
expected_value: >-
  Un panel más vivo y agradable de usar, cuyas animaciones además comunican
  cambios de estado.
risks:
  - Animaciones que distraen o marean (accesibilidad).
  - Más peso de JavaScript en el panel.
dependencies:
  - WI-012
  - WI-015
source_signals:
  - >-
    Pedido del equipo (2026-10-05): hacer el panel más interactivo con
    animaciones para que el usuario se sienta contento.
decision_candidates: []
summary: >-
  El panel es estático: los cambios de estado entre actualizaciones pasan
  desapercibidos y la experiencia es plana.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Panel interactivo con animaciones

> Type: feature · Level: K2

## Source

- Source: roadmap
- Roadmap Initiative: RM-004 — Panel de monitoreo
- Work Item Candidate: WI-CANDIDATE-024
- Related domain: Visualización y monitoreo
- Related capabilities:
  - Panel general de monitoreo

**Actor and outcome:** Equipo técnico: disfruta usar el panel y nota de inmediato cuándo un servicio cambia de estado o se recupera.

**Current behavior:** El panel es estático; al actualizarse cada 30 s los cambios aparecen sin ninguna señal.

**Target behavior:**
- Entrada: tarjetas en cascada; barra de distribución que se dibuja; conteos y uptime que cuentan hasta su valor; mini gráficas que se dibujan.
- Interacción: tarjetas que se elevan al pasar el cursor y se hunden al tocarlas; indicador del filtro activo que se desliza; tarjetas que se reacomodan con animación al filtrar o al cambiar el orden.
- Estado: el punto de estado de los servicios caídos o degradados late.
- Cambios entre actualizaciones: la tarjeta que cambió de estado se resalta unos segundos con la etiqueta "Cambió"; si se recuperó (a operativo) muestra "Recuperado", lanza confeti y un aviso "🎉 <servicio> se recuperó".
- Todo en orden: si todos están operativos, el resumen muestra un check animado y "¡Todo en orden!".
- Accesibilidad: con "reducir movimiento" activado en el sistema no hay animaciones ni confeti; la información es la misma.

**Entry points:** `src/features/dashboard/components/`, `src/features/dashboard/hooks/useDashboard.ts`.

**End-to-end flow:** El usuario abre el panel → las tarjetas entran en cascada y los números cuentan → un servicio caído se recupera → en la siguiente actualización su tarjeta se ilumina con "Recuperado" y aparece confeti.

**Problem:** El panel es estático: los cambios de estado entre actualizaciones pasan desapercibidos y la experiencia es plana.

**Expected result:** Un panel animado, agradable y que señala los cambios, sin perder accesibilidad.

**Suggested Knowledge Level:** K2

**Impact analysis:**
- frontend: affected
- backend: not-applicable
- database: not-applicable
- configuration: not-applicable
- authentication: not-applicable
- notifications: reviewed-not-affected
- documentation: affected (ayuda del panel)
- operations: not-applicable

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:** Ninguno.

**Scope confidence:** high — Cambio de interfaz acotado al panel.

**Dependencies:** WI-012, WI-015

**Acceptance criteria:**
- [ ] Animaciones de entrada, interacción y estado descritas arriba, en móvil y escritorio, tema claro y oscuro.
- [ ] Una tarjeta cuyo estado cambió entre dos actualizaciones se resalta y muestra "Cambió" o "Recuperado"; una recuperación lanza confeti y un aviso.
- [ ] Con todos los servicios operativos, el resumen muestra "¡Todo en orden!".
- [ ] Con `prefers-reduced-motion: reduce` no hay animaciones ni confeti y los datos se muestran igual.
- [ ] Sin scroll horizontal en 320–1440 px.
- [ ] La ayuda del panel explica los resaltados y la celebración.

**Out of scope:**
- Sonidos.
- Animaciones en otras pantallas.

**How to test it (validation):**
1. `pnpm test` → detección de cambios de estado entre actualizaciones; "¡Todo en orden!"; sin animación con movimiento reducido.
2. E2E: forzar la caída y recuperación de un servicio de prueba y ver el resaltado y la celebración; capturas en 390 y 1280 px.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] Revisión humana completada.

**Open questions:** Ninguna.

**Suggested ownership (code globs):**
- `src/features/dashboard/**`

**Related domain / capability:** Visualización y monitoreo / Panel general de monitoreo

**Related decisions:** Ninguna.

## Implementation Notes

- Librerías: `motion` 14 (animaciones, `AnimatePresence`, `layoutId`, `MotionConfig`) y `canvas-confetti` (importado de forma diferida solo al celebrar).
- Entrada: tarjetas en cascada (`motion.li` con retraso por índice); resumen que aparece; barra de distribución que se dibuja por segmentos; conteos y uptime que cuentan hasta su valor (`AnimatedNumber`, que también anima los cambios entre actualizaciones); mini gráficas que se dibujan (`pathLength`); esqueletos animados mientras carga.
- Interacción: tarjetas que se elevan al pasar el cursor (`whileHover`) y se hunden al tocarlas (`whileTap`), sombra y chevron que se desplaza; pastilla del filtro activo que se desliza entre botones (`layoutId`); tarjetas que se reacomodan y salen con animación al filtrar o reordenar (`layout` + `AnimatePresence popLayout`); botón de actualizar que gira mientras carga.
- Estado: pulso (`motion-safe:animate-ping`) en los servicios caídos o degradados y en el punto del resumen; transición de color del resumen y de la franja.
- Cambios entre actualizaciones: `diffStatuses()` (pura, con prueba) detecta los cambios; la tarjeta se ilumina y muestra "Cambió" o "Recuperado" durante 8 s; una recuperación lanza confeti y el aviso "🎉 <servicio> se recuperó" (una vez por recuperación). Con todos operativos, el resumen muestra un check animado y "¡Todo en orden!".
- Accesibilidad: con `prefers-reduced-motion: reduce` no hay animaciones de entrada, cuentas, pulsos ni confeti; todo se muestra directamente en su estado final (`useReducedMotion` + `initial={false}`, `MotionConfig reducedMotion="user"`, `motion-safe:`).
- Ayuda del panel: nueva sección "Cambios de estado" (resaltados, celebración y reducir movimiento).
- Validado: 3 pruebas nuevas (144 unitarias en total): detección de cambios, "¡Todo en orden!", resaltado "Recuperado"/"Cambió" y aviso de recuperación; 41 de integración. E2E en vivo con el worker: caída → "Cambió"; recuperación → "Recuperado", confeti y aviso; el resaltado se apaga a los 8 s; con movimiento reducido la primera tarjeta tiene opacidad 1 y la barra su ancho final a los 50 ms (sin preferencia: opacidad 0,29 y ancho 0 %, es decir, animando); sin scroll horizontal en 390 y 1280 px. `typecheck`, `lint` y `build` pasan.
- Pendiente: revisión humana.
