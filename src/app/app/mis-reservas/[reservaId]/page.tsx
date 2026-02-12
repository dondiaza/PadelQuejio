import { notFound } from "next/navigation";

import { ReservationActions } from "@/components/reservations/reservation-actions";
import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
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
      <h1 className="section-title">DETALLE RESERVA</h1>
      <div className="mt-4 grid gap-2 text-sm">
        <p>Pista: {reservation.court.name}</p>
        <p>Inicio: {formatDateTime(reservation.startAt)}</p>
        <p>Fin: {formatDateTime(reservation.endAt)}</p>
        <p>Estado: {reservation.status}</p>
        <p>Cancelacion hasta: {formatDateTime(reservation.cancellationDeadlineAt)}</p>
      </div>

      <div className="mt-5">
        <ReservationActions reservationId={reservation.id} isCancellable={isCancellable} />
      </div>
    </section>
  );
}
