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
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl text-primary">
            PADEL QUEJIO
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/app">Dashboard</Link>
            <Link href="/app/reservar">Reservar</Link>
            <Link href="/app/mis-reservas">Mis reservas</Link>
            <Link href="/app/suscripcion">Suscripcion</Link>
            <Link href="/app/perfil">Perfil</Link>
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
