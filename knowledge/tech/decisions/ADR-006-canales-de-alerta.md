---
type: adr
id: ADR-006
status: draft
date: 2026-10-05
code:
  - src/features/alerts/**
  - app/(app)/alertas/**
related_work_items: [WI-016, WI-017]
---

# ADR-006 — Canales y contenido de las alertas

## Context

El negocio pide alertas ante caídas, errores y degradación (BR-03, BR-04) para reducir el tiempo de reacción. No se ha definido por qué canal llegan ni a quién. El equipo indicó proceder con supuestos documentados (2026-10-05). El estado de los servicios ya se evalúa en el worker y cada cambio queda en `service_status_changes` (WI-011, WI-014), así que una alerta corresponde a una transición.

## Options Considered

1. **Bandeja de alertas en la aplicación** (`/alertas`): sin dependencias externas; solo se ve si alguien abre la app.
2. **Webhook entrante de chat (Slack o Microsoft Teams):** llega a donde el equipo ya conversa; solo requiere una URL secreta; sin credenciales de usuario.
3. **Correo electrónico (SMTP):** universal, pero requiere servidor SMTP, credenciales y gestión de destinatarios; más lento para incidentes.
4. **SMS o llamada (proveedor externo):** inmediato, pero con costo, contrato y datos personales.
5. **Notificaciones push web:** requieren service worker, permiso del navegador y suscripciones por dispositivo.

## Decision

Propuesta (pendiente de aceptación; basada en supuestos acordados con el equipo):

- **Canales del MVP:**
  1. **Bandeja en la aplicación** (siempre activa): lista de alertas en `/alertas`, con indicador en la navegación, y la opción de **reconocer** una alerta (como en el prototipo de la línea gráfica).
  2. **Webhook de chat** (opcional, configurable): si `ALERT_WEBHOOK_URL` está definida, cada alerta se envía también al canal del equipo. Formato según `ALERT_WEBHOOK_FORMAT` (`slack` | `teams` | `generic`).
- **Descartados por ahora:** correo (requiere SMTP y gestión de destinatarios; candidato para una segunda fase), SMS/llamada (costo y contrato) y push web (complejidad por dispositivo).
- **Destinatarios:**
  - Bandeja: los usuarios con el permiso nuevo `alerts.read`, que `admin` recibe con el seed y `superadmin` siempre tiene. Reconocer requiere `alerts.manage`.
  - Webhook: el canal de chat del equipo técnico configurado en la URL (un solo canal en el MVP).
- **Cuándo se alerta:** una alerta por **transición** de estado:
  - a `caido` → severidad **crítica**;
  - a `degradado` → **advertencia**;
  - de `caido` o `degradado` a `operativo` → **informativa (recuperación)**.
  No se repite mientras el estado no cambie. Los resultados `skipped` nunca generan alertas (BR-08).
- **Contenido mínimo de una alerta:** servicio; severidad; estado anterior → estado nuevo; fecha y hora; motivo (último `error_message` o latencia frente al umbral); enlace al detalle (`APP_BASE_URL` + `/servicios/{id}`).
- **Entrega:** el worker crea la alerta en la misma transacción que el cambio de estado (tabla `alerts`) y el envío por webhook se hace después de confirmar la transacción, con reintentos y timeout. Un fallo de envío queda registrado en la alerta y **no** interrumpe las verificaciones.

## Configuration and Credentials

| Variable | Ámbito | Descripción |
| --- | --- | --- |
| `ALERT_WEBHOOK_URL` | servidor (secreto) | URL del webhook entrante de Slack o Teams. Vacía = solo bandeja. Nunca `NEXT_PUBLIC_`. |
| `ALERT_WEBHOOK_FORMAT` | servidor | `slack`, `teams` o `generic` (JSON propio). |
| `APP_BASE_URL` | servidor | URL pública de Health Apps para los enlaces de las alertas. |
| `ALERT_WEBHOOK_TIMEOUT_MS` | servidor | Tiempo máximo por envío (por defecto 5000). |

- El webhook se crea en el espacio de trabajo de Slack o Teams del equipo; quien lo crea debe guardar la URL como secreto del despliegue.
- Permisos nuevos a sembrar: `alerts.read` y `alerts.manage`.

## Consequences

- (+) Sin infraestructura nueva: la bandeja usa PostgreSQL y el webhook solo necesita una URL.
- (+) Las alertas siguen exactamente el historial de estados: no hay duplicados ni alertas por fallas del propio monitor.
- (−) Si nadie mira el chat ni la app, la alerta pasa desapercibida (no hay escalamiento ni guardias: fuera del alcance).
- (−) Los servicios "inestables" (flapping) pueden generar varias alertas seguidas; si ocurre, se puede agregar un período de gracia (pregunta abierta de WI-017).

## Open Questions

- [open] ¿Qué herramienta de chat usa el equipo (Slack o Teams) y qué canal?
- [open] ¿Se requiere correo en una segunda fase? ¿Para quién?
- [open] ¿Se necesita un período de gracia antes de alertar, para evitar falsos positivos?

## Related Capabilities

- Alertas / Generación y notificación de alertas

## Related Work Items

- WI-016 (este spike), WI-017 (implementación; no planificada por ahora)
