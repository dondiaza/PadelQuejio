import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";

type Params = Promise<{ id: string }>;

export async function GET(_: Request, context: { params: Params }) {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  const reservation = await prisma.reservation.findFirst({
    where: {
      id,
      userId: guard.session.user.id,
    },
    include: {
      court: true,
      invites: true,
      paymentIntents: true,
      notifications: true,
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  return NextResponse.json({ data: reservation });
}
