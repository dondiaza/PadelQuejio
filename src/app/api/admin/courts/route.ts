import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";
import { createCourtSchema } from "@/lib/validators";

export async function GET() {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const courts = await prisma.court.findMany({
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: courts });
}

export async function POST(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = createCourtSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data: Prisma.CourtCreateInput = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    status: parsed.data.status,
    baseSlotMinutes: parsed.data.baseSlotMinutes,
    features: parsed.data.features as Prisma.InputJsonValue | undefined,
  };

  const court = await prisma.court.create({
    data,
  });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "court.create",
    entityType: "court",
    entityId: court.id,
    meta: {
      slug: court.slug,
    },
  });

  return NextResponse.json({ data: court }, { status: 201 });
}
