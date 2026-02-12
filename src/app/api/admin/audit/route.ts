import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";

export async function GET(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "100");

  const logs = await prisma.auditLog.findMany({
    take: Math.min(Math.max(limit, 1), 500),
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ data: logs });
}
