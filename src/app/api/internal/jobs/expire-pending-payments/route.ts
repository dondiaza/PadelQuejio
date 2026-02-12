import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { expirePendingReservations } from "@/lib/reservations";
import { expireOutdatedSubscriptions } from "@/lib/subscriptions";

function isAuthorized(request: Request) {
  return request.headers.get("x-job-secret") === env.INTERNAL_JOB_SECRET;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [expiredReservations, expiredSubscriptions] = await Promise.all([
    expirePendingReservations(),
    expireOutdatedSubscriptions(),
  ]);

  return NextResponse.json({
    data: {
      expiredReservations,
      expiredSubscriptions,
    },
  });
}
