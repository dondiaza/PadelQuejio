import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 md:py-10">
        <section className="card sport-grid relative overflow-hidden p-7 md:p-12">
          <div className="absolute -right-20 -top-16 h-52 w-52 rounded-full bg-secondary/20" />
          <div className="absolute -bottom-24 left-28 h-60 w-60 rounded-full bg-primary/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent" />
          <div className="relative grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <span className="pill">Club social y competitivo</span>
              <h1 className="section-title text-foreground">
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
                <Link href="/login" className="btn-secondary">
                  Entrar con Google
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:pt-8">
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

        <section className="grid gap-4 md:grid-cols-2">
          <article className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl">Jugadores</h2>
              <span className="chip">mobile first</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              Reserva en dos pasos, invita al grupo y recibe recordatorios automaticos por
              email.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/registro" className="btn-primary text-sm">
                Crear cuenta
              </Link>
              <Link href="/app/reservar" className="btn-secondary text-sm">
                Entrar a reservar
              </Link>
            </div>
          </article>
          <article className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl">Recepcion / Admin</h2>
              <span className="chip">operativo diario</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              Gestion de horarios, festivos, suscripciones manuales en efectivo y auditoria de
              cambios.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/admin" className="btn-secondary text-sm">
                Ir a admin
              </Link>
              <Link href="/admin/suscripciones" className="btn-primary text-sm">
                Suscripcion manual
              </Link>
            </div>
          </article>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
