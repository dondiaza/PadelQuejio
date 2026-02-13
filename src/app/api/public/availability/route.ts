import { NextResponse } from "next/server";
import { addHours } from "date-fns";

import { auth } from "@/lib/auth";
import { getAvailabilityForCourt, getAvailabilityForDate } from "@/lib/availability";
import { getPublicCourts } from "@/lib/public-data";
import { availabilityQuerySchema } from "@/lib/validators";

function buildFallbackSlots(date: string) {
  const slots = [];
  const start = new Date(`${date}T08:00:00.000Z`);

  for (let hour = 0; hour < 14; hour += 1) {
    const slotStart = addHours(start, hour);
    const slotEnd = addHours(slotStart, 1);

    slots.push({
      startAt: slotStart.toISOString(),
      endAt: slotEnd.toISOString(),
      price: 20,
      currency: "EUR",
      bookable: false,
      reason: "service_unavailable",
    });
  }

  return slots;
}

export async function GET(request: Request) {
  let session: Awaited<ReturnType<typeof auth>> | null = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("Auth unavailable in public availability route:", error);
  }
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
  try {
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
  } catch (error) {
    console.error("Availability fallback engaged:", error);

    const courts = await getPublicCourts();
    if (parsed.data.courtId) {
      return NextResponse.json({
        data: {
          courtId: parsed.data.courtId,
          date: parsed.data.date,
          slots: buildFallbackSlots(parsed.data.date),
        },
      });
    }

    return NextResponse.json({
      data: courts.map((court) => ({
        courtId: court.id,
        date: parsed.data.date,
        slots: buildFallbackSlots(parsed.data.date),
      })),
    });
  }
}
