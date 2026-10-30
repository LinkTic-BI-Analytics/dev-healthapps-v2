---
type: business
project_state: ai-assisted
generated_by: kaddo-bootstrap
template_version: 1
refined_by: business-agent
---

> Idioma del proyecto: **español**. Escribe este conocimiento en español. Mantén en inglés el código, los nombres de archivo, los comandos y las claves de configuración.

# Business Context

**Health Apps** es una aplicación centralizada para el monitoreo y la supervisión del estado de las aplicaciones y servicios desarrollados que se encuentran actualmente en operación. Funciona como un **centro de monitoreo** y una herramienta de **observabilidad centralizada** para el equipo técnico.

## Problem

El equipo técnico no cuenta con un único lugar desde el cual visualizar, consultar y evaluar la salud del ecosistema de aplicaciones en operación. Como consecuencia:

- No es posible saber rápidamente si un servicio está **operativo, degradado o fuera de servicio**.
- La información sobre disponibilidad, rendimiento, solicitudes y errores está dispersa o no se recopila de forma sistemática.
- Los problemas (caídas, errores, degradación) se detectan tarde, lo que retrasa la reacción ante incidentes.
- No existe un historial consolidado que permita evaluar si cada aplicación opera dentro de los parámetros esperados.

## Users

| Usuario | Tipo | Objetivos |
|---|---|---|
| **Equipo técnico** (desarrolladores, operación/soporte) | Principal | Saber en segundos qué servicios están operativos, degradados o caídos; recibir alertas oportunas; investigar métricas de un servicio afectado para reaccionar ante incidentes. |
| **Responsables técnicos / líderes de equipo** | Secundario _(supuesto)_ | Tener una visión general del ecosistema; consultar disponibilidad e historial por período para evaluar si las aplicaciones cumplen los parámetros esperados. |

## Value proposition

Para el equipo técnico que opera múltiples aplicaciones y servicios, **Health Apps** ofrece un **único punto de consulta** que muestra de forma visual y clara el estado de salud de todo el ecosistema, junto con métricas de disponibilidad, rendimiento y operación, e **alerta tempranamente** ante caídas, errores o degradación. A diferencia de revisar cada aplicación por separado, permite detectar problemas antes y reaccionar a tiempo.

## Business goals

- Disponer de **un único punto de consulta** con la visión general del estado de todas las aplicaciones y servicios en operación.
- **Detectar tempranamente** caídas, errores y degradación del rendimiento.
- **Reducir el tiempo de reacción** del equipo técnico ante incidentes.
- Proporcionar **información confiable** que permita determinar si cada aplicación opera dentro de los parámetros esperados.
- Conservar un **historial del estado** de los servicios para análisis posterior.

## Business rules

- **BR-01:** Todo servicio monitoreado tiene en todo momento exactamente un estado de salud: **operativo**, **degradado** o **fuera de servicio**.
- **BR-02:** Todo servicio monitoreado muestra la fecha y hora de su **última verificación**.
- **BR-03:** Cuando un servicio pasa a estado **fuera de servicio**, se genera una alerta.
- **BR-04:** Cuando un servicio pasa a estado **degradado** o registra errores por encima de lo esperado, se genera una alerta.
- **BR-05:** El estado de un servicio se determina comparando sus métricas (tiempo de respuesta, errores, disponibilidad) con los **parámetros esperados** definidos para ese servicio. _(Supuesto: los parámetros se definen por servicio.)_
- **BR-06:** Cada cambio de estado de un servicio queda registrado en su **historial**.
- **BR-07:** El uptime de un servicio en un período se calcula a partir de su historial de estados en ese período.
- **BR-08:** Si una verificación no puede realizarse por una falla del propio monitor, el servicio no debe marcarse como caído por esa causa. _(Supuesto.)_

## Constraints

- La información debe presentarse de forma **visual, clara y fácil de interpretar** (indicadores, tarjetas, gráficas y estados de salud).
- La plataforma debe ser **confiable**: no debe reportar estados engañosos.
- Equipo pequeño (según `.kaddo/config.yml`): el alcance inicial debe ser acotado.
- _Supuesto:_ las aplicaciones monitoreadas son internas y desarrolladas por el equipo, por lo que es posible acordar con ellas mecanismos de verificación de salud.
- _Por confirmar:_ restricciones regulatorias o de seguridad sobre los datos de las aplicaciones monitoreadas (el dominio "salud" podría implicar datos sensibles).

## Glossary

- **Servicio / aplicación monitoreada:** aplicación, API o servicio en operación cuyo estado supervisa Health Apps.
- **Operativo:** el servicio responde correctamente y dentro de los parámetros esperados.
- **Degradado:** el servicio responde, pero con tiempos de respuesta o tasa de errores fuera de los parámetros esperados.
- **Fuera de servicio:** el servicio no responde o falla de forma sostenida.
- **Parámetros esperados:** umbrales que definen el funcionamiento aceptable de un servicio.
- **Uptime (disponibilidad):** porcentaje de tiempo en que un servicio estuvo operativo durante un período.
- **Verificación (health check):** comprobación periódica del estado de un servicio.
- **Alerta:** notificación generada ante una caída, error o degradación.
- **Historial:** registro cronológico de estados y métricas de un servicio.

## Open questions

- [open] ¿Cuántas aplicaciones y servicios se monitorearán inicialmente y cuáles son?
- [open] ¿Por qué canales deben enviarse las alertas (correo, Slack/Teams, otro) y a quién?
- [resuelta] ¿Se requiere autenticación? → Sí: usuarios autenticados con JWT y capacidad de invalidar tokens (WI-019).
- [resuelta] ¿Quiénes acceden y con qué roles? → `superadmin` (acceso total), `admin` (igual que superadmin, con permisos revocables), `nuevo` (sin permisos; rol del autorregistro). Superadmin y admin crean usuarios.
- [open] ¿Cuánto tiempo debe conservarse el historial de estados y métricas?
- [open] ¿Existen objetivos de disponibilidad (SLA/SLO) acordados para los servicios?
- [open] ¿Qué valores concretos definen "degradado" y "fuera de servicio" (p. ej., tiempo de respuesta, número de fallos consecutivos)?
- [open] ¿Las aplicaciones monitoreadas manejan datos sensibles de salud que impongan restricciones regulatorias?
