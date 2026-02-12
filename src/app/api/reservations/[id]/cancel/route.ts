import { NextResponse } from "next/server";

import { scheduleReservationCancelledNotification } from "@/lib/notifications/scheduler";
import { requireUser } from "@/lib/rbac";
import { cancelReservation } from "@/lib/reservations";

type Params = Promise<{ id: string }>;

export async function POST(_: Request, context: { params: Params }) {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  const isAdmin =
    guard.session.user.roles.includes("admin") ||
    guard.session.user.roles.includes("staff");

  try {
    const reservation = await cancelReservation({
      reservationId: id,
      actorUserId: guard.session.user.id,
      isAdmin,
    });

    await scheduleReservationCancelledNotification({
      userId: reservation.userId,
      reservationId: reservation.id,
    });

    return NextResponse.json({ data: reservation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cancellation failed" },
      { status: 409 },
    );
  }
}
