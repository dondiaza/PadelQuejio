import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  const canAccess = roles.includes("admin") || roles.includes("staff");

  if (!session?.user || !canAccess) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/80 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="text-2xl tracking-wide">
            <span className="text-primary">PQ</span> ADMIN
          </Link>
          <nav className="flex max-w-full flex-1 items-center gap-2 overflow-x-auto pb-1 text-sm md:justify-center md:pb-0">
            <Link href="/admin" className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs">
              Dashboard
            </Link>
            <Link
              href="/admin/calendario"
              className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs"
            >
              Calendario
            </Link>
            <Link href="/admin/pistas" className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs">
              Pistas
            </Link>
            <Link
              href="/admin/reservas"
              className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs"
            >
              Reservas
            </Link>
            <Link
              href="/admin/suscripciones"
              className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs"
            >
              Suscripciones
            </Link>
            <Link
              href="/admin/estadisticas"
              className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs"
            >
              Estadisticas
            </Link>
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">{children}</main>
    </div>
  );
}
