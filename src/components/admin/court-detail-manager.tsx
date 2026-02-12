"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CourtDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "maintenance" | "inactive";
  baseSlotMinutes: number;
};

type CourtDetailManagerProps = {
  court: CourtDetail;
};

export function CourtDetailManager({ court }: CourtDetailManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(court);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/admin/courts/${court.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
        description: form.description,
        status: form.status,
        baseSlotMinutes: form.baseSlotMinutes,
      }),
    });
    const data = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "No se pudo guardar la pista.");
      return;
    }

    setMessage("Pista actualizada.");
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Esta accion elimina la pista. Deseas continuar?")) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/admin/courts/${court.id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "No se pudo eliminar la pista.");
      return;
    }

    router.push("/admin/pistas");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">DETALLE DE PISTA</h1>
        <p className="mt-2 text-sm text-muted">Edita datos operativos y estado de disponibilidad.</p>
      </section>
      <section className="card p-5">
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Nombre
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Slug
            <input
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              required
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Descripcion
            <textarea
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value || null }))
              }
              rows={3}
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Estado
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  status: event.target.value as CourtDetail["status"],
                }))
              }
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            >
              <option value="active">Activa</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="inactive">Inactiva</option>
            </select>
          </label>
          <label className="text-sm">
            Duracion base slot (min)
            <input
              type="number"
              min={30}
              value={form.baseSlotMinutes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, baseSlotMinutes: Number(event.target.value) }))
              }
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button type="submit" disabled={loading} className="btn-primary text-sm">
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
            <button type="button" onClick={onDelete} disabled={loading} className="btn-secondary text-sm">
              Eliminar pista
            </button>
          </div>
        </form>
        {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </section>
    </div>
  );
}
