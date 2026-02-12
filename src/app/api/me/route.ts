import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";

const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(7).nullable().optional(),
});

export async function GET() {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const user = await prisma.user.findUnique({
    where: { id: guard.session.user.id },
    include: {
      subscriptions: {
        include: { plan: true },
        orderBy: { endsAt: "desc" },
        take: 3,
      },
      userRoles: {
        include: { role: true },
      },
    },
  });

  return NextResponse.json({ data: user });
}

export async function PATCH(request: Request) {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = updateMeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: guard.session.user.id },
    data: parsed.data,
  });

  return NextResponse.json({ data: updated });
}
