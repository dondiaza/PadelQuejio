import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";

export async function GET(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const courtId = searchParams.get("courtId");

  const reservations = await prisma.reservation.findMany({
    where: {
      ...(courtId ? { courtId } : {}),
      ...(from || to
        ? {
            startAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: {
      user: true,
      court: true,
      paymentIntents: true,
    },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({ data: reservations });
}
