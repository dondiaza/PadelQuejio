import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";
import { parseTimeToDate } from "@/lib/time";
import { openingHourSchema } from "@/lib/validators";

const bulkOpeningHoursSchema = z.array(openingHourSchema).min(1);

export async function GET() {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const rows = await prisma.openingHour.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ data: rows });
}

export async function PUT(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = bulkOpeningHoursSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const rows = await prisma.$transaction(
    parsed.data.map((entry) =>
      prisma.openingHour.upsert({
        where: { dayOfWeek: entry.dayOfWeek },
        update: {
          opensAt: parseTimeToDate(entry.opensAt),
          closesAt: parseTimeToDate(entry.closesAt),
        },
        create: {
          dayOfWeek: entry.dayOfWeek,
          opensAt: parseTimeToDate(entry.opensAt),
          closesAt: parseTimeToDate(entry.closesAt),
        },
      }),
    ),
  );

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "opening_hours.bulk_upsert",
    entityType: "opening_hours",
    entityId: "weekly",
    meta: {
      count: rows.length,
    },
  });

  return NextResponse.json({ data: rows });
}
