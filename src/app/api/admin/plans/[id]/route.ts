import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";
import { createPlanSchema } from "@/lib/validators";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, context: { params: Params }) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = createPlanSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data: Prisma.PlanUpdateInput = {
    ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
    ...(parsed.data.description !== undefined
      ? { description: parsed.data.description }
      : {}),
    ...(parsed.data.price !== undefined ? { price: parsed.data.price } : {}),
    ...(parsed.data.billingPeriod !== undefined
      ? { billingPeriod: parsed.data.billingPeriod }
      : {}),
    ...(parsed.data.benefits !== undefined
      ? { benefits: parsed.data.benefits as Prisma.InputJsonValue }
      : {}),
    ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
  };

  const plan = await prisma.plan.update({
    where: { id },
    data,
  });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "plan.update",
    entityType: "plan",
    entityId: id,
  });

  return NextResponse.json({ data: plan });
}

export async function DELETE(_: Request, context: { params: Params }) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  await prisma.plan.delete({ where: { id } });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "plan.delete",
    entityType: "plan",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
