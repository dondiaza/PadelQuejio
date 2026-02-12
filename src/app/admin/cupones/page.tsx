import Link from "next/link";

export default function AdminCouponsPage() {
  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">CUPONES Y PROMOS</h1>
        <p className="mt-2 text-sm text-muted">
          Modulo de promociones listo para operar con reglas de plan y pricing.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card p-5">
          <h2 className="text-3xl">Estado actual</h2>
          <p className="mt-2 text-sm text-muted">
            El MVP usa descuentos por plan (`benefits.discount_percent`) y precio base por franja.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/admin/planes" className="btn-secondary text-sm">
              Gestionar planes
            </Link>
            <Link href="/admin/ajustes" className="btn-secondary text-sm">
              Ajustar precio base
            </Link>
          </div>
        </article>

        <article className="card p-5">
          <h2 className="text-3xl">Siguiente iteracion</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted">
            <li>Codigos promocionales por fecha con limite de usos.</li>
            <li>Descuento por horario valle / primera reserva.</li>
            <li>Campanas segmentadas por tipo de usuario.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
