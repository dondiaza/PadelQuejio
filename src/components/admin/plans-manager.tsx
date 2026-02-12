"use client";

import { FormEvent, useState } from "react";

type PlanRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingPeriod: "monthly" | "yearly";
  isActive: boolean;
  benefits: Record<string, unknown>;
};

type PlansManagerProps = {
  initialPlans: PlanRow[];
};

export function PlansManager({ initialPlans }: PlansManagerProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
      price: Number(form.get("price") ?? "0"),
      billingPeriod: String(form.get("billingPeriod") ?? "monthly"),
      isActive: true,
      benefits: {
        booking_days_ahead: Number(form.get("bookingDaysAhead") ?? "14"),
        max_active_reservations: Number(form.get("maxActiveReservations") ?? "4"),
        discount_percent: Number(form.get("discountPercent") ?? "0"),
      },
    };

    const response = await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string; data?: PlanRow };
    setLoading(false);
    const createdPlan = data.data;

    if (!response.ok || !createdPlan) {
      setError(data.error ?? "No se pudo crear el plan.");
      return;
    }

    setPlans((prev) => [...prev, createdPlan]);
    event.currentTarget.reset();
    setMessage("Plan creado.");
  }

  async function toggleActive(plan: PlanRow) {
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/admin/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !plan.isActive }),
    });
    const data = (await response.json()) as { error?: string; data?: PlanRow };
    setLoading(false);
    const updatedPlan = data.data;

    if (!response.ok || !updatedPlan) {
      setError(data.error ?? "No se pudo actualizar el plan.");
      return;
    }

    setPlans((prev) => prev.map((entry) => (entry.id === updatedPlan.id ? updatedPlan : entry)));
  }

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">PLANES</h1>
        <p className="mt-2 text-sm text-muted">
          Gestiona suscripciones mensuales/anuales y beneficios de reserva.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-3xl">Crear plan</h2>
        <form onSubmit={onCreate} className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            name="name"
            required
            placeholder="Nombre del plan"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <input
            name="price"
            type="number"
            min={0}
            step={0.01}
            required
            placeholder="Precio"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <select
            name="billingPeriod"
            defaultValue="monthly"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="monthly">Mensual</option>
            <option value="yearly">Anual</option>
          </select>
          <input
            name="description"
            placeholder="Descripcion"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm md:col-span-3"
          />
          <input
            name="bookingDaysAhead"
            type="number"
            min={1}
            defaultValue={14}
            placeholder="Dias antelacion"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <input
            name="maxActiveReservations"
            type="number"
            min={1}
            defaultValue={4}
            placeholder="Reservas activas max"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <input
            name="discountPercent"
            type="number"
            min={0}
            defaultValue={0}
            placeholder="Descuento %"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <button type="submit" disabled={loading} className="btn-primary text-sm md:w-fit">
            {loading ? "Guardando..." : "Crear plan"}
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.id} className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl">{plan.name}</h2>
              <span className={`chip ${plan.isActive ? "" : "border-red-200 text-red-700"}`}>
                {plan.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">{plan.description ?? "Sin descripcion"}</p>
            <p className="mt-2 text-sm">
              Precio: {plan.price} EUR /{" "}
              {plan.billingPeriod === "yearly" ? "anual" : "mensual"}
            </p>
            <p className="text-xs text-muted">
              Antelacion: {Number(plan.benefits.booking_days_ahead ?? 0)} dias, max reservas:{" "}
              {Number(plan.benefits.max_active_reservations ?? 0)}, descuento:{" "}
              {Number(plan.benefits.discount_percent ?? 0)}%
            </p>
            <button
              type="button"
              onClick={() => toggleActive(plan)}
              className="btn-secondary mt-3 text-xs"
              disabled={loading}
            >
              {plan.isActive ? "Desactivar" : "Activar"}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
