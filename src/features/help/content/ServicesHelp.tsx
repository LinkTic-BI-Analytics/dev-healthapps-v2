import HelpButton from "../components/HelpButton";
import { HelpSection, HelpTerm, HelpTerms } from "../components/HelpSection";

export default function ServicesHelp() {
  return (
    <HelpButton title="Servicios" summary="Catálogo de las aplicaciones y APIs que Health Apps monitorea.">
      <HelpSection title="Qué es un servicio">
        <p>
          Cada servicio es una aplicación o API con una <strong>URL de verificación</strong> (normalmente su endpoint{" "}
          <code>/health</code>). Health Apps la consulta periódicamente para saber si está operativo, degradado o caído.
        </p>
      </HelpSection>

      <HelpSection title="Acciones">
        <HelpTerms>
          <HelpTerm term="Registrar servicio">Agrega un servicio nuevo al monitoreo.</HelpTerm>
          <HelpTerm term="Interruptor Activo / Inactivo">
            Un servicio inactivo deja de verificarse y no aparece en el panel, pero conserva su configuración y su
            historial. Úsalo para pausar el monitoreo temporalmente (por ejemplo, durante un mantenimiento).
          </HelpTerm>
          <HelpTerm term="Editar (lápiz)">Cambia el nombre, la URL o los parámetros de verificación.</HelpTerm>
          <HelpTerm term="Eliminar (papelera)">
            Borra el servicio <strong>junto con todo su historial y sus verificaciones</strong>. No se puede deshacer: si
            solo quieres dejar de verificarlo, desactívalo.
          </HelpTerm>
          <HelpTerm term="Nombre del servicio">Abre el detalle con sus métricas, gráficas e historial.</HelpTerm>
        </HelpTerms>
      </HelpSection>

      <HelpSection title="Permisos">
        <p>
          Ver servicios requiere el permiso «Ver servicios». Registrar, editar, activar/desactivar y eliminar requieren
          «Gestionar servicios» (los administradores lo tienen por defecto).
        </p>
      </HelpSection>
    </HelpButton>
  );
}
