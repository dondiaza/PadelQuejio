"use client";

import { FormEvent, useState } from "react";

type UserOption = {
  id: string;
  email: string;
  name: string | null;
};

type PlanOption = {
  id: string;
  name: string;
};

type SubscriptionRow = {
  id: string;
  userId: string;
  planId: string;
  status: string;
  source: string;
  startedAt: string;
  endsAt: string;
  user: UserOption;
  plan: PlanOption;
};

type ManualSubscriptionManagerProps = {
  users: UserOption[];
  plans: PlanOption[];
  subscriptions: SubscriptionRow[];
};

export function ManualSubscriptionManager({
  users,
  plans,
  subscriptions: initialSubscriptions,
}: ManualSubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onActivate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      userId: String(form.get("userId") ?? ""),
      planId: String(form.get("planId") ?? ""),
      startedAt: new Date().toISOString(),
    };

    const response = await fetch("/api/admin/subscriptions/manual-activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string; data?: SubscriptionRow };
    setLoading(false);
    const createdSubscription = data.data;

    if (!response.ok || !createdSubscription) {
      setMessage(data.error ?? "No se pudo activar la suscripcion.");
      return;
    }

    setSubscriptions((prev) => [createdSubscription, ...prev]);
    setMessage("Suscripcion manual activada.");
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="text-5xl">SUSCRIPCION MANUAL CASH</h1>
        <p className="mt-2 text-sm text-muted">
          Activacion mensual por admin para pagos en efectivo.
        </p>
        <form onSubmit={onActivate} className="mt-4 grid gap-3 md:grid-cols-3">
          <select
            name="userId"
            required
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">Selecciona usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name ?? user.email}
              </option>
            ))}
          </select>

          <select
            name="planId"
            required
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">Selecciona plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>

          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? "Activando..." : "Activar mensualidad"}
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-secondary">{message}</p> : null}
      </section>

      <section className="card p-5">
        <h2 className="text-3xl">Ultimas suscripciones</h2>
        <div className="mt-3 space-y-2 text-sm">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="rounded-xl border border-border bg-white p-3">
              <p className="font-semibold">{subscription.user.name ?? subscription.user.email}</p>
              <p>Plan: {subscription.plan.name}</p>
              <p>Fuente: {subscription.source}</p>
              <p>Estado: {subscription.status}</p>
              <p>Vence: {subscription.endsAt.slice(0, 10)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
