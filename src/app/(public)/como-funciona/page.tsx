import { SimplePage } from "@/components/simple-page";

const steps = [
  "Elige fecha y pista en el calendario.",
  "Selecciona franja disponible y confirma.",
  "Paga online o reserva con plan/sistema manual autorizado.",
  "Recibe confirmacion inmediata y recordatorios automaticos.",
];

export default function HowItWorksPage() {
  return (
    <SimplePage
      title="COMO FUNCIONA"
      subtitle="Flujo optimizado para reservar rapido y jugar sin friccion."
    >
      <ol className="grid gap-3">
        {steps.map((step, idx) => (
          <li key={step} className="card flex items-start gap-4 p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm text-white">
              {idx + 1}
            </span>
            <p className="pt-1 text-sm">{step}</p>
          </li>
        ))}
      </ol>
    </SimplePage>
  );
}
