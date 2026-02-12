import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";
import { createPlanSchema } from "@/lib/validators";

export async function GET() {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const plans = await prisma.plan.findMany({
    orderBy: { price: "asc" },
  });

  return NextResponse.json({ data: plans });
}

export async function POST(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = createPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data: Prisma.PlanCreateInput = {
    name: parsed.data.name,
    description: parsed.data.description,
    price: parsed.data.price,
    billingPeriod: parsed.data.billingPeriod,
    benefits: parsed.data.benefits as Prisma.InputJsonValue,
    isActive: parsed.data.isActive,
  };

  const plan = await prisma.plan.create({
    data,
  });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "plan.create",
    entityType: "plan",
    entityId: plan.id,
  });

  return NextResponse.json({ data: plan }, { status: 201 });
}
