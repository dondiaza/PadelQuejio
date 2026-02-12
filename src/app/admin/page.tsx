import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const now = new Date();
  const [courtsCount, todayReservations, pendingPayments, activeSubscriptions, recentAudits] =
    await Promise.all([
      prisma.court.count(),
      prisma.reservation.count({
        where: {
          startAt: {
            gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
            lt: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)),
          },
        },
      }),
      prisma.reservation.count({
        where: { status: "pending_payment" },
      }),
      prisma.subscription.count({
        where: { status: "active" },
      }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="text-5xl">DASHBOARD OPERATIVO</h1>
        <p className="mt-2 text-sm text-muted">
          Control diario de reservas, pagos y operacion.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="card p-4">
          <p className="text-sm text-muted">Pistas</p>
          <p className="text-4xl text-secondary">{courtsCount}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Reservas hoy</p>
          <p className="text-4xl text-secondary">{todayReservations}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Pendientes de pago</p>
          <p className="text-4xl text-secondary">{pendingPayments}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Suscripciones activas</p>
          <p className="text-4xl text-secondary">{activeSubscriptions}</p>
        </article>
      </section>

      <section className="card p-5">
        <h2 className="text-3xl">Auditoria reciente</h2>
        <div className="mt-3 space-y-2 text-sm">
          {recentAudits.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-border bg-white p-3">
              <p className="font-semibold">{entry.action}</p>
              <p className="text-muted">
                {entry.entityType} #{entry.entityId}
              </p>
              <p className="text-xs text-muted">{entry.createdAt.toISOString()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
