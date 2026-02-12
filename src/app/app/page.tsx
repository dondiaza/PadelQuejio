import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveSubscription } from "@/lib/subscriptions";

export default async function AppDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const [nextReservations, subscription] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        userId: session.user.id,
        startAt: { gte: new Date() },
      },
      include: { court: true },
      orderBy: { startAt: "asc" },
      take: 3,
    }),
    getEffectiveSubscription(session.user.id),
  ]);

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="text-5xl">HOLA, {session.user.name?.split(" ")[0] ?? "Jugador"}</h1>
        <p className="mt-2 text-sm text-muted">
          Gestiona tus reservas, pagos e invitaciones desde una sola vista.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/app/reservar" className="btn-primary text-sm">
            Nueva reserva
          </Link>
          <Link href="/app/mis-reservas" className="btn-secondary text-sm">
            Ver historial
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card p-5">
          <h2 className="text-3xl">Proximas reservas</h2>
          <div className="mt-3 space-y-2 text-sm">
            {nextReservations.length === 0 ? (
              <p className="text-muted">No tienes reservas proximas.</p>
            ) : (
              nextReservations.map((reservation) => (
                <p key={reservation.id}>
                  {reservation.court.name}: {reservation.startAt.toISOString().replace("T", " ").slice(0, 16)}
                </p>
              ))
            )}
          </div>
        </article>
        <article className="card p-5">
          <h2 className="text-3xl">Suscripcion activa</h2>
          {subscription ? (
            <div className="mt-3 text-sm">
              <p>Plan: {subscription.plan.name}</p>
              <p>Fuente: {subscription.source}</p>
              <p>Valida hasta: {subscription.endsAt.toISOString().slice(0, 10)}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">Sin plan activo.</p>
          )}
        </article>
      </section>
    </div>
  );
}
