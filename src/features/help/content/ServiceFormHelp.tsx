import HelpButton from "../components/HelpButton";
import { HealthBodyHelp, HelpSection, HelpTerm, HelpTerms } from "../components/HelpSection";

export default function ServiceFormHelp() {
  return (
    <HelpButton title="Configurar un servicio" summary="Qué significa cada campo y cómo se decide el estado del servicio.">
      <HelpSection title="Datos del servicio">
        <HelpTerms>
          <HelpTerm term="Nombre">Cómo se mostrará en el panel. Debe ser único.</HelpTerm>
          <HelpTerm term="URL de verificación">
            Dirección que Health Apps consulta con una petición GET, por ejemplo{" "}
            <code>https://api.ejemplo.com/health</code>. Debe empezar por http:// o https://. Una respuesta 2xx o 3xx
            cuenta como éxito; 4xx, 5xx, no responder o superar el tiempo de espera cuentan como fallo. Las URLs con{" "}
            <code>localhost</code> funcionan también cuando el monitor corre en Docker.
          </HelpTerm>
          <HelpTerm term="Descripción">Opcional. Ayuda a identificar el servicio en el listado.</HelpTerm>
        </HelpTerms>
      </HelpSection>

      <HelpSection title="Parámetros esperados">
        <HelpTerms>
          <HelpTerm term="Tiempo de respuesta máximo (ms)">
            Si una verificación exitosa tarda más que esto, el servicio queda <strong>degradado</strong>. Por defecto 1000
            ms (1 segundo). Ejemplo: con 600 ms, una respuesta de 900 ms lo marca como degradado.
          </HelpTerm>
          <HelpTerm term="Fallos consecutivos para fuera de servicio">
            Cuántas verificaciones fallidas <strong>seguidas</strong> hacen falta para marcarlo <strong>caído</strong>.
            Antes de llegar a ese número, queda degradado. Por defecto 3. Un solo éxito reinicia la cuenta. Un valor mayor
            evita alarmas por fallos aislados; uno menor detecta caídas antes.
          </HelpTerm>
        </HelpTerms>
      </HelpSection>

      <HelpSection title="Verificación">
        <HelpTerms>
          <HelpTerm term="Frecuencia (segundos)">
            Cada cuánto se consulta el servicio. Por defecto 60 segundos; mínimo 10. Con 60 s y 3 fallos seguidos, una caída
            se detecta en unos 3 minutos.
          </HelpTerm>
          <HelpTerm term="Tiempo de espera (ms)">
            Cuánto se espera una respuesta antes de contarla como fallo. Por defecto 10000 ms (10 segundos). Debe ser mayor
            que el tiempo de respuesta máximo.
          </HelpTerm>
        </HelpTerms>
      </HelpSection>

      <HelpSection title="Lectura del JSON del /health">
        <HealthBodyHelp />
      </HelpSection>
    </HelpButton>
  );
}
