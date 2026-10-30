import AlertsHelp from "@/features/help/content/AlertsHelp";

export default function AlertasPage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>
        <AlertsHelp />
      </header>
      <p className="rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">Sin alertas por ahora.</p>
    </section>
  );
}
