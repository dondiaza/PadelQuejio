import { formatDateTime, formatEur } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminRefundsPage() {
  const refunds = await prisma.refund.findMany({
    include: {
      paymentIntent: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          reservation: {
            include: { court: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalRefunded = refunds
    .filter((refund) => refund.status === "succeeded" || refund.status === "pending")
    .reduce((sum, refund) => sum + Number(refund.amount), 0);

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">REEMBOLSOS</h1>
        <p className="mt-2 text-sm text-muted">Control de devoluciones y estado operativo.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-4">
          <p className="text-sm text-muted">Total registros</p>
          <p className="text-4xl text-secondary">{refunds.length}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Importe a devolver</p>
          <p className="text-4xl text-secondary">{formatEur(totalRefunded)}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Pendientes</p>
          <p className="text-4xl text-secondary">
            {refunds.filter((refund) => refund.status === "pending").length}
          </p>
        </article>
      </section>
      <section className="card p-5">
        <div className="space-y-2 text-sm">
          {refunds.length === 0 ? (
            <p className="text-muted">No hay reembolsos registrados.</p>
          ) : (
            refunds.map((refund) => (
              <article key={refund.id} className="rounded-xl border border-border bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {refund.paymentIntent.user.name ?? refund.paymentIntent.user.email}
                  </p>
                  <span className="chip">{refund.status}</span>
                </div>
                <p>Importe: {formatEur(Number(refund.amount))}</p>
                <p className="text-muted">Fecha: {formatDateTime(refund.createdAt)}</p>
                {refund.reason ? <p className="text-muted">Motivo: {refund.reason}</p> : null}
                {refund.paymentIntent.reservation ? (
                  <p className="text-muted">
                    Reserva: {refund.paymentIntent.reservation.court.name}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
