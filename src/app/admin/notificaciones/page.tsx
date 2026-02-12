import Link from "next/link";

import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminNotificationsPage() {
  const [notifications, queueStats] = await Promise.all([
    prisma.notification.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    prisma.notification.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
  ]);

  const byStatus = Object.fromEntries(queueStats.map((entry) => [entry.status, entry._count._all]));

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">NOTIFICACIONES</h1>
        <p className="mt-2 text-sm text-muted">Cola de envios, estados y reintentos.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/notificaciones/plantillas" className="btn-secondary text-sm">
            Plantillas
          </Link>
          <Link href="/admin/notificaciones/campanas" className="btn-secondary text-sm">
            Campanas
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="card p-4">
          <p className="text-sm text-muted">Queued</p>
          <p className="text-4xl text-secondary">{byStatus.queued ?? 0}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Processing</p>
          <p className="text-4xl text-secondary">{byStatus.processing ?? 0}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Sent</p>
          <p className="text-4xl text-secondary">{byStatus.sent ?? 0}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Failed</p>
          <p className="text-4xl text-secondary">{byStatus.failed ?? 0}</p>
        </article>
      </section>

      <section className="card p-5">
        <h2 className="text-3xl">Actividad reciente</h2>
        <div className="mt-3 space-y-2 text-sm">
          {notifications.map((entry) => (
            <article key={entry.id} className="rounded-xl border border-border bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{entry.templateKey}</p>
                <span className="chip">{entry.status}</span>
              </div>
              <p className="text-muted">Canal: {entry.channel}</p>
              <p className="text-muted">Usuario: {entry.user.name ?? entry.user.email}</p>
              <p className="text-muted">Programada: {formatDateTime(entry.scheduledFor)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
