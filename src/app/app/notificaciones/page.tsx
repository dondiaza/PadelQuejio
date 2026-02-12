import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: [{ scheduledFor: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  const sent = notifications.filter((item) => item.status === "sent").length;
  const queued = notifications.filter((item) => item.status === "queued").length;
  const failed = notifications.filter((item) => item.status === "failed").length;

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">NOTIFICACIONES</h1>
        <p className="mt-2 text-sm text-muted">
          Confirmaciones, recordatorios y alertas de pago programadas por el sistema.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-4">
          <p className="text-sm text-muted">Enviadas</p>
          <p className="text-4xl text-secondary">{sent}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">En cola</p>
          <p className="text-4xl text-secondary">{queued}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Fallidas</p>
          <p className="text-4xl text-secondary">{failed}</p>
        </article>
      </section>

      <section className="card p-5">
        <h2 className="text-3xl">Actividad</h2>
        <div className="mt-3 space-y-2 text-sm">
          {notifications.length === 0 ? (
            <p className="text-muted">No hay notificaciones registradas.</p>
          ) : (
            notifications.map((notification) => (
              <article key={notification.id} className="rounded-xl border border-border bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{notification.templateKey}</p>
                  <span className="chip">{notification.channel}</span>
                </div>
                <p className="text-muted">Estado: {notification.status}</p>
                <p className="text-muted">Programada: {formatDateTime(notification.scheduledFor)}</p>
                {notification.sentAt ? (
                  <p className="text-muted">Enviada: {formatDateTime(notification.sentAt)}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
