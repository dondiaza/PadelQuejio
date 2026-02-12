import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";

export async function GET(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const users = await prisma.user.findMany({
    where: {
      ...(status ? { status: status as "active" | "blocked" | "pending" } : {}),
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ data: users });
}
