import { Resend } from "resend";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

function renderDefaultTemplate(templateKey: string, payload: Record<string, unknown>) {
  if (templateKey === "reservation.confirmed") {
    return "Tu reserva ha sido confirmada.";
  }

  if (templateKey === "reservation.cancelled") {
    return "Tu reserva ha sido cancelada.";
  }

  if (templateKey === "reservation.reminder_24h") {
    return "Recordatorio: tienes partido en 24 horas.";
  }

  if (templateKey === "reservation.reminder_2h") {
    return "Recordatorio: tienes partido en 2 horas.";
  }

  if (templateKey === "payment.failed") {
    return "No se pudo procesar tu pago.";
  }

  return `Notificacion ${templateKey}: ${JSON.stringify(payload)}`;
}

export async function processScheduledNotifications(limit = 100) {
  const due = await prisma.notification.findMany({
    where: {
      status: "queued",
      scheduledFor: { lte: new Date() },
    },
    include: {
      user: true,
    },
    orderBy: { scheduledFor: "asc" },
    take: limit,
  });

  for (const notification of due) {
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: {
          key_channel: {
            key: notification.templateKey,
            channel: notification.channel,
          },
        },
      });

      const subject =
        template?.subject ??
        `Padel Quejio - ${notification.templateKey.replaceAll(".", " ")}`;
      const body = template?.body
        ? template.body
        : renderDefaultTemplate(
            notification.templateKey,
            (notification.payload as Record<string, unknown>) ?? {},
          );

      if (notification.channel === "email") {
        if (!resend) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: "failed",
            },
          });
          continue;
        }

        await resend.emails.send({
          from: "Padel Quejio <no-reply@padelquejio.com>",
          to: notification.user.email,
          subject,
          html: `<p>${body}</p>`,
        });
      }

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: "sent",
          sentAt: new Date(),
        },
      });
    } catch {
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: "failed",
        },
      });
    }
  }

  return due.length;
}
