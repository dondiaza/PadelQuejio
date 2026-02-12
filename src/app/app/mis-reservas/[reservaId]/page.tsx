import { notFound } from "next/navigation";

import { ReservationActions } from "@/components/reservations/reservation-actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ reservaId: string }>;

export default async function ReservationDetailPage(props: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const { reservaId } = await props.params;
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: reservaId,
      userId: session.user.id,
    },
    include: {
      court: true,
      invites: true,
      paymentIntents: true,
    },
  });

  if (!reservation) {
    notFound();
  }

  const isCancellable =
    reservation.status === "confirmed" || reservation.status === "pending_payment";

  return (
    <section className="card p-6">
      <h1 className="text-5xl">DETALLE RESERVA</h1>
      <div className="mt-4 grid gap-2 text-sm">
        <p>Pista: {reservation.court.name}</p>
        <p>Inicio: {reservation.startAt.toISOString().replace("T", " ").slice(0, 16)}</p>
        <p>Fin: {reservation.endAt.toISOString().replace("T", " ").slice(0, 16)}</p>
        <p>Estado: {reservation.status}</p>
        <p>Cancelacion hasta: {reservation.cancellationDeadlineAt.toISOString().replace("T", " ").slice(0, 16)}</p>
      </div>

      <div className="mt-5">
        <ReservationActions reservationId={reservation.id} isCancellable={isCancellable} />
      </div>
    </section>
  );
}
