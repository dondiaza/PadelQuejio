import { addDays } from "date-fns";
import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";
import { manualRenewSubscriptionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = manualRenewSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: parsed.data.subscriptionId },
  });

  if (!subscription || subscription.source !== "manual_cash") {
    return NextResponse.json(
      { error: "Manual subscription not found" },
      { status: 404 },
    );
  }

  const baseDate = subscription.endsAt > new Date() ? subscription.endsAt : new Date();
  const nextEnd =
    parsed.data.endsAt !== undefined
      ? new Date(parsed.data.endsAt)
      : addDays(baseDate, parsed.data.extensionDays ?? 30);

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "active",
      endsAt: nextEnd,
    },
  });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "subscription.manual_renew",
    entityType: "subscription",
    entityId: updated.id,
    meta: {
      previousEndsAt: subscription.endsAt.toISOString(),
      nextEndsAt: updated.endsAt.toISOString(),
    },
  });

  return NextResponse.json({ data: updated });
}
