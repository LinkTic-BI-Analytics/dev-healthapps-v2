import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import type { ComponentStatus, HealthComponent } from "@/features/checks/server/health-body";
import { cn } from "@/lib/utils";

/** Nombres legibles para los contenedores más comunes de un /health. */
const GROUP_LABEL: Record<string, string> = {
  databases: "Bases de datos",
  database: "Bases de datos",
  db: "Bases de datos",
  datasources: "Bases de datos",
  cache: "Caché",
  caches: "Caché",
  queues: "Colas",
  dependencies: "Dependencias",
  services: "Servicios",
  components: "Componentes",
  checks: "Verificaciones",
  details: "Componentes",
};

const STATUS: Record<ComponentStatus, { label: string; icon: typeof CircleCheck; className: string }> = {
  up: { label: "Bien", icon: CircleCheck, className: "text-status-ok" },
  warn: { label: "Advertencia", icon: CircleAlert, className: "text-status-warn" },
  down: { label: "Con falla", icon: CircleX, className: "text-status-down" },
};

const ORDER: Record<ComponentStatus, number> = { down: 0, warn: 1, up: 2 };

/** Para componentes de la raíz (sin contenedor), el tipo se deduce del nombre: `db_main`, `redis`… */
const NAME_PATTERNS: [RegExp, string][] = [
  [/(^|[_\-.])(db|database|datasource|postgres(ql)?|pg|mysql|mariadb|mongo(db)?|sql(server)?|oracle)([_\-.]|$)/i, "Bases de datos"],
  [/(^|[_\-.])(cache|redis|memcached?)([_\-.]|$)/i, "Caché"],
  [/(^|[_\-.])(queue|rabbit(mq)?|kafka|sqs|amqp)([_\-.]|$)/i, "Colas"],
];

function groupLabel(c: HealthComponent): string {
  if (c.group) return GROUP_LABEL[c.group.toLowerCase()] ?? c.group;
  const byName = GROUP_LABEL[c.name.toLowerCase()] ?? NAME_PATTERNS.find(([re]) => re.test(c.name))?.[1];
  return byName ?? "General";
}

/** Componentes reportados por el /health (WI-021), agrupados; los que fallan primero. */
export default function ComponentsList({ components }: { components: HealthComponent[] }) {
  const ok = components.filter((c) => c.status === "up").length;
  const groups = new Map<string, HealthComponent[]>();
  for (const c of components) {
    const label = groupLabel(c);
    groups.set(label, [...(groups.get(label) ?? []), c]);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="flex gap-3 font-mono text-xs">
        <span className="text-status-ok">{ok} bien</span>
        {components.length - ok > 0 && <span className="text-status-down">{components.length - ok} con falla</span>}
      </p>
      {[...groups.entries()].map(([label, items]) => (
        <div key={label} className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label} <span className="font-mono">({items.length})</span>
          </h3>
          <ul className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2 xl:grid-cols-3">
            {[...items].sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.name.localeCompare(b.name)).map((c) => {
              const s = STATUS[c.status];
              const Icon = s.icon;
              return (
                <li key={`${c.group}/${c.name}`} className="flex min-w-0 flex-col gap-0.5 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon aria-label={s.label} className={cn("size-4 shrink-0", s.className)} />
                    <span className={cn("truncate font-mono text-xs", c.status !== "up" && s.className)}>{c.name}</span>
                    {c.status !== "up" && <span className={cn("ml-auto shrink-0 font-mono text-xs", s.className)}>{c.rawStatus}</span>}
                  </span>
                  {c.status !== "up" && c.message && <span className="pl-6 text-xs text-muted-foreground">{c.message}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
