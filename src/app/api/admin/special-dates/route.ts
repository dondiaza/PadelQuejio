import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";
import { parseDateAsUtcMidnight, parseTimeToDate } from "@/lib/time";
import { specialDateSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const rows = await prisma.specialDate.findMany({
    where:
      from || to
        ? {
            date: {
              ...(from ? { gte: parseDateAsUtcMidnight(from) } : {}),
              ...(to ? { lte: parseDateAsUtcMidnight(to) } : {}),
            },
          }
        : undefined,
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ data: rows });
}

export async function POST(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = specialDateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const row = await prisma.specialDate.create({
    data: {
      date: parseDateAsUtcMidnight(parsed.data.date),
      isClosed: parsed.data.isClosed,
      opensAt:
        parsed.data.isClosed || !parsed.data.opensAt
          ? null
          : parseTimeToDate(parsed.data.opensAt),
      closesAt:
        parsed.data.isClosed || !parsed.data.closesAt
          ? null
          : parseTimeToDate(parsed.data.closesAt),
      note: parsed.data.note,
    },
  });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "special_date.create",
    entityType: "special_date",
    entityId: row.id,
    meta: {
      date: row.date.toISOString(),
      isClosed: row.isClosed,
    },
  });

  return NextResponse.json({ data: row }, { status: 201 });
}
