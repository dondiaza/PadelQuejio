"use client";

import { FormEvent, useState } from "react";

type Preferences = {
  email: boolean;
  sms: boolean;
  push: boolean;
  reminder24h: boolean;
  reminder2h: boolean;
};

type NotificationPreferencesFormProps = {
  initial: Preferences;
};

export function NotificationPreferencesForm({ initial }: NotificationPreferencesFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState(initial);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/me/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "No se pudieron guardar las preferencias.");
      return;
    }

    setMessage("Preferencias guardadas.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-2 md:grid-cols-2">
        <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={values.email}
            onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.checked }))}
          />
          Email habilitado
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={values.sms}
            onChange={(event) => setValues((prev) => ({ ...prev, sms: event.target.checked }))}
          />
          SMS habilitado
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={values.push}
            onChange={(event) => setValues((prev) => ({ ...prev, push: event.target.checked }))}
          />
          Push habilitado
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={values.reminder24h}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, reminder24h: event.target.checked }))
            }
          />
          Recordatorio 24h
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={values.reminder2h}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, reminder2h: event.target.checked }))
            }
          />
          Recordatorio 2h
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn-primary text-sm">
        {loading ? "Guardando..." : "Guardar preferencias"}
      </button>
      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </form>
  );
}
