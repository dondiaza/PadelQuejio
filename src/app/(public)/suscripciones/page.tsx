import { SimplePage } from "@/components/simple-page";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return (
    <SimplePage
      title="SUSCRIPCIONES"
      subtitle="Activa online con Stripe o manual en recepcion (efectivo) desde admin."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {(plans.length > 0
          ? plans
          : [
              {
                id: "starter",
                name: "Starter",
                description: "Acceso base a reservas",
                price: 29,
                billingPeriod: "monthly",
              },
              {
                id: "club",
                name: "Club",
                description: "Prioridad y descuento",
                price: 45,
                billingPeriod: "monthly",
              },
              {
                id: "pro",
                name: "Pro",
                description: "Maximo rendimiento",
                price: 69,
                billingPeriod: "monthly",
              },
            ]
        ).map((plan) => (
          <article key={plan.id} className="card p-5">
            <h2 className="text-3xl">{plan.name}</h2>
            <p className="mt-2 text-sm text-muted">{plan.description ?? "Plan mensual."}</p>
            <p className="mt-4 text-4xl text-secondary">
              {typeof plan.price === "number" ? plan.price : Number(plan.price)} EUR
            </p>
            <p className="text-sm text-muted">
              {plan.billingPeriod === "yearly" ? "Facturacion anual" : "Facturacion mensual"}
            </p>
          </article>
        ))}
      </div>
    </SimplePage>
  );
}
