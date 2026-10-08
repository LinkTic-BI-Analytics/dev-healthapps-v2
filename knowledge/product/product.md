---
type: product
project_state: new
generated_by: kaddo-bootstrap
template_version: 1
---

> Idioma del proyecto: **español**. Escribe este conocimiento en español. Mantén en inglés el código, los nombres de archivo, los comandos y las claves de configuración.

# Product Context

## Product vision

**Health Apps** es un centro de monitoreo centralizado que permite **visualizar, consultar y evaluar la salud** de las aplicaciones y servicios en operación desde un único lugar. Recopila métricas de disponibilidad, rendimiento y operación, y las presenta de forma visual (indicadores, tarjetas, gráficas y estados de salud) para identificar de un vistazo qué servicios están **operativos, degradados o fuera de servicio**, facilitando la detección temprana de problemas y una reacción oportuna ante incidentes.

### Plataforma

Health Apps es una **aplicación web**, diseñada **mobile-first** (el equipo técnico la consulta desde el móvil durante incidentes) y **responsive para escritorio**. Tiene **tema claro y tema oscuro** y usa la línea gráfica de `resources/lineagrafica/`. En escritorio la interfaz se reacomoda para aprovechar el espacio (navegación lateral, varias columnas).

## User journeys

1. **Revisar el estado general del ecosistema:** el usuario abre el panel principal y ve tarjetas por servicio con su estado de salud (operativo / degradado / fuera de servicio), uptime y última verificación, junto con indicadores globales.
2. **Investigar un servicio:** el usuario selecciona un servicio y consulta su detalle: tiempos de respuesta, cantidad y frecuencia de solicitudes, errores y fallos registrados, e historial de estado en gráficas.
3. **Reaccionar ante una alerta:** el usuario recibe una alerta por caída, errores o degradación, accede al servicio afectado, revisa las métricas recientes y determina la causa y el impacto.
4. **Evaluar el cumplimiento de parámetros:** el usuario revisa el historial y la disponibilidad de un período para determinar si la aplicación opera dentro de los parámetros esperados.
5. **Registrar un servicio a monitorear (supuesto):** el usuario agrega una aplicación o API indicando cómo verificarla y sus umbrales esperados.

## Scope

### In scope

- Estado actual de cada aplicación o servicio (operativo, degradado, fuera de servicio).
- Disponibilidad y tiempo de actividad (*uptime*).
- Tiempos de respuesta de servicios y APIs.
- Cantidad y frecuencia de solicitudes.
- Errores y fallos registrados.
- Fecha y hora de la última verificación.
- Historial del estado de los servicios.
- Alertas ante caídas, errores o degradación del rendimiento.
- Métricas para determinar si una aplicación opera dentro de los parámetros esperados.
- Panel visual con indicadores, tarjetas, gráficas y estados de salud.

### Out of scope (supuesto, a confirmar)

- Corrección o remediación automática de incidentes.
- Gestión completa de incidentes (tickets, guardias, post-mortems).
- Análisis profundo de logs o trazas distribuidas (APM completo).
- Monitoreo de infraestructura de bajo nivel (CPU, memoria, disco) salvo que se defina lo contrario.

## Success criteria

- El equipo técnico puede identificar el estado de cualquier servicio monitoreado **en segundos** desde el panel principal.
- Las caídas, errores y degradaciones generan una **alerta** de forma oportuna, antes o al mismo tiempo que sean reportadas por otros medios.
- Cada servicio muestra métricas actualizadas y su **última verificación** reciente.
- El historial permite calcular y consultar el **uptime** de cada servicio por período.
- La información mostrada es **confiable**: sin falsos estados por fallas del propio monitor.

## Open questions

- [open] ¿Con qué frecuencia deben realizarse las verificaciones de cada servicio?
- [open] ¿Las métricas de solicitudes y errores se obtendrán por verificación activa (sondeo) o enviadas por las propias aplicaciones?
- [open] ¿Cuáles son los umbrales que definen "degradado" frente a "operativo"?
