import Link from "next/link";

import { auth } from "@/lib/auth";
import { formatDateTime, formatEur } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const payments = await prisma.paymentIntent.findMany({
    where: { userId: session.user.id },
    include: {
      refunds: true,
      reservation: {
        include: { court: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const paidTotal = payments
    .filter((payment) => payment.status === "succeeded")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  const pendingTotal = payments
    .filter((payment) => payment.status === "pending" || payment.status === "requires_action")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">PAGOS</h1>
        <p className="mt-2 text-sm text-muted">Historial de cobros y estado de transacciones.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-4">
          <p className="text-sm text-muted">Total pagado</p>
          <p className="text-4xl text-secondary">{formatEur(paidTotal)}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Pendiente</p>
          <p className="text-4xl text-secondary">{formatEur(pendingTotal)}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Transacciones</p>
          <p className="text-4xl text-secondary">{payments.length}</p>
        </article>
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl">Movimientos</h2>
          <Link href="/app/pagos/facturas" className="btn-secondary text-xs">
            Ver facturas
          </Link>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {payments.length === 0 ? (
            <p className="text-muted">Todavia no tienes pagos registrados.</p>
          ) : (
            payments.map((payment) => (
              <article key={payment.id} className="rounded-xl border border-border bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {payment.reservation?.court.name ?? "Suscripcion / Cargo general"}
                  </p>
                  <p className="chip">{payment.status}</p>
                </div>
                <p>Importe: {formatEur(Number(payment.amount))}</p>
                <p className="text-muted">Proveedor: {payment.provider}</p>
                <p className="text-muted">Fecha: {formatDateTime(payment.createdAt)}</p>
                {payment.refunds.length > 0 ? (
                  <p className="text-xs text-muted">Reembolsos asociados: {payment.refunds.length}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
