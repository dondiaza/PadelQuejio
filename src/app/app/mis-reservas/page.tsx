import Link from "next/link";

import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function MyReservationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const now = new Date();
  const [upcoming, history] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        userId: session.user.id,
        startAt: { gte: now },
      },
      include: { court: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.reservation.findMany({
      where: {
        userId: session.user.id,
        startAt: { lt: now },
      },
      include: { court: true },
      orderBy: { startAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h1 className="section-title">MIS RESERVAS</h1>
        <p className="mt-2 text-sm text-muted">
          Proximas e historico en una sola vista.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card p-5">
          <h2 className="text-3xl">Proximas</h2>
          <div className="mt-3 space-y-2">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted">Sin reservas proximas.</p>
            ) : (
              upcoming.map((reservation) => (
                <div key={reservation.id} className="rounded-xl border border-border bg-white p-3 text-sm">
                  <p className="font-semibold">{reservation.court.name}</p>
                  <p>{formatDateTime(reservation.startAt)}</p>
                  <p className="text-muted">Estado: {reservation.status}</p>
                  <Link href={`/app/mis-reservas/${reservation.id}`} className="mt-1 inline-flex text-secondary">
                    Ver detalle
                  </Link>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="card p-5">
          <h2 className="text-3xl">Historial</h2>
          <div className="mt-3 space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-muted">Sin historial todavia.</p>
            ) : (
              history.map((reservation) => (
                <div key={reservation.id} className="rounded-xl border border-border bg-white p-3 text-sm">
                  <p className="font-semibold">{reservation.court.name}</p>
                  <p>{formatDateTime(reservation.startAt)}</p>
                  <p className="text-muted">Estado: {reservation.status}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <Link href="/app/reservar" className="btn-primary inline-flex text-sm">
        Repetir reserva
      </Link>
    </div>
  );
}
