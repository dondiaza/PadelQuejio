import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/app");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/80 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="text-2xl tracking-wide">
            <span className="text-primary">PADEL</span> QUEJIO
          </Link>
          <nav className="flex max-w-full flex-1 items-center gap-2 overflow-x-auto pb-1 text-sm md:justify-center md:pb-0">
            <Link href="/app" className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs">
              Dashboard
            </Link>
            <Link href="/app/reservar" className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs">
              Reservar
            </Link>
            <Link
              href="/app/mis-reservas"
              className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs"
            >
              Mis reservas
            </Link>
            <Link
              href="/app/suscripcion"
              className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs"
            >
              Suscripcion
            </Link>
            <Link href="/app/perfil" className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs">
              Perfil
            </Link>
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">{children}</main>
    </div>
  );
}
