import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function AdminReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    include: {
      court: true,
      user: true,
    },
    orderBy: { startAt: "desc" },
    take: 50,
  });

  return (
    <section className="card p-6">
      <h1 className="text-5xl">RESERVAS</h1>
      <p className="mt-2 text-sm text-muted">Gestion diaria y seguimiento de estado.</p>
      <div className="mt-4 space-y-2 text-sm">
        {reservations.map((reservation) => (
          <Link
            key={reservation.id}
            href={`/admin/reservas/${reservation.id}`}
            className="block rounded-xl border border-border bg-white p-3"
          >
            <p className="font-semibold">{reservation.court.name}</p>
            <p>{reservation.user.name ?? reservation.user.email}</p>
            <p>{reservation.startAt.toISOString().replace("T", " ").slice(0, 16)}</p>
            <p className="text-muted">Estado: {reservation.status}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
