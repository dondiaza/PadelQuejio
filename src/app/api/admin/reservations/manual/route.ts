import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requireAdminOrStaff } from "@/lib/rbac";
import { createReservation } from "@/lib/reservations";
import { adminManualReservationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = adminManualReservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const reservation = await createReservation({
      userId: parsed.data.userId,
      courtId: parsed.data.courtId,
      startAt: new Date(parsed.data.startAt),
      endAt: parsed.data.endAt ? new Date(parsed.data.endAt) : undefined,
      requiresPayment: parsed.data.requiresPayment,
    });

    await writeAuditLog({
      actorUserId: guard.session.user.id,
      action: "reservation.manual_create",
      entityType: "reservation",
      entityId: reservation.id,
      meta: {
        targetUserId: parsed.data.userId,
      },
    });

    return NextResponse.json({ data: reservation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Manual reservation failed" },
      { status: 409 },
    );
  }
}
