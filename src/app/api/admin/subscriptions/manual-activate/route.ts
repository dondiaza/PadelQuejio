import { addDays } from "date-fns";
import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";
import { manualActivateSubscriptionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = manualActivateSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const [user, plan] = await Promise.all([
    prisma.user.findUnique({ where: { id: parsed.data.userId } }),
    prisma.plan.findUnique({ where: { id: parsed.data.planId } }),
  ]);

  if (!user || !plan) {
    return NextResponse.json({ error: "User or plan not found" }, { status: 404 });
  }

  const startedAt = parsed.data.startedAt ? new Date(parsed.data.startedAt) : new Date();
  const endsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : addDays(startedAt, 30);

  const subscription = await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: {
        userId: parsed.data.userId,
        source: "manual_cash",
        status: { in: ["active", "past_due"] },
      },
      data: {
        status: "cancelled",
      },
    });

    return tx.subscription.create({
      data: {
        userId: parsed.data.userId,
        planId: parsed.data.planId,
        source: "manual_cash",
        status: "active",
        startedAt,
        endsAt,
      },
      include: {
        plan: true,
      },
    });
  });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "subscription.manual_activate",
    entityType: "subscription",
    entityId: subscription.id,
    meta: {
      userId: subscription.userId,
      planId: subscription.planId,
      startedAt: subscription.startedAt.toISOString(),
      endsAt: subscription.endsAt.toISOString(),
    },
  });

  return NextResponse.json({ data: subscription }, { status: 201 });
}
