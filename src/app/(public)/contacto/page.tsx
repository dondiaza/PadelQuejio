import { SimplePage } from "@/components/simple-page";

export default function ContactPage() {
  return (
    <SimplePage
      title="CONTACTO"
      subtitle="Resolvemos dudas de reservas, suscripciones y operaciones de club."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <article className="card p-4">
          <h2 className="text-2xl">Atencion</h2>
          <p className="mt-2 text-sm text-muted">info@padelquejio.com</p>
          <p className="text-sm text-muted">+34 600 000 000</p>
        </article>
        <article className="card p-4">
          <h2 className="text-2xl">Horario</h2>
          <p className="mt-2 text-sm text-muted">Lunes a domingo</p>
          <p className="text-sm text-muted">08:00 - 23:00</p>
        </article>
      </div>
    </SimplePage>
  );
}
