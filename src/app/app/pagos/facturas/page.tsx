import { auth } from "@/lib/auth";
import { formatDate, formatEur } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">FACTURAS</h1>
        <p className="mt-2 text-sm text-muted">
          Consulta tus facturas y recibos emitidos por reservas o suscripciones.
        </p>
      </section>

      <section className="card p-5">
        <div className="space-y-2 text-sm">
          {invoices.length === 0 ? (
            <p className="text-muted">Todavia no tienes facturas emitidas.</p>
          ) : (
            invoices.map((invoice) => (
              <article key={invoice.id} className="rounded-xl border border-border bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">Factura {invoice.number}</p>
                  <p className="chip">{formatEur(Number(invoice.amount))}</p>
                </div>
                <p className="text-muted">Fecha: {formatDate(invoice.issuedAt)}</p>
                <p className="text-muted">Moneda: {invoice.currency}</p>
                {invoice.pdfUrl ? (
                  <a href={invoice.pdfUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-secondary">
                    Abrir PDF
                  </a>
                ) : (
                  <p className="text-xs text-muted">PDF pendiente de generar</p>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
