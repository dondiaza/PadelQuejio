import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { session };
}

export async function requireAdminOrStaff() {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard;
  }

  const roles = guard.session.user.roles ?? [];
  if (!roles.includes("admin") && !roles.includes("staff")) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session: guard.session };
}
