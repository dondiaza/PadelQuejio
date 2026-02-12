import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type Params = Promise<{ userId: string }>;

export default async function AdminUserDetailPage(props: { params: Params }) {
  const { userId } = await props.params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        include: { plan: true },
        orderBy: { endsAt: "desc" },
      },
      reservations: {
        include: { court: true },
        orderBy: { startAt: "desc" },
        take: 20,
      },
      paymentIntents: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <section className="card p-6">
      <h1 className="text-5xl">{user.name ?? "Usuario"}</h1>
      <p className="mt-1 text-sm text-muted">{user.email}</p>
      <p className="text-sm text-muted">Estado: {user.status}</p>
      <p className="text-sm text-muted">Telefono: {user.phone ?? "-"}</p>

      <h2 className="mt-6 text-3xl">Suscripciones</h2>
      <div className="mt-2 space-y-2 text-sm">
        {user.subscriptions.map((subscription) => (
          <div key={subscription.id} className="rounded-xl border border-border bg-white p-3">
            <p>{subscription.plan.name}</p>
            <p className="text-muted">
              {subscription.source} / {subscription.status}
            </p>
            <p className="text-muted">Vence: {subscription.endsAt.toISOString().slice(0, 10)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
