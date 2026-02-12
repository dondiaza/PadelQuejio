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
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="text-2xl text-primary">
            PADEL QUEJIO ADMIN
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/calendario">Calendario</Link>
            <Link href="/admin/pistas">Pistas</Link>
            <Link href="/admin/suscripciones">Suscripciones</Link>
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
