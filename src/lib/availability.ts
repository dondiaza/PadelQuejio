import { addDays, addMinutes, isAfter } from "date-fns";

import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getEffectiveSubscription } from "@/lib/subscriptions";

type AvailabilitySlot = {
  startAt: string;
  endAt: string;
  price: number;
  currency: string;
  bookable: boolean;
  reason?: string;
};

type AvailabilityResponse = {
  courtId: string;
  date: string;
  slots: AvailabilitySlot[];
};

function parseDateAsUtc(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function combineDayWithTime(day: Date, time: Date) {
  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      time.getUTCHours(),
      time.getUTCMinutes(),
      0,
      0,
    ),
  );
}

function overlaps(
  startAt: Date,
  endAt: Date,
  existingStartAt: Date,
  existingEndAt: Date,
) {
  return startAt < existingEndAt && endAt > existingStartAt;
}

export async function getAvailabilityForCourt(
  date: string,
  courtId: string,
  userId?: string,
): Promise<AvailabilityResponse> {
  const dayStart = parseDateAsUtc(date);
  const dayEnd = addDays(dayStart, 1);
  const dayOfWeek = dayStart.getUTCDay();
  const now = new Date();

  const [court, openingHour, specialDate, blocks, busyReservations, settings] =
    await Promise.all([
      prisma.court.findUnique({ where: { id: courtId } }),
      prisma.openingHour.findUnique({ where: { dayOfWeek } }),
      prisma.specialDate.findFirst({
        where: { date: dayStart },
      }),
      prisma.courtBlock.findMany({
        where: {
          courtId,
          startAt: { lt: dayEnd },
          endAt: { gt: dayStart },
        },
      }),
      prisma.reservation.findMany({
        where: {
          courtId,
          status: { in: ["pending_payment", "confirmed"] },
          startAt: { lt: dayEnd },
          endAt: { gt: dayStart },
        },
      }),
      getSettings(),
    ]);

  if (!court) {
    throw new Error("Court not found");
  }

  if (specialDate?.isClosed) {
    return { courtId, date, slots: [] };
  }

  const effectiveOpen = specialDate?.opensAt ?? openingHour?.opensAt;
  const effectiveClose = specialDate?.closesAt ?? openingHour?.closesAt;

  if (!effectiveOpen || !effectiveClose) {
    return { courtId, date, slots: [] };
  }

  const openAt = combineDayWithTime(dayStart, effectiveOpen);
  const closeAt = combineDayWithTime(dayStart, effectiveClose);
  const slotMinutes = Math.max(30, court.baseSlotMinutes);

  const slots: AvailabilitySlot[] = [];

  const subscription = userId ? await getEffectiveSubscription(userId, now) : null;
  const benefits = (subscription?.plan.benefits as Record<string, unknown> | undefined) ?? {};
  const maxDaysAhead = Number(
    benefits.booking_days_ahead ?? settings.booking_days_ahead_default,
  );
  const maxActiveReservations = Number(benefits.max_active_reservations ?? Number.MAX_SAFE_INTEGER);
  const requireSubscription = Boolean(settings.require_subscription_to_book);
  const discountPercent = Number(benefits.discount_percent ?? 0);

  let userActiveReservations = 0;
  if (userId) {
    userActiveReservations = await prisma.reservation.count({
      where: {
        userId,
        status: { in: ["pending_payment", "confirmed"] },
        startAt: { gt: now },
      },
    });
  }

  for (let cursor = openAt; cursor < closeAt; cursor = addMinutes(cursor, slotMinutes)) {
    const slotEnd = addMinutes(cursor, slotMinutes);
    if (isAfter(slotEnd, closeAt)) {
      break;
    }

    const hasBlock = blocks.some((block) => overlaps(cursor, slotEnd, block.startAt, block.endAt));
    if (hasBlock) {
      continue;
    }

    const hasReservation = busyReservations.some((reservation) =>
      overlaps(cursor, slotEnd, reservation.startAt, reservation.endAt),
    );
    if (hasReservation) {
      continue;
    }

    const slotStartIso = cursor.toISOString();
    const slotEndIso = slotEnd.toISOString();

    let reason: string | undefined;
    let bookable = true;

    if (userId) {
      const latestBookableDate = addDays(new Date(), maxDaysAhead);
      if (cursor > latestBookableDate) {
        bookable = false;
        reason = "outside_booking_window";
      } else if (userActiveReservations >= maxActiveReservations) {
        bookable = false;
        reason = "max_active_reservations_reached";
      } else if (requireSubscription && !subscription) {
        bookable = false;
        reason = "subscription_required";
      } else if (
        subscription?.status === "past_due" &&
        cursor > now
      ) {
        bookable = false;
        reason = "subscription_past_due";
      }
    }

    const basePrice = Number(settings.base_price_per_slot);
    const discountedPrice = Math.max(basePrice - (basePrice * discountPercent) / 100, 0);

    slots.push({
      startAt: slotStartIso,
      endAt: slotEndIso,
      price: Number(discountedPrice.toFixed(2)),
      currency: String(settings.currency),
      bookable,
      reason,
    });
  }

  return {
    courtId,
    date,
    slots,
  };
}

export async function getAvailabilityForDate(date: string, userId?: string) {
  const courts = await prisma.court.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
  });

  const availability = await Promise.all(
    courts.map((court) => getAvailabilityForCourt(date, court.id, userId)),
  );

  return availability;
}
