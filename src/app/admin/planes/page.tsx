import { PlansManager } from "@/components/admin/plans-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { price: "asc" },
  });

  return (
    <PlansManager
      initialPlans={plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: Number(plan.price),
        billingPeriod: plan.billingPeriod,
        isActive: plan.isActive,
        benefits: (plan.benefits as Record<string, unknown>) ?? {},
      }))}
    />
  );
}
