import { addMinutes, subHours, subMinutes } from "date-fns";
import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

type CreateReservationInput = {
  userId: string;
  courtId: string;
  startAt: Date;
  endAt?: Date;
  requiresPayment?: boolean;
};

function overlaps(startAt: Date, endAt: Date, existingStart: Date, existingEnd: Date) {
  return startAt < existingEnd && endAt > existingStart;
}

async function validateCourtSchedule(
  tx: Prisma.TransactionClient,
  courtId: string,
  startAt: Date,
  endAt: Date,
) {
  const dayStart = new Date(
    Date.UTC(
      startAt.getUTCFullYear(),
      startAt.getUTCMonth(),
      startAt.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
  const dayOfWeek = dayStart.getUTCDay();

  const [openingHour, specialDate, blocks] = await Promise.all([
    tx.openingHour.findUnique({ where: { dayOfWeek } }),
    tx.specialDate.findFirst({ where: { date: dayStart } }),
    tx.courtBlock.findMany({
      where: {
        courtId,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    }),
  ]);

  if (specialDate?.isClosed) {
    throw new Error("Court is closed on this date");
  }

  const opensAt = specialDate?.opensAt ?? openingHour?.opensAt;
  const closesAt = specialDate?.closesAt ?? openingHour?.closesAt;

  if (!opensAt || !closesAt) {
    throw new Error("Court has no opening schedule on this date");
  }

  const openDate = new Date(
    Date.UTC(
      startAt.getUTCFullYear(),
      startAt.getUTCMonth(),
      startAt.getUTCDate(),
      opensAt.getUTCHours(),
      opensAt.getUTCMinutes(),
      0,
      0,
    ),
  );
  const closeDate = new Date(
    Date.UTC(
      startAt.getUTCFullYear(),
      startAt.getUTCMonth(),
      startAt.getUTCDate(),
      closesAt.getUTCHours(),
      closesAt.getUTCMinutes(),
      0,
      0,
    ),
  );

  if (startAt < openDate || endAt > closeDate) {
    throw new Error("Requested slot is outside opening hours");
  }

  const conflictsWithBlock = blocks.some((block) =>
    overlaps(startAt, endAt, block.startAt, block.endAt),
  );

  if (conflictsWithBlock) {
    throw new Error("Requested slot is blocked");
  }
}

export async function createReservation(input: CreateReservationInput) {
  if (input.endAt && input.endAt <= input.startAt) {
    throw new Error("Invalid reservation range");
  }

  const [settings, court] = await Promise.all([
    getSettings(),
    prisma.court.findUnique({ where: { id: input.courtId } }),
  ]);

  if (!court) {
    throw new Error("Court not found");
  }

  const endAt = input.endAt ?? addMinutes(input.startAt, court.baseSlotMinutes);
  const cancellationDeadlineAt = subHours(
    input.startAt,
    Number(settings.cancellation_window_hours),
  );

  const reservation = await prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${input.courtId}:${input.startAt.toISOString()}`}))`;

      await validateCourtSchedule(tx, input.courtId, input.startAt, endAt);

      const conflictingReservation = await tx.reservation.findFirst({
        where: {
          courtId: input.courtId,
          status: { in: ["pending_payment", "confirmed"] },
          startAt: { lt: endAt },
          endAt: { gt: input.startAt },
        },
      });

      if (conflictingReservation) {
        throw new Error("Slot already booked");
      }

      return tx.reservation.create({
        data: {
          userId: input.userId,
          courtId: input.courtId,
          startAt: input.startAt,
          endAt,
          status: input.requiresPayment ? "pending_payment" : "confirmed",
          priceTotal: Number(settings.base_price_per_slot),
          currency: String(settings.currency),
          cancellationDeadlineAt,
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  await writeAuditLog({
    actorUserId: input.userId,
    action: "reservation.create",
    entityType: "reservation",
    entityId: reservation.id,
    meta: {
      courtId: reservation.courtId,
      startAt: reservation.startAt.toISOString(),
      endAt: reservation.endAt.toISOString(),
      status: reservation.status,
    },
  });

  return reservation;
}

type CancelReservationInput = {
  reservationId: string;
  actorUserId: string;
  isAdmin: boolean;
};

export async function cancelReservation(input: CancelReservationInput) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: input.reservationId },
    include: {
      paymentIntents: {
        where: { status: "succeeded" },
      },
    },
  });

  if (!reservation) {
    throw new Error("Reservation not found");
  }

  if (
    reservation.status !== "confirmed" &&
    reservation.status !== "pending_payment"
  ) {
    throw new Error("Reservation cannot be cancelled");
  }

  if (!input.isAdmin && reservation.userId !== input.actorUserId) {
    throw new Error("Forbidden");
  }

  const settings = await getSettings();
  const now = new Date();
  const latePolicy = String(settings.late_cancellation_policy);
  const isLate = now >= reservation.cancellationDeadlineAt;

  if (isLate && latePolicy === "block" && !input.isAdmin) {
    throw new Error("Cancellation deadline exceeded");
  }

  const updated = await prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      status: "cancelled",
      cancelledAt: now,
    },
  });

  if (!isLate && reservation.paymentIntents[0]) {
    await prisma.refund.create({
      data: {
        paymentIntentId: reservation.paymentIntents[0].id,
        amount: reservation.priceTotal,
        reason: "cancelled_within_window",
        status: "pending",
      },
    });
  }

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: "reservation.cancel",
    entityType: "reservation",
    entityId: reservation.id,
    meta: {
      isLate,
      latePolicy,
      previousStatus: reservation.status,
    },
  });

  return updated;
}

export async function expirePendingReservations() {
  const settings = await getSettings();
  const expiryMinutes = Number(settings.pending_payment_expiry_minutes);
  const expirationDate = subMinutes(new Date(), expiryMinutes);

  const staleReservations = await prisma.reservation.findMany({
    where: {
      status: "pending_payment",
      createdAt: { lt: expirationDate },
    },
    select: { id: true },
  });

  if (staleReservations.length === 0) {
    return 0;
  }

  const staleIds = staleReservations.map((reservation) => reservation.id);

  await prisma.$transaction([
    prisma.reservation.updateMany({
      where: { id: { in: staleIds } },
      data: {
        status: "expired",
        expiredAt: new Date(),
      },
    }),
    prisma.auditLog.createMany({
      data: staleIds.map((id) => ({
        action: "reservation.expire_pending_payment",
        entityType: "reservation",
        entityId: id,
      })),
    }),
  ]);

  return staleIds.length;
}
