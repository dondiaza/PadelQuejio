import { SimplePage } from "@/components/simple-page";

export default function PricingPage() {
  return (
    <SimplePage
      title="TARIFAS CLARAS"
      subtitle="Precio por franja visible antes de confirmar. Sin sorpresas."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <article className="card p-4">
          <h2 className="text-2xl">Hora valle</h2>
          <p className="text-sm text-muted">Lunes a viernes 08:00-17:00</p>
          <p className="mt-4 text-4xl text-secondary">20 EUR</p>
        </article>
        <article className="card p-4">
          <h2 className="text-2xl">Hora punta</h2>
          <p className="text-sm text-muted">Tardes y fin de semana</p>
          <p className="mt-4 text-4xl text-secondary">26 EUR</p>
        </article>
        <article className="card p-4">
          <h2 className="text-2xl">Socios</h2>
          <p className="text-sm text-muted">Descuento por plan activo</p>
          <p className="mt-4 text-4xl text-secondary">-15%</p>
        </article>
      </div>
    </SimplePage>
  );
}
