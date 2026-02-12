import { formatDateTime, formatEur } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminPaymentsPage() {
  const payments = await prisma.paymentIntent.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reservation: {
        include: { court: true },
      },
      refunds: true,
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  const succeeded = payments.filter((item) => item.status === "succeeded");
  const failed = payments.filter((item) => item.status === "failed");
  const gross = succeeded.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">PAGOS</h1>
        <p className="mt-2 text-sm text-muted">
          Seguimiento de cobros online y manual cash con estado de conciliacion.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <article className="card p-4">
          <p className="text-sm text-muted">Cobros correctos</p>
          <p className="text-4xl text-secondary">{succeeded.length}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Fallidos</p>
          <p className="text-4xl text-secondary">{failed.length}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Volumen cobrado</p>
          <p className="text-4xl text-secondary">{formatEur(gross)}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Transacciones</p>
          <p className="text-4xl text-secondary">{payments.length}</p>
        </article>
      </section>
      <section className="card p-5">
        <h2 className="text-3xl">Ultimos movimientos</h2>
        <div className="mt-3 space-y-2 text-sm">
          {payments.map((payment) => (
            <article key={payment.id} className="rounded-xl border border-border bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{payment.user.name ?? payment.user.email}</p>
                <span className="chip">{payment.status}</span>
              </div>
              <p>Importe: {formatEur(Number(payment.amount))}</p>
              <p className="text-muted">
                {payment.provider} / {payment.currency}
              </p>
              <p className="text-muted">Fecha: {formatDateTime(payment.createdAt)}</p>
              {payment.reservation ? (
                <p className="text-muted">
                  Reserva: {payment.reservation.court.name} ({formatDateTime(payment.reservation.startAt)})
                </p>
              ) : null}
              {payment.refunds.length > 0 ? (
                <p className="text-muted">Reembolsos: {payment.refunds.length}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
