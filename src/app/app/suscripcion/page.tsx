import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveSubscription } from "@/lib/subscriptions";

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const [current, plans] = await Promise.all([
    getEffectiveSubscription(session.user.id),
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="text-5xl">MI SUSCRIPCION</h1>
        {current ? (
          <div className="mt-3 text-sm">
            <p>Plan actual: {current.plan.name}</p>
            <p>Estado: {current.status}</p>
            <p>Fuente: {current.source}</p>
            <p>Vence: {current.endsAt.toISOString().slice(0, 10)}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No tienes suscripcion activa.</p>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="card p-4">
            <h2 className="text-3xl">{plan.name}</h2>
            <p className="text-sm text-muted">{plan.description ?? "Plan disponible."}</p>
            <p className="mt-2 text-3xl text-secondary">{Number(plan.price)} EUR</p>
          </article>
        ))}
      </section>
    </div>
  );
}
