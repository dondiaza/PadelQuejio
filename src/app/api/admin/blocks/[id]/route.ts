import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";

type Params = Promise<{ id: string }>;

export async function DELETE(_: Request, context: { params: Params }) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await context.params;
  await prisma.courtBlock.delete({
    where: { id },
  });

  await writeAuditLog({
    actorUserId: guard.session.user.id,
    action: "court_block.delete",
    entityType: "court_block",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
