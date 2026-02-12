import { formatDate, formatEur } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { issuedAt: "desc" },
    take: 100,
  });

  const total = invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">FACTURAS</h1>
        <p className="mt-2 text-sm text-muted">
          Consulta, descarga y control de importes emitidos por usuario.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-4">
          <p className="text-sm text-muted">Facturas emitidas</p>
          <p className="text-4xl text-secondary">{invoices.length}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Volumen total</p>
          <p className="text-4xl text-secondary">{formatEur(total)}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Moneda principal</p>
          <p className="text-4xl text-secondary">EUR</p>
        </article>
      </section>
      <section className="card p-5">
        <div className="space-y-2 text-sm">
          {invoices.length === 0 ? (
            <p className="text-muted">No hay facturas registradas.</p>
          ) : (
            invoices.map((invoice) => (
              <article key={invoice.id} className="rounded-xl border border-border bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {invoice.number} - {invoice.user.name ?? invoice.user.email}
                  </p>
                  <span className="chip">{formatEur(Number(invoice.amount))}</span>
                </div>
                <p className="text-muted">Fecha: {formatDate(invoice.issuedAt)}</p>
                <p className="text-muted">Email: {invoice.user.email}</p>
                {invoice.pdfUrl ? (
                  <a href={invoice.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex text-secondary">
                    Abrir PDF
                  </a>
                ) : (
                  <p className="text-xs text-muted">PDF pendiente</p>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
