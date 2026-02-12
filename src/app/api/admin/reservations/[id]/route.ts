import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";
import { cancelReservation, createReservation } from "@/lib/reservations";
import { adminMoveReservationSchema } from "@/lib/validators";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, context: { params: Params }) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = adminMoveReservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  try {
    const newReservation = await createReservation({
      userId: existing.userId,
      courtId: parsed.data.courtId,
      startAt: new Date(parsed.data.startAt),
      endAt: parsed.data.endAt ? new Date(parsed.data.endAt) : undefined,
      requiresPayment: false,
    });

    await cancelReservation({
      reservationId: existing.id,
      actorUserId: guard.session.user.id,
      isAdmin: true,
    });

    await writeAuditLog({
      actorUserId: guard.session.user.id,
      action: "reservation.reschedule",
      entityType: "reservation",
      entityId: newReservation.id,
      meta: {
        fromReservationId: existing.id,
        fromCourtId: existing.courtId,
        fromStartAt: existing.startAt.toISOString(),
        toCourtId: newReservation.courtId,
        toStartAt: newReservation.startAt.toISOString(),
      },
    });

    return NextResponse.json({
      data: {
        previousReservationId: existing.id,
        newReservation,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Reschedule failed" },
      { status: 409 },
    );
  }
}
