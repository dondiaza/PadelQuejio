import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { addGroupMemberSchema } from "@/lib/validators";

type Params = Promise<{ id: string }>;

export async function POST(request: Request, context: { params: Params }) {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  const group = await prisma.group.findUnique({
    where: { id },
  });

  if (!group || group.ownerUserId !== guard.session.user.id) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = addGroupMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const member = await prisma.groupMember.upsert({
    where: {
      groupId_userId: {
        groupId: id,
        userId: parsed.data.userId,
      },
    },
    update: {
      role: parsed.data.role,
    },
    create: {
      groupId: id,
      userId: parsed.data.userId,
      role: parsed.data.role,
    },
    include: {
      user: true,
    },
  });

  return NextResponse.json({ data: member }, { status: 201 });
}
