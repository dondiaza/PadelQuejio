import { prisma } from "@/lib/prisma";

export default async function AdminNotificationTemplatesPage() {
  const templates = await prisma.notificationTemplate.findMany({
    orderBy: [{ key: "asc" }, { channel: "asc" }],
  });

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">PLANTILLAS</h1>
        <p className="mt-2 text-sm text-muted">
          Plantillas transaccionales por evento y canal de envio.
        </p>
      </section>
      <section className="card p-5">
        <div className="space-y-2 text-sm">
          {templates.length === 0 ? (
            <p className="text-muted">No hay plantillas registradas.</p>
          ) : (
            templates.map((template) => (
              <article key={template.id} className="rounded-xl border border-border bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{template.key}</p>
                  <span className="chip">{template.channel}</span>
                </div>
                {template.subject ? <p className="text-muted">Asunto: {template.subject}</p> : null}
                <p className="mt-1 text-muted">{template.body}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
