"use client";

import { FormEvent, useMemo, useState } from "react";

type SettingsMap = Record<string, unknown>;

type SettingsManagerProps = {
  initialSettings: SettingsMap;
};

function asNumber(value: unknown, fallback: number) {
  const casted = Number(value);
  return Number.isFinite(casted) ? casted : fallback;
}

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    booking_days_ahead_default: asNumber(initialSettings.booking_days_ahead_default, 14),
    pending_payment_expiry_minutes: asNumber(initialSettings.pending_payment_expiry_minutes, 10),
    cancellation_window_hours: asNumber(initialSettings.cancellation_window_hours, 12),
    base_price_per_slot: asNumber(initialSettings.base_price_per_slot, 20),
    require_subscription_to_book: Boolean(initialSettings.require_subscription_to_book),
  });

  const jsonPreview = useMemo(
    () =>
      JSON.stringify(
        {
          booking_days_ahead_default: form.booking_days_ahead_default,
          pending_payment_expiry_minutes: form.pending_payment_expiry_minutes,
          cancellation_window_hours: form.cancellation_window_hours,
          base_price_per_slot: form.base_price_per_slot,
          require_subscription_to_book: form.require_subscription_to_book,
        },
        null,
        2,
      ),
    [form],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_days_ahead_default: form.booking_days_ahead_default,
        pending_payment_expiry_minutes: form.pending_payment_expiry_minutes,
        cancellation_window_hours: form.cancellation_window_hours,
        base_price_per_slot: form.base_price_per_slot,
        require_subscription_to_book: form.require_subscription_to_book,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "No se pudieron guardar los ajustes.");
      return;
    }

    setMessage("Ajustes guardados.");
  }

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">AJUSTES</h1>
        <p className="mt-2 text-sm text-muted">
          Configuracion global de reglas de reserva y pagos.
        </p>
      </section>

      <section className="card p-5">
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Dias maximos de antelacion
            <input
              type="number"
              min={1}
              value={form.booking_days_ahead_default}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  booking_days_ahead_default: Number(event.target.value),
                }))
              }
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Expiracion de pago pendiente (min)
            <input
              type="number"
              min={1}
              value={form.pending_payment_expiry_minutes}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  pending_payment_expiry_minutes: Number(event.target.value),
                }))
              }
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Ventana de cancelacion (horas)
            <input
              type="number"
              min={0}
              value={form.cancellation_window_hours}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  cancellation_window_hours: Number(event.target.value),
                }))
              }
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Precio base por slot (EUR)
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.base_price_per_slot}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  base_price_per_slot: Number(event.target.value),
                }))
              }
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={form.require_subscription_to_book}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  require_subscription_to_book: event.target.checked,
                }))
              }
            />
            Requerir suscripcion activa para reservar
          </label>
          <button type="submit" disabled={loading} className="btn-primary text-sm md:col-span-2 md:w-fit">
            {loading ? "Guardando..." : "Guardar ajustes"}
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </section>

      <section className="card p-5">
        <h2 className="text-3xl">Payload actual</h2>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-white p-3 text-xs">
          {jsonPreview}
        </pre>
      </section>
    </div>
  );
}
