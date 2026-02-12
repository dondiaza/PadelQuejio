import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type Params = Promise<{ reservaId: string }>;

export default async function AdminReservationDetailPage(props: { params: Params }) {
  const { reservaId } = await props.params;
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservaId },
    include: {
      user: true,
      court: true,
      paymentIntents: true,
      invites: true,
    },
  });

  if (!reservation) {
    notFound();
  }

  return (
    <section className="card p-6">
      <h1 className="text-5xl">RESERVA {reservation.id.slice(0, 8)}</h1>
      <div className="mt-3 grid gap-2 text-sm">
        <p>Usuario: {reservation.user.name ?? reservation.user.email}</p>
        <p>Pista: {reservation.court.name}</p>
        <p>Inicio: {reservation.startAt.toISOString().replace("T", " ").slice(0, 16)}</p>
        <p>Fin: {reservation.endAt.toISOString().replace("T", " ").slice(0, 16)}</p>
        <p>Estado: {reservation.status}</p>
        <p>Importe: {Number(reservation.priceTotal)} {reservation.currency}</p>
      </div>
    </section>
  );
}
