import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicCourts } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function CourtsPage() {
  const courts = await getPublicCourts();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <section className="card p-8">
          <h1 className="text-5xl">NUESTRAS PISTAS</h1>
          <p className="mt-2 text-muted">
            Elige pista por ambiente, orientacion y ritmo de juego.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {courts.map((court) => (
              <article key={court.id} className="card p-5">
                <p className="pill inline-flex">{court.status}</p>
                <h2 className="mt-3 text-3xl">{court.name}</h2>
                <p className="mt-2 text-sm text-muted">
                  {court.description ?? "Pista profesional de cristal con iluminacion premium."}
                </p>
                <div className="mt-4">
                  <Link className="btn-secondary text-sm" href={`/pistas/${court.slug}`}>
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
