import HelpButton from "../components/HelpButton";
import { HealthBodyHelp, HealthStatesHelp, HelpSection, HelpTerm, HelpTerms } from "../components/HelpSection";

export default function ServiceDetailHelp() {
  return (
    <HelpButton title="Detalle del servicio" summary="Estado, métricas, disponibilidad e historial de un servicio.">
      <HelpSection title="Estado">
        <p>La pastilla muestra el estado actual y desde cuándo está así.</p>
        <HealthStatesHelp />
      </HelpSection>

      <HelpSection title="Métricas">
        <HelpTerms>
          <HelpTerm term="Última respuesta">Lo que tardó la última verificación (en ámbar si supera el umbral).</HelpTerm>
          <HelpTerm term="Umbral de degradación">El tiempo de respuesta máximo configurado para este servicio.</HelpTerm>
          <HelpTerm term="Fallos seguidos">
            Fallos consecutivos actuales frente al límite para marcarlo caído (por ejemplo 2 / 3).
          </HelpTerm>
          <HelpTerm term="Última verificación">Cuándo se consultó por última vez.</HelpTerm>
        </HelpTerms>
      </HelpSection>

      <HelpSection title="Disponibilidad (uptime)">
        <p>
          Porcentaje del tiempo en que el servicio estuvo <strong>operativo</strong> en las últimas 24 horas, 7 días y 30
          días. El tiempo degradado o caído cuenta como no disponible. No se cuentan los períodos sin datos (antes de su
          primera verificación) ni los momentos en que el propio monitor no pudo verificar. Ejemplo: 1 hora caído en 24
          horas da 95,83 %.
        </p>
      </HelpSection>

      <HelpSection title="Gráfica de tiempo de respuesta">
        <p>
          Muestra lo que tardó cada verificación en la última hora o en las últimas 24 horas (botones 1 h / 24 h). La{" "}
          <strong>línea roja discontinua</strong> es el umbral de degradación. Los puntos <strong>ámbar</strong> superaron
          el umbral y los <strong>rojos</strong> son fallos. Pasa el dedo o el cursor sobre la gráfica para ver cada valor.
        </p>
      </HelpSection>

      <HelpSection title="Componentes">
        <p>Aparece si el /health del servicio reporta sus partes internas. Las que fallan se muestran primero con su motivo.</p>
        <HealthBodyHelp />
      </HelpSection>

      <HelpSection title="Historial de estados">
        <p>
          Cada vez que el servicio cambia de estado se registra el estado anterior, el nuevo y la hora. Se conserva un año.
        </p>
      </HelpSection>

      <HelpSection title="Verificaciones recientes">
        <HelpTerms>
          <HelpTerm term="Éxito">Respondió correctamente.</HelpTerm>
          <HelpTerm term="Fallo">No respondió, respondió con error o su /health indicó falla. Se muestra el motivo.</HelpTerm>
          <HelpTerm term="Omitida">
            El propio monitor no tenía conexión: no cuenta como fallo del servicio ni cambia su estado.
          </HelpTerm>
          <HelpTerm term="Ver respuesta">
            Fragmento de lo que respondió el servicio, disponible cuando hubo un problema.
          </HelpTerm>
        </HelpTerms>
        <p>Los resultados de cada verificación se conservan 30 días.</p>
      </HelpSection>
    </HelpButton>
  );
}
