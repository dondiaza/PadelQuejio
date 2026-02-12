import { ManualSubscriptionManager } from "@/components/admin/manual-subscription-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminSubscriptionsPage() {
  const [users, plans, subscriptions] = await Promise.all([
    prisma.user.findMany({
      where: { status: "active" },
      select: { id: true, email: true, name: true },
      take: 100,
      orderBy: { createdAt: "desc" },
    }),
    prisma.plan.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { price: "asc" },
    }),
    prisma.subscription.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        plan: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <ManualSubscriptionManager
      users={users}
      plans={plans}
      subscriptions={subscriptions.map((subscription) => ({
        ...subscription,
        startedAt: subscription.startedAt.toISOString(),
        endsAt: subscription.endsAt.toISOString(),
      }))}
    />
  );
}
