"use client";

import { FormEvent, useState } from "react";

type CourtRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  baseSlotMinutes: number;
};

type CourtsManagerProps = {
  initialCourts: CourtRow[];
};

export function CourtsManager({ initialCourts }: CourtsManagerProps) {
  const [courts, setCourts] = useState(initialCourts);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      slug: String(form.get("slug") ?? ""),
      description: String(form.get("description") ?? ""),
      baseSlotMinutes: Number(form.get("baseSlotMinutes") ?? "60"),
      status: "active",
    };

    const response = await fetch("/api/admin/courts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string; data?: CourtRow };
    setLoading(false);
    const createdCourt = data.data;
    if (!response.ok || !createdCourt) {
      setMessage(data.error ?? "No se pudo crear la pista.");
      return;
    }

    setCourts((prev) => [createdCourt, ...prev]);
    setMessage("Pista creada.");
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="text-5xl">PISTAS</h1>
        <p className="mt-2 text-sm text-muted">Alta y control de pistas activas.</p>

        <form onSubmit={onSubmit} className="mt-5 grid gap-3 md:grid-cols-2">
          <input
            name="name"
            required
            placeholder="Nombre de pista"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <input
            name="slug"
            required
            placeholder="slug-pista"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <input
            name="description"
            placeholder="Descripcion"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm md:col-span-2"
          />
          <input
            name="baseSlotMinutes"
            defaultValue={60}
            type="number"
            min={30}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? "Guardando..." : "Crear pista"}
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-secondary">{message}</p> : null}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {courts.map((court) => (
          <article key={court.id} className="card p-4">
            <h2 className="text-3xl">{court.name}</h2>
            <p className="text-sm text-muted">Slug: {court.slug}</p>
            <p className="text-sm text-muted">Slot: {court.baseSlotMinutes} min</p>
            <p className="text-sm text-muted">Estado: {court.status}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
