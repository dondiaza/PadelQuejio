import { addDays } from "date-fns";

import { prisma } from "@/lib/prisma";

export default async function AdminCalendarPage() {
  const today = new Date();
  const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const to = addDays(from, 1);

  const [courts, reservations] = await Promise.all([
    prisma.court.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.reservation.findMany({
      where: {
        startAt: { gte: from, lt: to },
      },
      include: {
        user: true,
        court: true,
      },
      orderBy: { startAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="text-5xl">CALENDARIO ADMIN</h1>
        <p className="mt-2 text-sm text-muted">
          Vista operativa por pista. Acciones de mover/cancelar disponibles via API.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {courts.map((court) => (
          <article key={court.id} className="card p-5">
            <h2 className="text-3xl">{court.name}</h2>
            <div className="mt-3 space-y-2 text-sm">
              {reservations.filter((reservation) => reservation.courtId === court.id).length === 0 ? (
                <p className="text-muted">Sin reservas hoy.</p>
              ) : (
                reservations
                  .filter((reservation) => reservation.courtId === court.id)
                  .map((reservation) => (
                    <div key={reservation.id} className="rounded-xl border border-border bg-white p-3">
                      <p className="font-semibold">
                        {reservation.startAt.toISOString().slice(11, 16)} -{" "}
                        {reservation.endAt.toISOString().slice(11, 16)}
                      </p>
                      <p>{reservation.user.name ?? reservation.user.email}</p>
                      <p className="text-muted">Estado: {reservation.status}</p>
                    </div>
                  ))
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
