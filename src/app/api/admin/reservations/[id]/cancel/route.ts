import { NextResponse } from "next/server";

import { requireAdminOrStaff } from "@/lib/rbac";
import { cancelReservation } from "@/lib/reservations";

type Params = Promise<{ id: string }>;

export async function POST(_: Request, context: { params: Params }) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;

  try {
    const reservation = await cancelReservation({
      reservationId: id,
      actorUserId: guard.session.user.id,
      isAdmin: true,
    });

    return NextResponse.json({ data: reservation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cancellation failed" },
      { status: 409 },
    );
  }
}
