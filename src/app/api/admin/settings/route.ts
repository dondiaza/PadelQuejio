import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";

const updateSettingsSchema = z.record(z.string(), z.unknown());

export async function GET() {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const settings = await prisma.setting.findMany({
    orderBy: { key: "asc" },
  });

  return NextResponse.json({ data: settings });
}

export async function PUT(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  await prisma.$transaction(
    Object.entries(parsed.data).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: {
          value: value as Prisma.InputJsonValue,
          updatedBy: guard.session.user.id,
        },
        create: {
          key,
          value: value as Prisma.InputJsonValue,
          updatedBy: guard.session.user.id,
        },
      }),
    ),
  );

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "settings.update_bulk",
    entityType: "settings",
    entityId: "global",
    meta: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
