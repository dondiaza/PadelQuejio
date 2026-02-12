import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";
import { parseDateAsUtcMidnight, parseTimeToDate } from "@/lib/time";
import { specialDateSchema } from "@/lib/validators";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, context: { params: Params }) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = specialDateSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const updated = await prisma.specialDate.update({
    where: { id },
    data: {
      ...(parsed.data.date ? { date: parseDateAsUtcMidnight(parsed.data.date) } : {}),
      ...(parsed.data.isClosed !== undefined ? { isClosed: parsed.data.isClosed } : {}),
      ...(parsed.data.opensAt !== undefined
        ? { opensAt: parseTimeToDate(parsed.data.opensAt) }
        : {}),
      ...(parsed.data.closesAt !== undefined
        ? { closesAt: parseTimeToDate(parsed.data.closesAt) }
        : {}),
      ...(parsed.data.note !== undefined ? { note: parsed.data.note } : {}),
    },
  });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "special_date.update",
    entityType: "special_date",
    entityId: updated.id,
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_: Request, context: { params: Params }) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  await prisma.specialDate.delete({ where: { id } });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "special_date.delete",
    entityType: "special_date",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
