import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function timeUtc(hours: number, minutes = 0) {
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
}

async function main() {
  await Promise.all(
    ["user", "admin", "staff"].map((roleName) =>
      prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      }),
    ),
  );

  const baseSettings: Record<string, unknown> = {
    booking_days_ahead_default: 14,
    pending_payment_expiry_minutes: 10,
    cancellation_window_hours: 12,
    late_cancellation_policy: "no_refund",
    currency: "EUR",
    tax_rate: 0,
    require_subscription_to_book: false,
    notifications_enabled: {
      email: true,
      sms: false,
      push: false,
    },
    base_price_per_slot: 20,
  };

  for (const [key, value] of Object.entries(baseSettings)) {
    const jsonValue = value as unknown as object;
    await prisma.setting.upsert({
      where: { key },
      update: { value: jsonValue as never },
      create: { key, value: jsonValue as never },
    });
  }

  for (let day = 0; day <= 6; day += 1) {
    await prisma.openingHour.upsert({
      where: { dayOfWeek: day },
      update: {
        opensAt: timeUtc(8, 0),
        closesAt: timeUtc(23, 0),
      },
      create: {
        dayOfWeek: day,
        opensAt: timeUtc(8, 0),
        closesAt: timeUtc(23, 0),
      },
    });
  }

  await prisma.notificationTemplate.upsert({
    where: {
      key_channel: {
        key: "reservation.confirmed",
        channel: "email",
      },
    },
    update: {
      subject: "Reserva confirmada",
      body: "Tu reserva esta confirmada. Te esperamos en pista.",
    },
    create: {
      key: "reservation.confirmed",
      channel: "email",
      subject: "Reserva confirmada",
      body: "Tu reserva esta confirmada. Te esperamos en pista.",
    },
  });

  await prisma.notificationTemplate.upsert({
    where: {
      key_channel: {
        key: "reservation.cancelled",
        channel: "email",
      },
    },
    update: {
      subject: "Reserva cancelada",
      body: "Tu reserva ha sido cancelada segun politica vigente.",
    },
    create: {
      key: "reservation.cancelled",
      channel: "email",
      subject: "Reserva cancelada",
      body: "Tu reserva ha sido cancelada segun politica vigente.",
    },
  });

  const courtsCount = await prisma.court.count();
  if (courtsCount === 0) {
    await prisma.court.createMany({
      data: [
        {
          name: "Pista Quejio 1",
          slug: "pista-quejio-1",
          description: "Pista central de cristal con iluminacion LED.",
          status: "active",
          baseSlotMinutes: 60,
          features: { indoor: false, wall: "glass" },
        },
        {
          name: "Pista Quejio 2",
          slug: "pista-quejio-2",
          description: "Pista lateral ideal para entreno y partidos sociales.",
          status: "active",
          baseSlotMinutes: 60,
          features: { indoor: false, wall: "glass" },
        },
      ],
    });
  }

  const plansCount = await prisma.plan.count();
  if (plansCount === 0) {
    await prisma.plan.createMany({
      data: [
        {
          name: "Starter",
          description: "Acceso base de socio.",
          price: 29,
          billingPeriod: "monthly",
          benefits: {
            can_book: true,
            max_active_reservations: 2,
            booking_days_ahead: 7,
            discount_percent: 0,
          },
          isActive: true,
        },
        {
          name: "Club",
          description: "Plan recomendado para jugadores frecuentes.",
          price: 45,
          billingPeriod: "monthly",
          benefits: {
            can_book: true,
            max_active_reservations: 5,
            booking_days_ahead: 14,
            discount_percent: 10,
          },
          isActive: true,
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
