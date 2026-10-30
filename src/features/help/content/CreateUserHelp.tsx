import HelpButton from "../components/HelpButton";
import { HelpSection, HelpTerm, HelpTerms } from "../components/HelpSection";

export default function CreateUserHelp() {
  return (
    <HelpButton title="Crear usuario" summary="Cómo se crean usuarios y qué puede hacer cada rol.">
      <HelpSection title="Datos">
        <HelpTerms>
          <HelpTerm term="Email y nombre de usuario">
            Ambos deben ser únicos. El usuario podrá iniciar sesión con cualquiera de los dos; no se distinguen mayúsculas.
          </HelpTerm>
          <HelpTerm term="Contraseña">Por ahora no hay reglas de complejidad; compártela de forma segura.</HelpTerm>
        </HelpTerms>
      </HelpSection>

      <HelpSection title="Roles">
        <HelpTerms>
          <HelpTerm term="Superadmin">Acceso total. Sus permisos no se pueden quitar.</HelpTerm>
          <HelpTerm term="Admin">
            Los mismos permisos que el superadmin, pero se le pueden quitar permisos de forma individual.
          </HelpTerm>
          <HelpTerm term="Nuevo">
            Sin permisos: solo ve un aviso de «cuenta pendiente de permisos». Es el rol de quien se registra por su cuenta.
          </HelpTerm>
        </HelpTerms>
        <p>Un superadmin puede crear cualquier rol; un admin puede crear admins y usuarios nuevos, pero no superadmins.</p>
      </HelpSection>
    </HelpButton>
  );
}
