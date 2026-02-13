import { NextResponse } from "next/server";
import Stripe from "stripe";

import { writeAuditLog } from "@/lib/audit";
import { isStripeConfigured, requireEnvValue } from "@/lib/env";
import { scheduleReservationConfirmedNotifications } from "@/lib/notifications/scheduler";
import { prisma } from "@/lib/prisma";

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

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      requireEnvValue("STRIPE_WEBHOOK_SECRET"),
    );
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const providerIntentId = session.id;

    const paymentIntent = await prisma.paymentIntent.findUnique({
      where: {
        provider_providerIntentId: {
          provider: "stripe",
          providerIntentId,
        },
      },
      include: { reservation: true },
    });

    if (!paymentIntent) {
      return NextResponse.json({ received: true });
    }

    const updatedPaymentIntent = await prisma.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: {
        status: "succeeded",
      },
      include: { reservation: true },
    });

    if (
      updatedPaymentIntent.reservation &&
      updatedPaymentIntent.reservation.status === "pending_payment"
    ) {
      const reservation = await prisma.reservation.update({
        where: { id: updatedPaymentIntent.reservation.id },
        data: { status: "confirmed" },
      });

      await scheduleReservationConfirmedNotifications({
        userId: reservation.userId,
        reservationId: reservation.id,
        startAt: reservation.startAt,
      });

      await writeAuditLog({
        actorUserId: reservation.userId,
        action: "payment.succeeded_confirmed_reservation",
        entityType: "reservation",
        entityId: reservation.id,
        meta: {
          provider: "stripe",
          providerIntentId,
        },
      });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentIntent = await prisma.paymentIntent.findUnique({
      where: {
        provider_providerIntentId: {
          provider: "stripe",
          providerIntentId: session.id,
        },
      },
    });

    if (paymentIntent) {
      await prisma.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: { status: "failed" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
