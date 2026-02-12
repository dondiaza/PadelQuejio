import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { createGroupSchema } from "@/lib/validators";

export async function GET() {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const groups = await prisma.group.findMany({
    where: { ownerUserId: guard.session.user.id },
    include: {
      members: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: groups });
}

export async function POST(request: Request) {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const group = await prisma.group.create({
    data: {
      ownerUserId: guard.session.user.id,
      name: parsed.data.name,
      members: {
        create: {
          userId: guard.session.user.id,
          role: "owner",
        },
      },
    },
    include: {
      members: true,
    },
  });

  return NextResponse.json({ data: group }, { status: 201 });
}
