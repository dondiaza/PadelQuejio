import Link from "next/link";

import { auth } from "@/lib/auth";

export async function SiteHeader() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  const canAccessAdmin = roles.includes("admin") || roles.includes("staff");

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl tracking-wider text-primary">
          PADEL QUEJIO
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
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
    </header>
  );
}
