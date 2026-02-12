import { prisma } from "@/lib/prisma";

export default async function AdminStatsPage() {
  const [totalReservations, cancelledReservations, noShowReservations, income] =
    await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: "cancelled" } }),
      prisma.reservation.count({ where: { status: "no_show" } }),
      prisma.paymentIntent.aggregate({
        where: { status: "succeeded" },
        _sum: { amount: true },
      }),
    ]);

  return (
    <section className="card p-6">
      <h1 className="text-5xl">ESTADISTICAS</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-4 text-sm">
        <article className="rounded-xl border border-border bg-white p-3">
          <p className="text-muted">Reservas</p>
          <p className="text-3xl text-secondary">{totalReservations}</p>
        </article>
        <article className="rounded-xl border border-border bg-white p-3">
          <p className="text-muted">Cancelaciones</p>
          <p className="text-3xl text-secondary">{cancelledReservations}</p>
        </article>
        <article className="rounded-xl border border-border bg-white p-3">
          <p className="text-muted">No-shows</p>
          <p className="text-3xl text-secondary">{noShowReservations}</p>
        </article>
        <article className="rounded-xl border border-border bg-white p-3">
          <p className="text-muted">Ingresos</p>
          <p className="text-3xl text-secondary">{Number(income._sum.amount ?? 0)} EUR</p>
        </article>
      </div>
    </section>
  );
}
