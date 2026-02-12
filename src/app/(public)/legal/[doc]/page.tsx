import { notFound } from "next/navigation";

import { SimplePage } from "@/components/simple-page";

type Params = Promise<{ doc: string }>;

const legalDocs: Record<string, { title: string; subtitle: string }> = {
  terminos: {
    title: "TERMINOS",
    subtitle: "Condiciones generales de uso y reserva.",
  },
  privacidad: {
    title: "PRIVACIDAD",
    subtitle: "Tratamiento de datos personales y derechos del usuario.",
  },
  cookies: {
    title: "COOKIES",
    subtitle: "Uso de cookies tecnicas, analiticas y de marketing.",
  },
  cancelaciones: {
    title: "CANCELACIONES",
    subtitle: "Reglas de cancelacion, reembolsos y cambios de reserva.",
  },
};

export default async function LegalDocPage(props: { params: Params }) {
  const { doc } = await props.params;
  const entry = legalDocs[doc];
  if (!entry) {
    notFound();
  }

  return (
    <SimplePage title={entry.title} subtitle={entry.subtitle}>
      <p className="text-sm text-muted">
        Este documento se gestiona desde ajustes legales del panel admin y se puede versionar.
      </p>
    </SimplePage>
  );
}
