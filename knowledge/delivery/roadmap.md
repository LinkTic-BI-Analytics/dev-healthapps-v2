---
type: roadmap
id: roadmap
status: draft
updated_at: 2026-10-05
project_state: ai-assisted
generated_by: roadmap-agent
template_version: 1
knowledge_level: K3
refined_by: roadmap-agent
---

# salud-apps — Roadmap

> What we intend to build and why.

Generated with Kaddo Roadmap Agent. Initiatives and work items below are **candidates** for human review — not final commitments.

## Summary

Roadmap inicial de **Health Apps** (proyecto `new`), una **aplicación web mobile-first y responsive para escritorio**.

- **Fase 0 (RM-001):** configuración inicial del proyecto Next.js, **sin lógica de negocio**. Incluye estructura, pruebas, UI base con la línea gráfica, utilidades, PostgreSQL con Prisma y Docker.
- **Autenticación (RM-008):** usuarios con JWT y revocación de tokens, antes de exponer cualquier dato.
- **MVP (RM-002 a RM-004):** registrar servicios, verificarlos, evaluar su estado y mostrarlo en un panel.
- **Después:** historial, uptime y alertas. La ingesta de métricas enviadas por las propias aplicaciones queda para más adelante.

Fuentes: `knowledge/business/business.md`, `knowledge/product/product.md`, `knowledge/product/capabilities.md`, `knowledge/tech/codebase.md`, `resources/lineagrafica/`.

## Assumptions

Readiness gate: hay preguntas abiertas que afectan el alcance del MVP. El roadmap se generó con estos supuestos, **pendientes de confirmación humana**:

- [asumida] **A1:** Los servicios iniciales son aplicaciones internas con un endpoint HTTP que se puede verificar.
- [asumida] **A2:** En el MVP, las métricas se obtienen por **verificación activa (sondeo HTTP)**: estado, tiempo de respuesta y fallos. La cantidad y frecuencia de solicitudes y los errores internos (push) se difieren a RM-007.
- [asumida] **A3:** Los parámetros esperados (umbrales) se configuran por servicio, con valores por defecto.
- [resuelta] **A4 → D7:** El MVP **sí incluye autenticación**: usuarios con JWT y capacidad de invalidar tokens (RM-008). Login por email o username; sin reglas de contraseña por ahora; duración de los tokens configurable en `.env` (access token normalmente 60 min).
- [resuelta] **D8:** Roles `superadmin` (acceso total), `admin` (igual, con permisos revocables por usuario) y `nuevo` (sin permisos, asignado en el autorregistro). Superadmin y admin crean usuarios. El módulo de gestión de roles llega en el futuro.
- [diferida] **A5:** El canal de alertas se decide en el spike WI-CANDIDATE-016.
- [diferida] **A6:** La retención del historial y el mecanismo de ejecución periódica se deciden en el spike WI-CANDIDATE-009.

Decisiones del equipo (2026-10-05):

- [resuelta] **D1:** Persistencia en **PostgreSQL 18 con Prisma**. En local corre con Docker Compose; en producción, en una instancia aparte. Un único `Dockerfile` sirve para desarrollo y producción. La conexión se define con variables `DB_*` y el esquema es configurable (`DB_SCHEMA`: por defecto `public`; normalmente `health_extern`). Pendiente de formalizar en un ADR.
- [resuelta] **D2:** Estructura y convenciones según `knowledge/tech/codebase.md` (organización por features en `src/features/`, arquitectura en capas).
- [resuelta] **D3:** Librerías de UI: shadcn/Radix, `lucide-react`, `react-hot-toast` y Chart.js + `react-chartjs-2`.
- [resuelta] **D4:** Health Apps es una **aplicación web**, **mobile-first** y responsive para escritorio. El prototipo de la línea gráfica asume una app iOS; esa suposición queda reemplazada.
- [resuelta] **D5:** La línea gráfica (tokens de color, tipografía y radios) está en `resources/lineagrafica/`. Incluye **tema claro y tema oscuro**; hoy el archivo solo trae los valores del oscuro.
- [resuelta] **D6:** En escritorio el layout **cambia y se reacomoda** (navegación lateral y contenido en varias columnas); no solo se estira.

## Roadmap Principles

- Proyecto `new`: primero la configuración inicial, sin negocio, y luego las capacidades fundacionales del producto.
- Los Work Items deben ser pequeños y verificables, y cada uno debe dejar algo observable.
- Las decisiones técnicas abiertas se resuelven con spikes antes de construir sobre ellas.
- La confiabilidad del monitor tiene prioridad: no se deben reportar estados engañosos (BR-08).
- Toda pantalla se diseña primero para móvil (390 px) y se reacomoda en escritorio; debe verse bien en tema claro y oscuro.

## Initiatives

### RM-001: Configuración inicial del proyecto Next.js

**Status:** candidate

**Priority:** high

**Phase:** now

**Suggested Knowledge Level:** K2

**Related domain:** Plataforma

**Related capabilities:**
- Fundación técnica de la plataforma

**Source signals:**
- Capability Gap: No hay framework de pruebas configurado.
- Capability Gap: No hay persistencia configurada.
- Business Goal / Constraint: Presentación visual, clara y fácil de interpretar (línea gráfica).
- Decisiones del equipo: D1, D2, D3, D4, D5.

**Problem / opportunity:** El repositorio solo tiene el scaffold de create-next-app. Faltan la estructura, las pruebas, el sistema visual, las utilidades comunes, la base de datos y el entorno Docker.

**Expected value:** Un proyecto listo para construir funcionalidades de negocio sobre una base probada, consistente y reproducible.

**Impact:** High

**Risk:** Low

**Risks:** Configuraciones incompatibles con Next.js 16 / React 19; tokens que no respetan la línea gráfica.

**Dependencies:** Ninguna.

**Why now:** Todo el roadmap depende de esta base. Se mantiene **sin lógica de negocio** a propósito.

**Suggested Work Items:**
- WI-CANDIDATE-001: Estructura base del proyecto Next.js
  - type: chore
  - suggested knowledge level: K1
  - expected value: Proyecto limpio con la estructura y las convenciones de `codebase.md`.
  - notes: Carpetas `src/`, alias `@/*` → `src/*`, limpieza del scaffold, metadatos, `lang="es"`, script `typecheck`.
- WI-CANDIDATE-002: Configurar framework de pruebas con Vitest
  - type: chore
  - suggested knowledge level: K1
  - expected value: Validar cada Work Item con pruebas automatizadas.
  - notes: Playwright y Storybook pendientes de decisión.
- WI-CANDIDATE-003: Base de UI: línea gráfica con tema claro y oscuro, librerías y layout responsive
  - type: chore
  - suggested knowledge level: K2
  - expected value: Tokens de la línea gráfica en tema claro y oscuro, shadcn/Radix, lucide-react, react-hot-toast y un layout que se reacomoda en escritorio.
  - notes: Tokens de `resources/lineagrafica/` (faltan los valores del tema claro). Mobile-first (390 px); desde `md` cambia la estructura (barra lateral, varias columnas).
- WI-CANDIDATE-004: Utilidades compartidas: errores y cliente HTTP
  - type: chore
  - suggested knowledge level: K1
  - expected value: Manejo de errores y llamadas HTTP comunes a todas las features.
  - notes: `ApiError`, `parseHttpErrorResponse`, `apiFetch`.
- WI-CANDIDATE-005: Configurar PostgreSQL con Prisma
  - type: chore
  - suggested knowledge level: K2
  - expected value: Conexión a PostgreSQL con esquema configurable, sin modelos de negocio.
  - notes: D1. Variables `DB_*` en `.env.example` con `DB_SCHEMA=public` por defecto.
- WI-CANDIDATE-006: Dockerfile y Docker Compose para desarrollo y producción
  - type: chore
  - suggested knowledge level: K2
  - expected value: Entorno local con un solo comando e imagen de producción.
  - notes: D1. `Dockerfile` multi-stage (dev/prod); Compose con PostgreSQL 18 solo en local.

**Open questions:**
- [open] ¿Se incluyen Playwright y Storybook en esta fase?
- [open] ¿Dónde están los valores del tema claro? (bloquea el cierre de WI-CANDIDATE-003)

**Not now:** CI/CD y despliegue productivo.

---

### RM-002: Catálogo de servicios

**Status:** candidate

**Priority:** high

**Phase:** now

**Suggested Knowledge Level:** K2

**Related domain:** Catálogo de servicios

**Related capabilities:**
- Registro de servicios monitoreados
- Parámetros esperados por servicio

**Source signals:**
- Capability Gap: No existe forma de registrar servicios ni de verificarlos.
- Business Goal: Disponer de un único punto de consulta.
- Assumption: A1, A3.

**Problem / opportunity:** No hay un registro de qué servicios monitorear ni de qué se considera funcionamiento aceptable para cada uno.

**Expected value:** Servicios registrados con sus umbrales, que alimentan las verificaciones y la evaluación de estado.

**Impact:** High

**Risk:** Low

**Risks:** Umbrales por defecto poco realistas.

**Dependencies:** RM-001.

**Why now:** Sin servicios registrados no hay nada que verificar.

**Suggested Work Items:**
- WI-CANDIDATE-007: Registrar servicios a monitorear
  - type: feature
  - suggested knowledge level: K2
  - expected value: El equipo puede dar de alta, editar y desactivar servicios.
  - notes: Nombre, URL de verificación, descripción y estado activo/inactivo.
- WI-CANDIDATE-008: Configurar parámetros esperados por servicio
  - type: feature
  - suggested knowledge level: K2
  - expected value: Cada servicio tiene umbrales que definen operativo, degradado y fuera de servicio.
  - notes: BR-05. Valores por defecto (A3).
- WI-CANDIDATE-022: Eliminar servicios monitoreados
  - type: feature
  - suggested knowledge level: K2
  - expected value: Quitar del catálogo los servicios que ya no existen o se registraron por error.
  - notes: Pedido del equipo (2026-10-05). Con confirmación; borra en cascada verificaciones e historial.

**Open questions:**
- [open] ¿Cuáles son los servicios iniciales?

**Not now:** Descubrimiento automático de servicios.

---

### RM-003: Verificación y estado de salud

**Status:** candidate

**Priority:** high

**Phase:** now

**Suggested Knowledge Level:** K3

**Related domain:** Verificación de salud

**Related capabilities:**
- Verificación periódica de salud
- Evaluación del estado de salud
- Recolección de métricas de rendimiento

**Source signals:**
- Business Goal: Detectar tempranamente caídas, errores y degradación.
- Business rules: BR-01, BR-02, BR-05, BR-08.
- Assumption: A2. Deferred Decision: A6.

**Problem / opportunity:** No hay forma de saber automáticamente si un servicio está operativo, degradado o fuera de servicio.

**Expected value:** Cada servicio tiene un estado de salud actualizado y la hora de su última verificación.

**Impact:** High

**Risk:** Medium

**Risks:** Falsos positivos por fallas del propio monitor o de la red; verificaciones que se solapan.

**Dependencies:** RM-001, RM-002.

**Why now:** Es el núcleo del producto.

**Suggested Work Items:**
- WI-CANDIDATE-009: Spike de retención del historial y ejecución periódica de verificaciones
  - type: spike
  - suggested knowledge level: K2
  - expected value: ADR sobre el modelo y la retención del historial en PostgreSQL y sobre el scheduler.
  - notes: Resuelve A6.
- WI-CANDIDATE-010: Ejecutar verificaciones periódicas de salud
  - type: feature
  - suggested knowledge level: K3
  - expected value: Cada servicio activo se verifica periódicamente y se registran el resultado, el tiempo de respuesta y la hora.
  - notes: Usa el mecanismo decidido en WI-CANDIDATE-009.
- WI-CANDIDATE-011: Evaluar el estado de salud de cada servicio
  - type: feature
  - suggested knowledge level: K3
  - expected value: El estado se calcula según los parámetros esperados.
  - notes: BR-01, BR-05, BR-08.

- WI-CANDIDATE-021: Leer el cuerpo del /health y mostrar el estado de sus componentes
  - type: feature
  - suggested knowledge level: K3
  - expected value: Detectar fallas internas (bases de datos, caché) reportadas en el JSON del /health aunque responda HTTP 200.
  - notes: Decisión del equipo (2026-10-05). Análisis sin configuración de estructuras distintas; componentes visibles en la tarjeta y en el detalle.

**Open questions:**
- [open] ¿Con qué frecuencia se verifica cada servicio?

**Not now:** Verificaciones desde múltiples regiones.

---

### RM-004: Panel de monitoreo

**Status:** candidate

**Priority:** high

**Phase:** now

**Suggested Knowledge Level:** K2

**Related domain:** Visualización y monitoreo

**Related capabilities:**
- Panel general de monitoreo
- Detalle de servicio

**Source signals:**
- Business Goal: Disponer de un único punto de consulta.
- Constraint: Presentación visual, clara y fácil de interpretar.
- Decisiones del equipo: D3 (Chart.js), D4 (mobile-first), D5 (línea gráfica).

**Problem / opportunity:** El equipo necesita ver el estado del ecosistema de un vistazo, también desde el móvil durante un incidente.

**Expected value:** Panel con tarjetas por servicio y una vista de detalle con métricas y gráficas, usables en móvil y en escritorio.

**Impact:** High

**Risk:** Low

**Risks:** Saturación visual si crece el número de servicios.

**Dependencies:** RM-003.

**Why now:** Cierra el primer ciclo de valor visible del MVP.

**Suggested Work Items:**
- WI-CANDIDATE-012: Panel general con estado de servicios
  - type: feature
  - suggested knowledge level: K2
  - expected value: Tarjetas por servicio con estado, última verificación e indicadores globales.
  - notes: Reemplaza el placeholder de `/`. Mobile-first.
- WI-CANDIDATE-013: Detalle de servicio con métricas y gráficas
  - type: feature
  - suggested knowledge level: K2
  - expected value: Tiempos de respuesta, fallos y resultados recientes en gráficas.
  - notes: Chart.js + `react-chartjs-2` (D3).
- WI-CANDIDATE-023: Ayuda contextual con botón de ayuda y UI sin textos explicativos
  - type: feature
  - suggested knowledge level: K2
  - expected value: Interfaz más limpia con explicaciones completas bajo demanda.
  - notes: Pedido del equipo (2026-10-05).
- WI-CANDIDATE-024: Panel interactivo con animaciones
  - type: feature
  - suggested knowledge level: K2
  - expected value: Panel más vivo cuyas animaciones comunican cambios y recuperaciones.
  - notes: Pedido del equipo (2026-10-05). Respeta "reducir movimiento".

**Open questions:**
- [open] ¿La vista debe actualizarse automáticamente?

**Not now:** Paneles personalizables por usuario.

---

### RM-005: Historial y uptime

**Status:** candidate

**Priority:** medium

**Phase:** next

**Suggested Knowledge Level:** K2

**Related domain:** Métricas e historial

**Related capabilities:**
- Historial de estados
- Cálculo de uptime

**Source signals:**
- Business Goal: Conservar un historial del estado de los servicios.
- Business rules: BR-06, BR-07.

**Problem / opportunity:** Sin historial no se puede evaluar la disponibilidad en el tiempo.

**Expected value:** Historial de cambios de estado y uptime por período.

**Impact:** Medium

**Risk:** Low

**Risks:** Crecimiento del volumen de datos sin política de retención.

**Dependencies:** RM-003; retención decidida en WI-CANDIDATE-009.

**Why now:** Llega después del MVP de estado actual y reutiliza los resultados de verificación.

**Suggested Work Items:**
- WI-CANDIDATE-014: Registrar historial de cambios de estado
  - type: feature
  - suggested knowledge level: K2
  - expected value: Cada cambio de estado queda registrado y se puede consultar.
  - notes: BR-06.
- WI-CANDIDATE-015: Calcular y mostrar uptime por período
  - type: feature
  - suggested knowledge level: K2
  - expected value: Uptime por servicio en 24 h, 7 días y 30 días.
  - notes: BR-07. Los períodos son un supuesto.

**Open questions:**
- [open] ¿Existen SLA/SLO acordados para comparar el uptime?

**Not now:** Reportes exportables.

---

### RM-006: Alertas

**Status:** candidate

**Priority:** medium

**Phase:** next

**Suggested Knowledge Level:** K3

**Related domain:** Alertas

**Related capabilities:**
- Generación y notificación de alertas

**Source signals:**
- Business Goal: Reducir el tiempo de reacción ante incidentes.
- Business rules: BR-03, BR-04.
- Deferred Decision: A5.

**Problem / opportunity:** El equipo debe enterarse de un incidente sin tener que mirar el panel.

**Expected value:** Alertas oportunas ante caídas, errores y degradación.

**Impact:** High

**Risk:** Medium

**Risks:** Fatiga por alertas (alertas repetidas o falsos positivos).

**Dependencies:** RM-003.

**Why now:** Requiere estados confiables (RM-003) y una decisión de canal.

**Suggested Work Items:**
- WI-CANDIDATE-016: Spike de canales de alerta
  - type: spike
  - suggested knowledge level: K1
  - expected value: Decisión sobre canal(es) y destinatarios de las alertas.
  - notes: Resuelve A5.
- WI-CANDIDATE-017: Generar y notificar alertas por cambio de estado
  - type: feature
  - suggested knowledge level: K3
  - expected value: Se notifica cuando un servicio pasa a degradado o fuera de servicio, y cuando se recupera.
  - notes: BR-03, BR-04. Evitar alertas duplicadas.

**Open questions:**
- [open] ¿Por qué canales y a quién se envían las alertas?

**Not now:** Escalamiento y guardias (on-call).

---

### RM-007: Métricas de operación reportadas por las aplicaciones

**Status:** candidate

**Priority:** low

**Phase:** later

**Suggested Knowledge Level:** K3

**Related domain:** Métricas e historial

**Related capabilities:**
- Ingesta de métricas de operación reportadas por las aplicaciones

**Source signals:**
- Open Question: ¿Las aplicaciones enviarán métricas (push) o se obtendrán de otra fuente?
- Assumption: A2 (diferido del MVP).

**Problem / opportunity:** La cantidad y frecuencia de solicitudes y los errores internos no se pueden obtener por sondeo.

**Expected value:** Visión completa del rendimiento y de los errores de cada aplicación.

**Impact:** Medium

**Risk:** High

**Risks:** Requiere cambios en cada aplicación monitoreada; el contrato de integración está por definir.

**Dependencies:** RM-001, RM-004.

**Why now:** No es ahora: depende de un acuerdo con las aplicaciones monitoreadas.

**Suggested Work Items:**
- WI-CANDIDATE-018: Recibir métricas de solicitudes y errores enviadas por las aplicaciones
  - type: feature
  - suggested knowledge level: K3
  - expected value: Mostrar la cantidad y frecuencia de solicitudes y los errores por servicio.
  - notes: Probablemente requiera un spike previo sobre el contrato de integración.

**Open questions:**
- [open] ¿Qué formato y mecanismo de envío usarán las aplicaciones?

**Not now:** Trazas distribuidas y análisis de logs.

---

### RM-008: Autenticación y usuarios

**Status:** candidate

**Priority:** high

**Phase:** now

**Suggested Knowledge Level:** K3

**Related domain:** Identidad y acceso

**Related capabilities:**
- Autenticación de usuarios
- Gestión de sesiones y revocación de tokens
- Roles y permisos

**Source signals:**
- Decisión del equipo (2026-10-05): autenticación JWT con capacidad de invalidar tokens (D7).
- Decisión del equipo (2026-10-05): roles superadmin, admin y nuevo (D8).
- Business Open Question: ¿Se requiere autenticación?

**Problem / opportunity:** Sin autenticación, cualquiera con acceso a la red ve y modifica la información.

**Expected value:** Solo usuarios autenticados acceden; cualquier token se puede invalidar de inmediato.

**Impact:** High

**Risk:** Medium

**Risks:** Manejo inseguro de contraseñas o tokens; fuerza bruta; enumeración de usuarios.

**Dependencies:** RM-001 (WI-CANDIDATE-003, 004, 005).

**Why now:** Debe existir antes de que las pantallas de negocio expongan datos.

**Suggested Work Items:**
- WI-CANDIDATE-019: Autenticación JWT con revocación de tokens, usuarios, roles y permisos (backend)
  - type: feature
  - suggested knowledge level: K3
  - expected value: Login por email o username, autorregistro, creación de usuarios, permisos efectivos y tokens revocables.
  - notes: Tablas `roles`, `permissions`, `role_permissions`, `users`, `user_revoked_permissions` y `user_sessions`; `JWT_ACCESS_TTL_MINUTES` y `REFRESH_TOKEN_TTL_MINUTES` en `.env`.
- WI-CANDIDATE-020: Pantallas de login, registro y creación de usuarios, y protección de rutas
  - type: feature
  - suggested knowledge level: K2
  - expected value: Flujos de autenticación en la web (mobile-first, tema claro y oscuro) y rutas privadas protegidas.
  - notes: `proxy.ts` (Next.js 16) más la validación de permisos en el servidor.

**Open questions:**
- [open] ¿Se requiere límite de intentos de login?
- [asumida] El refresh token dura 7 días por defecto; un admin no puede crear superadmins; la revocación de permisos del admin es por usuario.

**Not now:** Módulo de gestión de roles y permisos, cambio de rol de usuarios existentes, recuperación de contraseña, reglas de contraseña, MFA, SSO.

---

## Suggested Execution Order

1. **Fase 0, configuración inicial (sin negocio):** WI-CANDIDATE-001 → 002 → {003, 004, 005 en paralelo} → 006
2. WI-CANDIDATE-019 → 020 (autenticación)
3. WI-CANDIDATE-007 → 008 (catálogo)
4. WI-CANDIDATE-009 → 010 → 011 (verificación y estado)
5. WI-CANDIDATE-012 → 013 (panel) — **fin del MVP**
6. WI-CANDIDATE-014 → 015 (historial y uptime)
7. WI-CANDIDATE-016 → 017 (alertas); el spike 016 puede hacerse en paralelo desde el paso 4
8. WI-CANDIDATE-018 (later)

## Risks and Constraints

- Los supuestos A1 a A3 no están confirmados; si cambian, se debe revisar el alcance de RM-002 a RM-004.
- Equipo pequeño: el alcance del MVP se limita a RM-001 hasta RM-004 más RM-008.
- Posibles datos sensibles del dominio salud: por confirmar antes de almacenar las respuestas de los servicios.
- Mobile-first: cada pantalla debe validarse en 390 px antes que en escritorio.

## Not Now

- Módulo de gestión de roles y permisos; recuperación de contraseña; reglas de contraseña; MFA y SSO.
- Remediación automática de incidentes.
- Gestión de incidentes (tickets, guardias, post-mortems).
- APM completo, trazas distribuidas y análisis de logs.
- Monitoreo de infraestructura de bajo nivel (CPU, memoria, disco).
- CI/CD y despliegue productivo.
- Aplicación móvil nativa (Health Apps es una web).

## Next Recommended Work Item

**WI-CANDIDATE-001: Estructura base del proyecto Next.js** (chore, K1). Es el primer paso de la configuración inicial y no tiene dependencias.
