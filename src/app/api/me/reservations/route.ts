import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";

export async function GET(request: Request) {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "upcoming";
  const now = new Date();

  const reservations = await prisma.reservation.findMany({
    where: {
      userId: guard.session.user.id,
      ...(scope === "history" ? { startAt: { lt: now } } : { startAt: { gte: now } }),
    },
    include: {
      court: true,
      invites: true,
      paymentIntents: true,
    },
    orderBy: {
      startAt: scope === "history" ? "desc" : "asc",
    },
  });

  return NextResponse.json({ data: reservations });
}
