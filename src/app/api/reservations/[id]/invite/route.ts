import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { createInviteSchema } from "@/lib/validators";

type Params = Promise<{ id: string }>;

export async function POST(request: Request, context: { params: Params }) {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  const roles = guard.session.user.roles;
  const isAdmin = roles.includes("admin") || roles.includes("staff");
  if (!isAdmin && reservation.userId !== guard.session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const inviteToken = randomUUID().replaceAll("-", "");
  const invite = await prisma.reservationInvite.create({
    data: {
      reservationId: reservation.id,
      invitedName: parsed.data.invitedName,
      invitedEmail: parsed.data.invitedEmail,
      invitedPhone: parsed.data.invitedPhone,
      inviteToken,
      status: "pending",
    },
  });

  return NextResponse.json({
    data: {
      ...invite,
      inviteUrl: `${env.NEXT_PUBLIC_APP_URL}/app/mis-reservas/${reservation.id}?invite=${inviteToken}`,
    },
  });
}
