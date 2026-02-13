import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";

import { env, isStripeConfigured, requireEnvValue } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";

const checkoutSchema = z.object({
  reservationId: z.string(),
});

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 },
    );
  }

  const stripe = new Stripe(requireEnvValue("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-01-28.clover",
  });

  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const reservation = await prisma.reservation.findFirst({
    where: {
      id: parsed.data.reservationId,
      userId: guard.session.user.id,
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  if (reservation.status !== "pending_payment") {
    return NextResponse.json(
      { error: "Reservation does not require payment" },
      { status: 409 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: guard.session.user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: reservation.currency.toLowerCase(),
          product_data: {
            name: "Reserva de pista",
            description: `Reserva ${reservation.startAt.toISOString()} - ${reservation.endAt.toISOString()}`,
          },
          unit_amount: Math.round(Number(reservation.priceTotal) * 100),
        },
      },
    ],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/app/mis-reservas/${reservation.id}?paid=1`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/app/mis-reservas/${reservation.id}?paid=0`,
    metadata: {
      reservationId: reservation.id,
      userId: guard.session.user.id,
    },
  });

  await prisma.paymentIntent.upsert({
    where: {
      provider_providerIntentId: {
        provider: "stripe",
        providerIntentId: session.id,
      },
    },
    update: {
      reservationId: reservation.id,
      amount: reservation.priceTotal,
      currency: reservation.currency,
      status: "pending",
      userId: guard.session.user.id,
    },
    create: {
      reservationId: reservation.id,
      userId: guard.session.user.id,
      provider: "stripe",
      providerIntentId: session.id,
      amount: reservation.priceTotal,
      currency: reservation.currency,
      status: "pending",
    },
  });

  return NextResponse.json({
    data: {
      checkoutUrl: session.url,
      sessionId: session.id,
    },
  });
}
