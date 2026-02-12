"use client";

import { FormEvent, useState } from "react";

type HourRow = {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
};

type OpeningHoursManagerProps = {
  initialRows: HourRow[];
};

const dayLabels = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

export function OpeningHoursManager({ initialRows }: OpeningHoursManagerProps) {
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setRow(dayOfWeek: number, key: "opensAt" | "closesAt", value: string) {
    setRows((prev) =>
      prev.map((row) =>
        row.dayOfWeek === dayOfWeek
          ? {
              ...row,
              [key]: value,
            }
          : row,
      ),
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/opening-hours", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    });
    const payload = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "No se pudieron guardar los horarios.");
      return;
    }

    setMessage("Horarios actualizados.");
  }

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">HORARIOS BASE</h1>
        <p className="mt-2 text-sm text-muted">
          Configura la apertura semanal para el calculo de disponibilidad.
        </p>
      </section>
      <section className="card p-5">
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-2">
            {rows.map((row) => (
              <article
                key={row.dayOfWeek}
                className="grid items-center gap-2 rounded-xl border border-border bg-white p-3 text-sm md:grid-cols-[180px_1fr_1fr]"
              >
                <p className="font-semibold">{dayLabels[row.dayOfWeek]}</p>
                <label className="grid gap-1">
                  <span className="text-xs text-muted">Apertura</span>
                  <input
                    type="time"
                    value={row.opensAt}
                    onChange={(event) => setRow(row.dayOfWeek, "opensAt", event.target.value)}
                    className="rounded-xl border border-border bg-white px-3 py-2"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-muted">Cierre</span>
                  <input
                    type="time"
                    value={row.closesAt}
                    onChange={(event) => setRow(row.dayOfWeek, "closesAt", event.target.value)}
                    className="rounded-xl border border-border bg-white px-3 py-2"
                  />
                </label>
              </article>
            ))}
          </div>
          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? "Guardando..." : "Guardar horarios"}
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </section>
    </div>
  );
}
