import HelpButton from "../components/HelpButton";
import { HealthStatesHelp, HelpSection, HelpTerm, HelpTerms } from "../components/HelpSection";

export default function PanelHelp() {
  return (
    <HelpButton title="Panel" summary="Estado en tiempo real de todas las aplicaciones y servicios monitoreados.">
      <HelpSection title="Estados de un servicio">
        <HealthStatesHelp />
      </HelpSection>

      <HelpSection title="Resumen">
        <p>
          El recuadro superior muestra cuántos servicios hay en cada estado. Su color es el del peor estado presente: rojo
          si hay alguno caído, ámbar si hay alguno degradado y verde si todos están operativos. La barra muestra la
          proporción de cada estado.
        </p>
      </HelpSection>

      <HelpSection title="Tarjeta de cada servicio">
        <HelpTerms>
          <HelpTerm term="Franja de color">Color del estado actual.</HelpTerm>
          <HelpTerm term="Tiempo (ms o s)">
            Lo que tardó en responder la última verificación. Aparece en ámbar si supera el tiempo de respuesta máximo del
            servicio.
          </HelpTerm>
          <HelpTerm term="hace X">Cuándo fue la última verificación.</HelpTerm>
          <HelpTerm term="Mini gráfica">Tendencia de los últimos tiempos de respuesta (hasta 20 verificaciones).</HelpTerm>
          <HelpTerm term="Componentes con falla">
            Aparece en ámbar cuando el /health del servicio reporta partes internas caídas, por ejemplo una base de datos.
          </HelpTerm>
          <HelpTerm term="24 h · 7 d · 30 d">
            Uptime: porcentaje del tiempo en que el servicio estuvo <strong>operativo</strong> en cada período. Verde desde
            99 %, ámbar desde 95 % y rojo por debajo. «—» indica que aún no hay datos.
          </HelpTerm>
        </HelpTerms>
        <p>Toca una tarjeta para ver el detalle completo del servicio.</p>
      </HelpSection>

      <HelpSection title="Cambios de estado">
        <p>
          Cuando un servicio cambia de estado entre una actualización y la siguiente, su tarjeta se ilumina durante unos
          segundos con la etiqueta <strong>Cambió</strong>. Si el servicio <strong>se recuperó</strong> (volvió a estar
          operativo), la etiqueta dice <strong>Recuperado</strong> y lo celebramos con confeti 🎉.
        </p>
        <p>
          Los servicios caídos o degradados tienen un pulso suave en su estado para llamar la atención. Si todos están
          operativos, el resumen muestra <strong>¡Todo en orden!</strong>.
        </p>
        <p>
          Si en tu dispositivo tienes activada la opción de <strong>reducir el movimiento</strong>, el panel no muestra
          animaciones ni confeti; la información es la misma.
        </p>
      </HelpSection>

      <HelpSection title="Filtros y actualización">
        <p>
          Los botones <strong>Todos, Caídos, Degradados y Operativos</strong> filtran las tarjetas; el número indica cuántos
          servicios hay en cada estado. Los que requieren atención aparecen primero.
        </p>
        <p>
          El panel se actualiza solo cada 30 segundos mientras la pestaña está visible. El botón ↻ lo actualiza al momento.
          Solo se muestran los servicios activos.
        </p>
      </HelpSection>
    </HelpButton>
  );
}
