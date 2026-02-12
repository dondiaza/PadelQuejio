"use client";

import { FormEvent, useState } from "react";

type SpecialDateRow = {
  id: string;
  date: string;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
  note: string | null;
};

type SpecialDatesManagerProps = {
  initialRows: SpecialDateRow[];
};

export function SpecialDatesManager({ initialRows }: SpecialDatesManagerProps) {
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const form = new FormData(event.currentTarget);
    const isClosed = form.get("isClosed") === "on";
    const payload = {
      date: String(form.get("date") ?? ""),
      isClosed,
      opensAt: isClosed ? undefined : String(form.get("opensAt") ?? ""),
      closesAt: isClosed ? undefined : String(form.get("closesAt") ?? ""),
      note: String(form.get("note") ?? ""),
    };

    const response = await fetch("/api/admin/special-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as {
      error?: string;
      data?: {
        id: string;
        date: string;
        isClosed: boolean;
        opensAt: string | null;
        closesAt: string | null;
        note: string | null;
      };
    };
    setLoading(false);
    const createdRow = data.data;

    if (!response.ok || !createdRow) {
      setError(data.error ?? "No se pudo crear la excepcion.");
      return;
    }

    setRows((prev) => [
      {
        id: createdRow.id,
        date: createdRow.date.slice(0, 10),
        isClosed: createdRow.isClosed,
        opensAt: createdRow.opensAt ? createdRow.opensAt.slice(11, 16) : null,
        closesAt: createdRow.closesAt ? createdRow.closesAt.slice(11, 16) : null,
        note: createdRow.note,
      },
      ...prev,
    ]);
    event.currentTarget.reset();
    setMessage("Excepcion creada.");
  }

  async function onDelete(id: string) {
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/admin/special-dates/${id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "No se pudo eliminar.");
      return;
    }

    setRows((prev) => prev.filter((row) => row.id !== id));
    setMessage("Excepcion eliminada.");
  }

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">FESTIVOS Y EXCEPCIONES</h1>
        <p className="mt-2 text-sm text-muted">
          Define cierres o horarios especiales que sobreescriben el horario base.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-3xl">Nueva excepcion</h2>
        <form onSubmit={onCreate} className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Fecha
            <input
              type="date"
              name="date"
              required
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm">
            <input type="checkbox" name="isClosed" />
            Cierre total
          </label>
          <label className="text-sm">
            Apertura (si aplica)
            <input
              type="time"
              name="opensAt"
              defaultValue="08:00"
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Cierre (si aplica)
            <input
              type="time"
              name="closesAt"
              defaultValue="23:00"
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Nota
            <input
              type="text"
              name="note"
              placeholder="Torneo, mantenimiento, evento..."
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>
          <button type="submit" disabled={loading} className="btn-primary text-sm md:w-fit">
            {loading ? "Guardando..." : "Crear excepcion"}
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </section>

      <section className="card p-5">
        <h2 className="text-3xl">Calendario especial</h2>
        <div className="mt-3 space-y-2 text-sm">
          {rows.length === 0 ? (
            <p className="text-muted">No hay fechas especiales configuradas.</p>
          ) : (
            rows.map((row) => (
              <article key={row.id} className="rounded-xl border border-border bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{row.date}</p>
                  <button type="button" onClick={() => onDelete(row.id)} className="btn-secondary text-xs">
                    Eliminar
                  </button>
                </div>
                <p className="text-muted">
                  {row.isClosed
                    ? "Club cerrado"
                    : `Horario especial ${row.opensAt ?? "--"} - ${row.closesAt ?? "--"}`}
                </p>
                {row.note ? <p className="text-muted">Nota: {row.note}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
