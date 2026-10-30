---
type: capabilities
project_state: ai-assisted
generated_by: kaddo-bootstrap
template_version: 1
refined_by: capability-agent
---

> Idioma del proyecto: **español**. Escribe este conocimiento en español. Mantén en inglés el código, los nombres de archivo, los comandos y las claves de configuración.

# Capabilities

Modo: **Planned Capability Definition** (proyecto `new`). Las capacidades son `[planned]`: aún no existe código de producción, solo el scaffold de Next.js en `app/`. Fuente: `knowledge/business/business.md` y `knowledge/product/product.md`.

## Planned capabilities

- [planned] Registro de servicios monitoreados
- [planned] Parámetros esperados por servicio
- [planned] Verificación periódica de salud
- [planned] Evaluación del estado de salud
- [planned] Recolección de métricas de rendimiento
- [planned] Historial de estados
- [planned] Cálculo de uptime
- [planned] Panel general de monitoreo
- [planned] Detalle de servicio
- [planned] Generación y notificación de alertas
- [planned] Ingesta de métricas de operación reportadas por las aplicaciones
- [planned] Fundación técnica de la plataforma
- [planned] Autenticación de usuarios
- [planned] Gestión de sesiones y revocación de tokens
- [planned] Roles y permisos

## Capability Domains

### Domain: Catálogo de servicios

**Purpose:** Mantener qué aplicaciones y servicios se monitorean, cómo se verifican y cuáles son sus parámetros esperados.

#### Capability: Registro de servicios monitoreados

- Status: planned
- Capability type: product
- User-facing: internal
- Evidence: - pending validation
- Current behavior: no existe.
- Open questions:
  - [open] ¿Cuáles son los servicios iniciales a monitorear?

#### Capability: Parámetros esperados por servicio

- Status: planned
- Capability type: business
- User-facing: internal
- Evidence: - pending validation
- Known constraints: soporta BR-05.
- Open questions:
  - [open] ¿Qué valores concretos definen "degradado" y "fuera de servicio"?

### Domain: Verificación de salud

**Purpose:** Comprobar periódicamente cada servicio y determinar su estado de salud.

#### Capability: Verificación periódica de salud

- Status: planned
- Capability type: technical
- User-facing: no
- Evidence: - pending validation
- Known constraints: soporta BR-02 (última verificación).
- Open questions:
  - [open] ¿Con qué frecuencia se verifica cada servicio?
  - [open] ¿Cómo se ejecutan las verificaciones periódicas (cron, worker, servicio externo)?

#### Capability: Verificación de componentes internos

- Status: implemented
- Evidence:
  - `src/features/checks/server/health-body.ts`
  - `src/features/service-detail/components/ComponentsList.tsx`
- Implemented in: WI-021
- Capability type: technical
- User-facing: yes
- Evidence: - pending validation
- Known constraints: cada `/health` devuelve un JSON con estructura diferente; se analiza sin configuración (WI-021).

#### Capability: Evaluación del estado de salud

- Status: planned
- Capability type: business
- User-facing: yes
- Evidence: - pending validation
- Known constraints: soporta BR-01, BR-05 y BR-08.

### Domain: Métricas e historial

**Purpose:** Registrar métricas y cambios de estado para consultar el rendimiento y la disponibilidad en el tiempo.

#### Capability: Recolección de métricas de rendimiento

- Status: planned
- Capability type: technical
- User-facing: no
- Evidence: - pending validation
- Current behavior: no existe. Incluye tiempos de respuesta y fallos observados en las verificaciones.

#### Capability: Historial de estados

- Status: planned
- Capability type: product
- User-facing: yes
- Evidence: - pending validation
- Known constraints: soporta BR-06.
- Open questions:
  - [open] ¿Cuánto tiempo se conserva el historial?

#### Capability: Cálculo de uptime

- Status: planned
- Capability type: business
- User-facing: yes
- Evidence: - pending validation
- Known constraints: soporta BR-07.

#### Capability: Ingesta de métricas de operación reportadas por las aplicaciones

- Status: planned
- Capability type: integration
- User-facing: no
- Evidence: - pending validation
- Current behavior: no existe. Cubre cantidad y frecuencia de solicitudes y errores internos, que no se obtienen por sondeo.
- Open questions:
  - [open] ¿Las aplicaciones enviarán métricas (push) o se obtendrán de otra fuente?

### Domain: Visualización y monitoreo

**Purpose:** Presentar el estado del ecosistema de forma visual, clara y fácil de interpretar.

#### Capability: Panel general de monitoreo

- Status: planned
- Capability type: product
- User-facing: yes
- Evidence: - pending validation (hoy `app/page.tsx` es el scaffold por defecto)

#### Capability: Detalle de servicio

- Status: planned
- Capability type: product
- User-facing: yes
- Evidence: - pending validation
- Open questions:
  - [open] ¿Qué librería de gráficas se usará?

### Domain: Alertas

**Purpose:** Avisar al equipo técnico ante caídas, errores o degradación.

#### Capability: Generación y notificación de alertas

- Status: planned
- Capability type: product
- User-facing: yes
- Evidence: - pending validation
- Known constraints: soporta BR-03 y BR-04.
- Open questions:
  - [open] ¿Por qué canales y a quién se envían las alertas?

### Domain: Identidad y acceso

**Purpose:** Garantizar que solo usuarios autenticados accedan a Health Apps y permitir invalidar su acceso en cualquier momento.

#### Capability: Autenticación de usuarios

- Status: planned
- Capability type: technical
- User-facing: yes
- Evidence: - pending validation
- Known constraints: JWT; login por email o username; autorregistro con el rol `nuevo`; tabla `users` con id uuid, email, username, hash de contraseña y timestamps.

#### Capability: Gestión de sesiones y revocación de tokens

- Status: planned
- Capability type: technical
- User-facing: yes
- Evidence: - pending validation
- Known constraints: los tokens JWT deben poder invalidarse (cerrar sesión, cerrar sesión en todos los dispositivos). Duración configurable en `.env`.

#### Capability: Roles y permisos

- Status: planned
- Capability type: business
- User-facing: yes
- Evidence: - pending validation
- Known constraints: `superadmin` (acceso total), `admin` (igual que superadmin, con permisos revocables), `nuevo` (sin permisos). El módulo de gestión de roles es futuro.

### Domain: Plataforma

**Purpose:** Base técnica sobre la que se construyen los demás dominios.

#### Capability: Fundación técnica de la plataforma

- Status: planned
- Capability type: technical
- User-facing: no
- Evidence:
  - `app/layout.tsx`, `app/page.tsx` (scaffold Next.js 16)
  - `package.json` (sin framework de pruebas)
- Open questions:
  - [open] ¿Dónde se almacenan métricas e historial?
  - [open] ¿Se requiere autenticación para acceder al panel?

## Capability Gaps

- [gap] No hay framework de pruebas configurado.
  - Domain: Plataforma
  - Related capability: Fundación técnica de la plataforma
  - Impact: medium
  - Possible roadmap candidate: yes
- [gap] No hay decisión sobre persistencia ni sobre la ejecución periódica de verificaciones.
  - Domain: Plataforma
  - Related capability: Fundación técnica de la plataforma
  - Impact: high
  - Possible roadmap candidate: yes
- [gap] No existe forma de registrar servicios ni de verificarlos.
  - Domain: Verificación de salud
  - Related capability: Verificación periódica de salud
  - Impact: high
  - Possible roadmap candidate: yes

## Roadmap Candidate Signals

- [candidate] Autenticación de usuarios con JWT y revocación de tokens.
  - Domain: Identidad y acceso
  - Related capability: Autenticación de usuarios
  - Based on: business goal

- [candidate] Establecer la fundación técnica (pruebas, persistencia, ejecución periódica).
  - Domain: Plataforma
  - Related capability: Fundación técnica de la plataforma
  - Based on: gap
- [candidate] Registrar servicios y sus parámetros esperados.
  - Domain: Catálogo de servicios
  - Related capability: Registro de servicios monitoreados
  - Based on: business goal
- [candidate] Verificar servicios y evaluar su estado de salud.
  - Domain: Verificación de salud
  - Related capability: Evaluación del estado de salud
  - Based on: business goal
- [candidate] Panel visual del ecosistema y detalle por servicio.
  - Domain: Visualización y monitoreo
  - Related capability: Panel general de monitoreo
  - Based on: business goal
- [candidate] Historial de estados y uptime.
  - Domain: Métricas e historial
  - Related capability: Historial de estados
  - Based on: business goal
- [candidate] Alertas ante caídas, errores y degradación.
  - Domain: Alertas
  - Related capability: Generación y notificación de alertas
  - Based on: business goal
- [candidate] Ingesta de métricas de solicitudes y errores enviadas por las aplicaciones.
  - Domain: Métricas e historial
  - Related capability: Ingesta de métricas de operación reportadas por las aplicaciones
  - Based on: open question

## Open questions

- [resuelta] ¿Se requiere autenticación desde la primera versión? → Sí, JWT con revocación de tokens (WI-019).
- [resuelta] ¿Se requieren roles? → Sí: superadmin, admin y nuevo (WI-019).
