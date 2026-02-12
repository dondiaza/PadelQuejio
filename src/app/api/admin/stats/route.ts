import { addDays } from "date-fns";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/rbac";
import { parseDateAsUtcMidnight } from "@/lib/time";

function minutesBetween(start: Date, end: Date) {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

export async function GET(request: Request) {
  const guard = await requireAdminOrStaff();
  if ("error" in guard) {
    return guard.error;
  }

  const { searchParams } = new URL(request.url);
  const fromQuery = searchParams.get("from");
  const toQuery = searchParams.get("to");
  const from = fromQuery ? parseDateAsUtcMidnight(fromQuery) : parseDateAsUtcMidnight(new Date().toISOString().slice(0, 10));
  const to = toQuery ? parseDateAsUtcMidnight(toQuery) : addDays(from, 30);

  const [reservations, paymentIntents, courts, openingHours, specialDates] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        startAt: { gte: from, lt: to },
      },
      select: {
        status: true,
        startAt: true,
        endAt: true,
      },
    }),
    prisma.paymentIntent.findMany({
      where: {
        status: "succeeded",
        createdAt: { gte: from, lt: to },
      },
      select: { amount: true, currency: true },
    }),
    prisma.court.findMany({
      where: { status: "active" },
      select: {
        id: true,
        baseSlotMinutes: true,
      },
    }),
    prisma.openingHour.findMany(),
    prisma.specialDate.findMany({
      where: {
        date: { gte: from, lte: to },
      },
    }),
  ]);

  const openingMap = new Map(openingHours.map((entry) => [entry.dayOfWeek, entry]));
  const specialMap = new Map(
    specialDates.map((entry) => [entry.date.toISOString().slice(0, 10), entry]),
  );

  let possibleSlots = 0;
  for (let day = new Date(from); day < to; day = addDays(day, 1)) {
    const dayKey = day.toISOString().slice(0, 10);
    const special = specialMap.get(dayKey);
    if (special?.isClosed) {
      continue;
    }

    const opening = openingMap.get(day.getUTCDay());
    const opensAt = special?.opensAt ?? opening?.opensAt;
    const closesAt = special?.closesAt ?? opening?.closesAt;
    if (!opensAt || !closesAt) {
      continue;
    }

    const openDate = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), opensAt.getUTCHours(), opensAt.getUTCMinutes(), 0, 0),
    );
    const closeDate = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), closesAt.getUTCHours(), closesAt.getUTCMinutes(), 0, 0),
    );
    const openMinutes = minutesBetween(openDate, closeDate);

    for (const court of courts) {
      possibleSlots += Math.floor(openMinutes / Math.max(30, court.baseSlotMinutes));
    }
  }

  const bookedSlots = reservations.filter((row) =>
    row.status === "confirmed" || row.status === "pending_payment",
  ).length;
  const cancelledCount = reservations.filter((row) => row.status === "cancelled").length;
  const noShowCount = reservations.filter((row) => row.status === "no_show").length;
  const occupancyPercent =
    possibleSlots === 0 ? 0 : Number(((bookedSlots / possibleSlots) * 100).toFixed(2));

  const revenueByCurrency = paymentIntents.reduce<Record<string, number>>((acc, row) => {
    const currency = row.currency.toUpperCase();
    const amount = Number(row.amount);
    acc[currency] = Number(((acc[currency] ?? 0) + amount).toFixed(2));
    return acc;
  }, {});

  return NextResponse.json({
    data: {
      from: from.toISOString(),
      to: to.toISOString(),
      reservations: {
        total: reservations.length,
        bookedSlots,
        cancelled: cancelledCount,
        noShow: noShowCount,
      },
      occupancyPercent,
      revenueByCurrency,
    },
  });
}
