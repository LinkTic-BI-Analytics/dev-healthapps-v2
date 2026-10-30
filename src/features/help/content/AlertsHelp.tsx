import HelpButton from "../components/HelpButton";
import { HelpSection } from "../components/HelpSection";

export default function AlertsHelp() {
  return (
    <HelpButton title="Alertas" summary="Avisos ante caídas, degradaciones y recuperaciones de los servicios.">
      <HelpSection title="Próximamente">
        <p>
          Esta sección mostrará una alerta cada vez que un servicio cambie de estado: <strong>crítica</strong> cuando se
          cae, <strong>advertencia</strong> cuando se degrada e <strong>informativa</strong> cuando se recupera. También se
          podrán enviar al canal de chat del equipo (Slack o Teams).
        </p>
        <p>Mientras tanto, revisa el panel y el historial de estados de cada servicio.</p>
      </HelpSection>
    </HelpButton>
  );
}
