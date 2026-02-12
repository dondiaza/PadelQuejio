import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";

type Params = Promise<{ id: string }>;

const patchUserSchema = z.object({
  status: z.enum(["active", "blocked", "pending"]).optional(),
  name: z.string().min(2).optional(),
  phone: z.string().nullable().optional(),
});

export async function GET(_: Request, context: { params: Params }) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: { include: { role: true } },
      reservations: {
        include: { court: true },
        orderBy: { startAt: "desc" },
        take: 25,
      },
      subscriptions: {
        include: { plan: true },
        orderBy: { endsAt: "desc" },
        take: 10,
      },
      paymentIntents: {
        orderBy: { createdAt: "desc" },
        take: 25,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: user });
}

export async function PATCH(request: Request, context: { params: Params }) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = patchUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: parsed.data,
  });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "user.update",
    entityType: "user",
    entityId: id,
    meta: parsed.data,
  });

  return NextResponse.json({ data: updated });
}
