import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";
import { courtBlockSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const courtId = searchParams.get("courtId");

  const blocks = await prisma.courtBlock.findMany({
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
      court: true,
      createdBy: true,
    },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({ data: blocks });
}

export async function POST(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = courtBlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const startAt = new Date(parsed.data.startAt);
  const endAt = new Date(parsed.data.endAt);
  if (endAt <= startAt) {
    return NextResponse.json({ error: "Invalid block range" }, { status: 400 });
  }

  const conflicting = await prisma.reservation.findFirst({
    where: {
      courtId: parsed.data.courtId,
      status: { in: ["pending_payment", "confirmed"] },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  if (conflicting) {
    return NextResponse.json(
      { error: "Cannot block slot with active reservations" },
      { status: 409 },
    );
  }

  const block = await prisma.courtBlock.create({
    data: {
      courtId: parsed.data.courtId,
      startAt,
      endAt,
      reason: parsed.data.reason,
      createdById: guard.session.user.id,
    },
  });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "court_block.create",
    entityType: "court_block",
    entityId: block.id,
    meta: {
      courtId: block.courtId,
      startAt: block.startAt.toISOString(),
      endAt: block.endAt.toISOString(),
    },
  });

  return NextResponse.json({ data: block }, { status: 201 });
}
