import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";
import { createCourtSchema } from "@/lib/validators";

type Params = Promise<{ id: string }>;

export async function GET(_: Request, context: { params: Params }) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  const court = await prisma.court.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!court) {
    return NextResponse.json({ error: "Court not found" }, { status: 404 });
  }

  return NextResponse.json({ data: court });
}

export async function PATCH(request: Request, context: { params: Params }) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = createCourtSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data: Prisma.CourtUpdateInput = {
    ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
    ...(parsed.data.slug !== undefined ? { slug: parsed.data.slug } : {}),
    ...(parsed.data.description !== undefined
      ? { description: parsed.data.description }
      : {}),
    ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
    ...(parsed.data.baseSlotMinutes !== undefined
      ? { baseSlotMinutes: parsed.data.baseSlotMinutes }
      : {}),
    ...(parsed.data.features !== undefined
      ? { features: parsed.data.features as Prisma.InputJsonValue }
      : {}),
  };

  const updated = await prisma.court.update({
    where: { id },
    data,
  });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "court.update",
    entityType: "court",
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

  await prisma.court.delete({
    where: { id },
  });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "court.delete",
    entityType: "court",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
