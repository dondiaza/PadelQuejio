import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getAvailabilityForCourt, getAvailabilityForDate } from "@/lib/availability";
import { availabilityQuerySchema } from "@/lib/validators";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);

  const parsed = availabilityQuerySchema.safeParse({
    date: searchParams.get("date"),
    courtId: searchParams.get("courtId") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query params", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const userId = session?.user?.id;
  if (parsed.data.courtId) {
    const availability = await getAvailabilityForCourt(
      parsed.data.date,
      parsed.data.courtId,
      userId,
    );
    return NextResponse.json({ data: availability });
  }

  const availability = await getAvailabilityForDate(parsed.data.date, userId);
  return NextResponse.json({ data: availability });
}
