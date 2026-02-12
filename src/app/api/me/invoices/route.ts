import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";

export async function GET() {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const rows = await prisma.invoice.findMany({
    where: { userId: guard.session.user.id },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json({ data: rows });
}
