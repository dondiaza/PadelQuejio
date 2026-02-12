import Link from "next/link";

import { auth } from "@/lib/auth";

export async function SiteHeader() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  const canAccessAdmin = roles.includes("admin") || roles.includes("staff");

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-2xl tracking-wide">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-sm font-bold text-white">PQ</span>
          <span className="text-primary">PADEL</span>
          <span className="text-foreground">QUEJIO</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted lg:flex">
          <Link href="/pistas">Pistas</Link>
          <Link href="/tarifas">Tarifas</Link>
          <Link href="/suscripciones">Suscripciones</Link>
          <Link href="/como-funciona">Como funciona</Link>
          <Link href="/contacto">Contacto</Link>
        </nav>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Link href="/app" className="btn-secondary text-sm">
                Mi area
              </Link>
              {canAccessAdmin ? (
                <Link href="/admin" className="btn-primary text-sm">
                  Admin
                </Link>
              ) : null}
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary text-sm">
                Entrar
              </Link>
              <Link href="/registro" className="btn-primary text-sm">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 pb-3 lg:hidden">
        <details className="card px-4 py-2 text-sm text-muted">
          <summary className="cursor-pointer list-none font-semibold text-foreground">
            Menu rapido
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/pistas" className="btn-secondary text-center text-xs">
              Pistas
            </Link>
            <Link href="/tarifas" className="btn-secondary text-center text-xs">
              Tarifas
            </Link>
            <Link href="/suscripciones" className="btn-secondary text-center text-xs">
              Planes
            </Link>
            <Link href="/como-funciona" className="btn-secondary text-center text-xs">
              Flujo
            </Link>
            <Link href="/contacto" className="btn-secondary text-center text-xs">
              Contacto
            </Link>
            <Link href="/reservar" className="btn-primary text-center text-xs">
              Reservar
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
