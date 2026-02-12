import Link from "next/link";

const faqItems = [
  {
    title: "No veo huecos en calendario",
    body: "Revisa la fecha, la pista seleccionada y si tu plan permite reservar con esa antelacion.",
  },
  {
    title: "Quiero pagar en efectivo",
    body: "Recepcion puede activar tu suscripcion manualmente en admin al registrar el pago cash.",
  },
  {
    title: "Acceso con Gmail",
    body: "En login pulsa 'Continuar con Google'. Si el email coincide, la cuenta queda vinculada.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">AYUDA</h1>
        <p className="mt-2 text-sm text-muted">
          Soporte para reservas, pagos, suscripciones y acceso con Google.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {faqItems.map((item) => (
          <article key={item.title} className="card p-5">
            <h2 className="text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="text-3xl">Canales de soporte</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="mailto:info@padelquejio.com" className="btn-secondary text-sm">
            info@padelquejio.com
          </a>
          <a href="tel:+34600000000" className="btn-secondary text-sm">
            +34 600 000 000
          </a>
          <Link href="/contacto" className="btn-primary text-sm">
            Contacto completo
          </Link>
        </div>
      </section>
    </div>
  );
}
