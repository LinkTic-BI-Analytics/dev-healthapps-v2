---
type: feature
id: WI-021
title: Leer el cuerpo del /health y mostrar el estado de sus componentes
knowledge_level: K3
status: completed
phase: now
initiative: Verificación y estado de salud
domains:
  - Verificación de salud
code: []
created_at: 2026-10-05T00:00:00.000Z
source: roadmap
source_id: WI-CANDIDATE-021
source_initiative: RM-003
source_roadmap_initiative: RM-003
source_work_item_candidate: WI-CANDIDATE-021
source_title: Leer el cuerpo del /health y mostrar el estado de sus componentes
source_context: Materialized from roadmap candidate WI-CANDIDATE-021 under initiative RM-003.
source_initiative_title: Verificación y estado de salud
related_domain: Verificación de salud
related_capabilities:
  - Verificación periódica de salud
  - Evaluación del estado de salud
  - Verificación de componentes internos
expected_value: >-
  Detectar fallas internas (bases de datos, caché, dependencias) que el servicio
  reporta en el JSON de su /health aunque responda HTTP 200.
risks:
  - Falsos positivos por valores de estado no reconocidos.
  - Respuestas muy grandes o lentas de leer.
  - Crecimiento de la base si se guarda el cuerpo de cada verificación.
dependencies:
  - WI-010
  - WI-011
  - WI-013
source_signals:
  - >-
    Decisión del equipo (2026-10-05): leer el JSON del /health, que tiene
    estructura diferente en cada servicio, y mostrar sus componentes dentro de
    la tarjeta y del detalle del servicio.
  - >-
    Caso real: https://reporter-api.fidu.linktic.co/health responde 200 con 16
    bases de datos y el caché, cada uno con su status.
decision_candidates: []
summary: >-
  Hoy solo se evalúa el código HTTP y la latencia: un /health que responde 200
  pero reporta componentes caídos se ve como operativo.
refined_by: work-item-agent
ready_at: '2026-10-05'
started_at: '2026-10-05'
completed_at: '2026-10-05'
---

# Leer el cuerpo del /health y mostrar el estado de sus componentes

> Type: feature · Level: K3

## Source

- Source: roadmap
- Roadmap Initiative: RM-003 — Verificación y estado de salud
- Work Item Candidate: WI-CANDIDATE-021
- Related domain: Verificación de salud
- Related capabilities:
  - Verificación periódica de salud
  - Evaluación del estado de salud
  - Verificación de componentes internos

**Actor and outcome:** Equipo técnico: ve que un servicio está degradado o caído cuando su `/health` lo reporta en el JSON (p. ej. una base de datos `down`), aunque responda HTTP 200, y sabe qué componente falla.

**Current behavior:** El worker solo evalúa el código HTTP y el tiempo de respuesta; descarta el cuerpo. Un `/health` con `"status": "ok"` y una base de datos `"down"` se muestra como **operativo**.

**Target behavior:**
- El worker lee el cuerpo de la respuesta (máx. 256 KB) cuando es JSON y lo analiza **sin configuración**, sin importar la estructura:
  - Busca campos de estado (`status`, `state`, `health`, y booleanos `healthy`, `ok`, `up`).
  - Clasifica los valores sin distinguir mayúsculas: falla (`down`, `fail`, `failed`, `error`, `critical`, `ko`, `unhealthy`, `offline`, `unavailable`, `red`, `false`), advertencia (`warn`, `warning`, `degraded`, `partial`, `yellow`) y bien (`up`, `ok`, `pass`, `healthy`, `online`, `available`, `green`, `true`). Los valores no reconocidos se ignoran.
  - **Estado general** = el campo de estado de la raíz. **Componentes** = cada objeto anidado con campo de estado, nombrado por su identificador (`connection`, `name`, `id`, `key`, `component`) o por su clave. Compatible con el formato de reporter-api, NestJS Terminus (`info`/`error`/`details`), Spring Boot Actuator (`components`) y `application/health+json` (`pass`/`warn`/`fail`).
- Evaluación del estado:
  - Estado general en falla → la verificación es un **fallo** (cuenta para `caído`), con el motivo.
  - Estado general en advertencia, o algún componente en falla o advertencia → **degradado**, con el motivo (p. ej. "1 de 17 componentes con falla: seizure").
  - Cuerpo no JSON o sin campos de estado → se evalúa solo por HTTP y latencia (comportamiento actual).
- Se guarda el **último estado de los componentes** en el servicio (no en cada verificación). En las verificaciones con problema se guardan el motivo y un extracto del cuerpo (máx. 2 KB).
- UI:
  - **Tarjeta del panel:** línea "X de N componentes con falla: …" cuando hay problemas.
  - **Detalle:** sección "Componentes" agrupada (Bases de datos, Caché, …) con el estado de cada uno y el conteo de componentes bien y con falla; las verificaciones recientes muestran el motivo de degradación y el extracto del cuerpo.

**Entry points:** `src/features/checks/server/`, `src/features/health-status/server/evaluate.ts`, `prisma/schema.prisma`, `src/features/dashboard/`, `src/features/service-detail/`.

**End-to-end flow:** El worker consulta el `/health` → lee el JSON → detecta un componente `down` → registra la verificación con el motivo → el servicio pasa a **degradado** → el panel muestra "1 de 17 componentes con falla: seizure" → el detalle muestra la base `seizure` en rojo dentro de "Bases de datos".

**Problem:** Hoy solo se evalúa el código HTTP y la latencia: un /health que responde 200 pero reporta componentes caídos se ve como operativo.

**Expected result:** Las fallas internas reportadas en el JSON del `/health` cambian el estado del servicio y se ven por componente en la interfaz.

**Suggested Knowledge Level:** K3

**Impact analysis:**
- frontend: affected
- backend: affected
- database: affected
- configuration: reviewed-not-affected
- authentication: not-applicable
- notifications: not-applicable
- documentation: affected
- operations: affected

**Module coverage:** not-applicable (repositorio único).

**Scope unknowns:**
- Si algún servicio usa valores de estado que no estén en las listas.

**Scope confidence:** high — Formato real disponible y reglas sin configuración.

**Dependencies:**
- WI-010 (worker de verificaciones)
- WI-011 (evaluación del estado)
- WI-013 (detalle del servicio)

**Acceptance criteria:**
- [ ] Con el JSON real de reporter-api (todo `up`), el servicio queda **operativo** y el detalle lista sus 17 componentes (16 bases y el caché) en sus grupos.
- [ ] Si una base del JSON está `down` y el HTTP es 200, el servicio queda **degradado** con el motivo "1 de 17 componentes con falla: …".
- [ ] Si el `status` de la raíz indica falla (`down`, `error`, `fail`…), la verificación cuenta como fallo.
- [ ] Funciona con los formatos de NestJS Terminus, Spring Boot Actuator y `health+json`.
- [ ] Un cuerpo no JSON (p. ej. `OK`) o sin campos de estado se evalúa solo por HTTP y latencia.
- [ ] Solo se leen hasta 256 KB del cuerpo; el extracto guardado no supera 2 KB y solo se guarda en verificaciones con problema.
- [ ] Mobile-first: la sección de componentes se diseña primero para 390 px, sin scroll horizontal; en escritorio (≥ `md`) los componentes se reacomodan en varias columnas.
- [ ] Se ve correctamente en tema claro y en tema oscuro; el estado de cada componente se comunica con color **y** texto o icono accesible.
- [ ] E2E: un servicio de prueba que responde 200 con una base `down` aparece como degradado en el panel con el componente nombrado, y en el detalle la base aparece con falla.

**Out of scope:**
- Reglas configurables por servicio (p. ej. `queries.waiting < 10`).
- Historial y uptime por componente.
- Alertas por componente (WI-017).

**How to test it (validation):**
1. `pnpm test` → pruebas del analizador con los formatos de reporter-api, Terminus, Spring Boot, `health+json`, cuerpos no JSON y valores desconocidos; pruebas de la evaluación con componentes.
2. `pnpm test:integration` → una verificación contra un servidor local que responde 200 con una base `down` deja el servicio degradado y guarda los componentes.
3. Manual / E2E: panel y detalle en 390 px y 1280 px, en tema claro y oscuro.
4. `kaddo guard` no muestra drift inesperado.

**Definition of Done:**
- [ ] Criterios de aceptación cumplidos.
- [ ] Validación ejecutada y con éxito.
- [ ] `knowledge/tech/codebase.md` y `knowledge/product/capabilities.md` actualizados.
- [ ] `kaddo scan`, `kaddo owners suggest` y `kaddo guard` ejecutados sin drift inesperado.
- [ ] Revisión humana completada.

**Open questions:**
- [open] ¿Algún servicio usa valores de estado distintos a los de las listas?

**Suggested ownership (code globs):**
- `src/features/checks/server/**`
- `src/features/health-status/server/**`
- `src/features/service-detail/components/**`
- `src/features/dashboard/components/**`

**Related domain / capability:** Verificación de salud / Verificación periódica de salud, Evaluación del estado de salud, Verificación de componentes internos

**Related decisions:** ADR-004, ADR-005

## Implementation Notes

- `analyzeHealthBody()` (`src/features/checks/server/health-body.ts`, pura, sin configuración): estado general en la raíz (`status`/`state`/`health`, objetos `health` anidados y booleanos `healthy`/`ok`/`up`) y componentes anidados con estado, nombrados por `connection`/`name`/`componentId`/`id`/… o por su clave; valores de falla, advertencia y bien sin distinguir mayúsculas (los desconocidos se ignoran); caso especial de NestJS Terminus (solo `details`); máximo 200 componentes y 6 niveles. `describeComponentIssues()` → "1 de 17 componentes con falla: seizure".
- `performHttpCheck`: lee hasta 256 KB del cuerpo dentro del timeout; estado general en falla → fallo; 4xx/5xx incluye los componentes con falla en el motivo; componentes con falla o estado en advertencia con HTTP OK → éxito con `degradedReason`; cuerpo no JSON o truncado → solo HTTP y latencia. Extracto ≤ 2 KB solo en verificaciones con problema.
- `evaluateHealthStatus` con `bodyDegraded` → `degradado`. Migración `health_body_components`: `services.last_components` (JSONB, último estado; se limpia si el /health deja de reportarlos), `service_checks.degraded_reason` y `service_checks.body_excerpt`.
- UI: línea ámbar en la tarjeta del panel con los componentes en falla; sección "Componentes" en el detalle (conteo bien/con falla, grupos legibles —Bases de datos, Caché…—, los que fallan primero, icono con etiqueta accesible + color, 1/2/3 columnas según el ancho); las verificaciones recientes muestran el motivo y "Ver respuesta" con el extracto. El log del worker incluye el motivo de degradación.
- Validado: 17 pruebas unitarias nuevas (134 en total), incluido el **JSON real de reporter-api** (17 componentes) y los formatos de Terminus, Spring Boot Actuator y health+json; 2 de integración (39 en total). E2E: "Reporter API (prueba)" (copia local con `seizure` caída, HTTP 200) → **Degradado** con "1 de 17 componentes con falla: seizure" en el panel y `seizure` en rojo, primero, en el detalle; el servicio real ya registrado por el equipo (**"Api Reporteria Fidu"**, `https://reporter-api.fidu.linktic.co/health`) → Operativo con sus 17 componentes, también en WebKit; sin scroll horizontal en 390 y 1280 px.
- Pendiente: confirmar si algún servicio usa valores de estado fuera de las listas; revisión humana.
- **Corrección posterior (2026-10-05):** el servicio "Recaudo Local" (`http://localhost:3004/health`) no mostraba componentes porque el worker corre en Docker y ahí `localhost` es el propio contenedor ("Conexión rechazada"). Ahora `CHECK_LOCALHOST_ALIAS` traduce `localhost`/`127.0.0.1` al host configurado; `docker-compose.yml` lo define como `host.docker.internal` (con `extra_hosts: host-gateway` para Linux). La URL guardada no cambia. Además, cada componente guarda el motivo que reporta (`message`, `error`, `reason`…) y el detalle lo muestra bajo los componentes con falla; los componentes de la raíz se agrupan por su nombre (`db_main` → Bases de datos, `redis` → Caché, `rabbitmq` → Colas). Verificado: "Recaudo Local" (NestJS Terminus, HTTP 503) → Caído con "2 de 2 componentes con falla: db_main, cache" y el motivo "No se pudo conectar a la base de datos (ECONNREFUSED)". 139 pruebas unitarias y 41 de integración pasan.
