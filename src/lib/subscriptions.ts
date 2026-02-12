import type { Subscription } from "@prisma/client";

import { prisma } from "@/lib/prisma";

function isCurrentlyActive(subscription: Subscription, now = new Date()) {
  return subscription.status === "active" && subscription.endsAt > now;
}

export async function getEffectiveSubscription(userId: string, now = new Date()) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: { in: ["active", "past_due"] },
    },
    include: {
      plan: true,
    },
    orderBy: { endsAt: "desc" },
  });

  const stripe = subscriptions.find(
    (sub) => sub.source === "stripe" && isCurrentlyActive(sub, now),
  );
  if (stripe) {
    return stripe;
  }

  const manual = subscriptions.find(
    (sub) => sub.source === "manual_cash" && isCurrentlyActive(sub, now),
  );
  if (manual) {
    return manual;
  }

  return null;
}

export async function expireOutdatedSubscriptions(now = new Date()) {
  const result = await prisma.subscription.updateMany({
    where: {
      status: "active",
      endsAt: { lt: now },
    },
    data: {
      status: "expired",
    },
  });

  return result.count;
}
