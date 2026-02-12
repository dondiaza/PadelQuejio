import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10">
        <section className="card relative overflow-hidden p-8 md:p-12">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-secondary/15" />
          <div className="absolute -bottom-20 left-24 h-56 w-56 rounded-full bg-primary/15" />
          <div className="relative grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <span className="pill">Club social y competitivo</span>
              <h1 className="text-5xl leading-none text-foreground md:text-7xl">
                RESERVA TU PISTA EN 30 SEGUNDOS
              </h1>
              <p className="max-w-md text-sm text-muted md:text-base">
                Disponibilidad en vivo, pagos online, suscripciones y control total desde admin.
                Hecho para jugadores y para operacion real del club.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/reservar" className="btn-primary">
                  Ver disponibilidad
                </Link>
                <Link href="/como-funciona" className="btn-secondary">
                  Como funciona
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <article className="card p-4">
                <p className="text-sm text-muted">Pistas activas</p>
                <p className="text-4xl text-secondary">6</p>
              </article>
              <article className="card p-4">
                <p className="text-sm text-muted">Reserva media</p>
                <p className="text-4xl text-secondary">1h</p>
              </article>
              <article className="card p-4">
                <p className="text-sm text-muted">Recordatorios</p>
                <p className="text-4xl text-secondary">24h / 2h</p>
              </article>
              <article className="card p-4">
                <p className="text-sm text-muted">Acceso</p>
                <p className="text-4xl text-secondary">Email + Google</p>
              </article>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Reservas sin friccion",
              body: "Calendario por pista, bloqueo anti-solape y confirmacion inmediata.",
            },
            {
              title: "Componente social",
              body: "Invita amigos, crea grupos y comparte partido en WhatsApp.",
            },
            {
              title: "Gestion profesional",
              body: "Calendario admin, festivos, bloqueos, pagos y auditoria completa.",
            },
          ].map((item) => (
            <article key={item.title} className="card p-5">
              <h2 className="text-2xl">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">{item.body}</p>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
