import { SimplePage } from "@/components/simple-page";
import { getPublicPlans } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const plans = await getPublicPlans();

  return (
    <SimplePage
      title="SUSCRIPCIONES"
      subtitle="Activa online con Stripe o manual en recepcion (efectivo) desde admin."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="card p-5">
            <h2 className="text-3xl">{plan.name}</h2>
            <p className="mt-2 text-sm text-muted">{plan.description ?? "Plan mensual."}</p>
            <p className="mt-4 text-4xl text-secondary">
              {plan.price} EUR
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
