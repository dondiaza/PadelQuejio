import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      passwordHash: true,
      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const hasGoogle = user.accounts.some((account) => account.provider === "google");
  const hasPassword = Boolean(user.passwordHash);

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">SEGURIDAD</h1>
        <p className="mt-2 text-sm text-muted">
          Gestiona tus metodos de acceso y buenas practicas de cuenta.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card p-5">
          <h2 className="text-3xl">Metodos de acceso</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>Email principal: {user.email}</p>
            <p>Contrasena local: {hasPassword ? "Activa" : "No configurada"}</p>
            <p>Google (Gmail): {hasGoogle ? "Vinculado" : "No vinculado"}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/login" className="btn-secondary text-sm">
              Gestionar login
            </Link>
            <Link href="/recuperar-password" className="btn-primary text-sm">
              Cambiar contrasena
            </Link>
          </div>
        </article>
        <article className="card p-5">
          <h2 className="text-3xl">Recomendaciones</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Usa una contrasena unica y larga para acceso local.</li>
            <li>Activa Google para simplificar acceso rapido desde movil.</li>
            <li>Cierra sesion en dispositivos compartidos tras reservar.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
