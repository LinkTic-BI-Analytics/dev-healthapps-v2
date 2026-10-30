import StatusBadge from "@/components/StatusBadge";
import type { HealthStatus } from "@/types/health-status.type";

/** Sección de la ayuda con título. */
export function HelpSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

/** Término y su explicación. */
export function HelpTerm({ term, children }: { term: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="shrink-0 font-medium text-foreground sm:w-44">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function HelpTerms({ children }: { children: React.ReactNode }) {
  return <dl className="flex flex-col gap-3">{children}</dl>;
}

/** Explicación de los estados de salud con su pastilla real. */
export function HealthStatesHelp() {
  const states: { status: HealthStatus | null; text: React.ReactNode }[] = [
    {
      status: "operativo",
      text: "El servicio responde correctamente, dentro del tiempo de respuesta máximo y sin componentes con falla.",
    },
    {
      status: "degradado",
      text: (
        <>
          El servicio responde, pero con problemas: tarda más que su <strong>tiempo de respuesta máximo</strong>, su
          /health reporta algún <strong>componente con falla</strong> (por ejemplo una base de datos), o acaba de fallar
          sin llegar todavía al límite de fallos seguidos.
        </>
      ),
    },
    {
      status: "caido",
      text: (
        <>
          Falló varias veces seguidas (tantas como indica <strong>Fallos consecutivos para fuera de servicio</strong>):
          no responde, responde con error (4xx/5xx), se agota el tiempo de espera o su /health dice que está caído.
        </>
      ),
    },
    { status: null, text: "Todavía no se ha verificado: aparece así justo después de registrarlo." },
  ];
  return (
    <HelpTerms>
      {states.map((s) => (
        <HelpTerm key={s.status ?? "none"} term={<StatusBadge status={s.status} />}>
          {s.text}
        </HelpTerm>
      ))}
    </HelpTerms>
  );
}

/** Cómo se lee el JSON del /health (componentes). */
export function HealthBodyHelp() {
  return (
    <>
      <p>
        Si la URL de verificación devuelve un JSON, Health Apps lo lee automáticamente, sin configurar nada, aunque cada
        servicio use una estructura diferente. Busca los campos <code>status</code>, <code>state</code> o{" "}
        <code>health</code>:
      </p>
      <ul className="ml-5 list-disc space-y-1">
        <li>
          Si el estado principal indica falla (<code>down</code>, <code>error</code>, <code>fail</code>…), la verificación
          cuenta como <strong>fallo</strong>.
        </li>
        <li>
          Si el estado principal está bien pero algún componente interno indica falla (por ejemplo una base de datos o el
          caché), el servicio queda <strong>degradado</strong> y se indica cuál falla.
        </li>
        <li>
          Reconoce los formatos habituales: NestJS Terminus, Spring Boot Actuator, <code>health+json</code> y estructuras
          propias como <code>{"{ databases: [{ connection, status }] }"}</code>.
        </li>
        <li>Si el /health no devuelve JSON, solo se evalúan el código HTTP y el tiempo de respuesta.</li>
      </ul>
    </>
  );
}
