import { SimplePage } from "@/components/simple-page";

const faqs = [
  {
    q: "Cuanto dura una reserva?",
    a: "Por defecto 60 minutos, configurable por pista.",
  },
  {
    q: "Se puede cancelar?",
    a: "Si, segun la politica y tu cancellation_deadline_at.",
  },
  {
    q: "Aceptais efectivo?",
    a: "Si. La suscripcion manual cash puede activarse desde admin.",
  },
];

export default function FaqPage() {
  return (
    <SimplePage title="FAQ" subtitle="Respuestas directas para jugadores y socios.">
      <div className="grid gap-3">
        {faqs.map((item) => (
          <article key={item.q} className="card p-4">
            <h2 className="text-2xl">{item.q}</h2>
            <p className="mt-1 text-sm text-muted">{item.a}</p>
          </article>
        ))}
      </div>
    </SimplePage>
  );
}
