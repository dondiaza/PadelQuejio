import { subHours } from "date-fns";

import { prisma } from "@/lib/prisma";

export async function scheduleReservationConfirmedNotifications(input: {
  userId: string;
  reservationId: string;
  startAt: Date;
}) {
  const now = new Date();
  const reminders = [
    { key: "reservation.reminder_24h", date: subHours(input.startAt, 24) },
    { key: "reservation.reminder_2h", date: subHours(input.startAt, 2) },
  ].filter((reminder) => reminder.date > now);

  await prisma.notification.create({
    data: {
      userId: input.userId,
      reservationId: input.reservationId,
      channel: "email",
      templateKey: "reservation.confirmed",
      payload: {
        reservationId: input.reservationId,
      },
      scheduledFor: now,
    },
  });

  if (reminders.length === 0) {
    return;
  }

  await prisma.notification.createMany({
    data: reminders.map((reminder) => ({
      userId: input.userId,
      reservationId: input.reservationId,
      channel: "email",
      templateKey: reminder.key,
      payload: {
        reservationId: input.reservationId,
      },
      scheduledFor: reminder.date,
    })),
  });
}

export async function scheduleReservationCancelledNotification(input: {
  userId: string;
  reservationId: string;
}) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      reservationId: input.reservationId,
      channel: "email",
      templateKey: "reservation.cancelled",
      payload: {
        reservationId: input.reservationId,
      },
      scheduledFor: new Date(),
    },
  });
}
