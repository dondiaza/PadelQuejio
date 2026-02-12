import { NextResponse } from "next/server";
import { format } from "date-fns";

import { getAvailabilityForCourt } from "@/lib/availability";
import { scheduleReservationConfirmedNotifications } from "@/lib/notifications/scheduler";
import { requireUser } from "@/lib/rbac";
import { createReservation } from "@/lib/reservations";
import { createReservationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = createReservationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const startAt = new Date(parsed.data.startAt);
  const endAt = parsed.data.endAt ? new Date(parsed.data.endAt) : undefined;
  const date = format(startAt, "yyyy-MM-dd");

  const availability = await getAvailabilityForCourt(
    date,
    parsed.data.courtId,
    guard.session.user.id,
  );

  const matchingSlot = availability.slots.find((slot) => {
    const slotStart = new Date(slot.startAt).getTime();
    const slotEnd = new Date(slot.endAt).getTime();
    const requestedEnd = endAt?.getTime() ?? slotEnd;
    return slotStart === startAt.getTime() && slotEnd === requestedEnd;
  });

  if (!matchingSlot) {
    return NextResponse.json({ error: "Slot not available" }, { status: 409 });
  }

  if (!matchingSlot.bookable) {
    return NextResponse.json(
      { error: "Booking rule prevented reservation", reason: matchingSlot.reason },
      { status: 403 },
    );
  }

  try {
    const reservation = await createReservation({
      userId: guard.session.user.id,
      courtId: parsed.data.courtId,
      startAt,
      endAt,
      requiresPayment: parsed.data.requiresPayment,
    });

    if (reservation.status === "confirmed") {
      await scheduleReservationConfirmedNotifications({
        userId: guard.session.user.id,
        reservationId: reservation.id,
        startAt: reservation.startAt,
      });
    }

    return NextResponse.json({ data: reservation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Reservation failed" },
      { status: 409 },
    );
  }
}
