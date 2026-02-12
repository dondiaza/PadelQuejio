import { prisma } from "@/lib/prisma";

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <section className="card p-6">
      <h1 className="text-5xl">AUDITORIA</h1>
      <div className="mt-4 space-y-2 text-sm">
        {logs.map((log) => (
          <article key={log.id} className="rounded-xl border border-border bg-white p-3">
            <p className="font-semibold">{log.action}</p>
            <p className="text-muted">
              {log.entityType} / {log.entityId}
            </p>
            <p className="text-muted">
              Actor: {log.actor?.name ?? log.actor?.email ?? "system"}
            </p>
            <p className="text-xs text-muted">{log.createdAt.toISOString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
