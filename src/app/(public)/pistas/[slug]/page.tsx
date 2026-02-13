import { notFound } from "next/navigation";

import { SimplePage } from "@/components/simple-page";
import { getPublicCourts } from "@/lib/public-data";

type Params = Promise<{ slug: string }>;

export const dynamic = "force-dynamic";

export default async function CourtDetailPage(props: { params: Params }) {
  const { slug } = await props.params;
  const courts = await getPublicCourts();
  const court = courts.find((entry) => entry.slug === slug);

  if (!court) {
    notFound();
  }

  return (
    <SimplePage
      title={court.name}
      subtitle={court.description ?? "Pista de padel preparada para juego social y competitivo."}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <article className="card p-4">
          <p className="text-sm text-muted">Estado</p>
          <p className="text-2xl text-secondary">{court.status}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Slot base</p>
          <p className="text-2xl text-secondary">60 min</p>
        </article>
      </div>
    </SimplePage>
  );
}
