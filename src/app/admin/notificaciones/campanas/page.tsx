import { addDays } from "date-fns";

import { prisma } from "@/lib/prisma";

export default async function AdminNotificationCampaignsPage() {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const inTwoDays = addDays(now, 2);

  const [activeUsers, usersWithReservationTomorrow, usersWithoutSubscription] = await Promise.all([
    prisma.user.count({ where: { status: "active" } }),
    prisma.user.count({
      where: {
        reservations: {
          some: {
            startAt: { gte: tomorrow, lt: inTwoDays },
            status: { in: ["pending_payment", "confirmed"] },
          },
        },
      },
    }),
    prisma.user.count({
      where: {
        status: "active",
        subscriptions: {
          none: {
            status: "active",
            endsAt: { gt: now },
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">CAMPANAS</h1>
        <p className="mt-2 text-sm text-muted">
          Segmentacion operativa para email, sms o push desde plantillas.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-4">
          <p className="text-sm text-muted">Usuarios activos</p>
          <p className="text-4xl text-secondary">{activeUsers}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Con reserva manana</p>
          <p className="text-4xl text-secondary">{usersWithReservationTomorrow}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Sin suscripcion activa</p>
          <p className="text-4xl text-secondary">{usersWithoutSubscription}</p>
        </article>
      </section>
      <section className="card p-5">
        <h2 className="text-3xl">Playbook de campanas</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-border bg-white p-3 text-sm">
            <p className="font-semibold">Huecos de ultima hora</p>
            <p className="text-muted">
              Segmento recomendado: usuarios activos sin reserva en 48h.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-white p-3 text-sm">
            <p className="font-semibold">Renovacion de plan</p>
            <p className="text-muted">
              Segmento recomendado: usuarios sin suscripcion activa o en estado past_due.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-white p-3 text-sm">
            <p className="font-semibold">Recordatorio de partido</p>
            <p className="text-muted">
              Segmento recomendado: usuarios con reserva manana antes de las 22:00.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-white p-3 text-sm">
            <p className="font-semibold">Promocion horario valle</p>
            <p className="text-muted">
              Segmento recomendado: jugadores de tarde sin actividad entre semana.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
