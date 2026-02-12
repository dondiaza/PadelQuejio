"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type UserOption = {
  id: string;
  label: string;
};

type CreateGroupFormProps = {
  onCreated?: () => void;
};

export function CreateGroupForm({ onCreated }: CreateGroupFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = { name: String(form.get("name") ?? "") };

    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "No se pudo crear el grupo.");
      return;
    }

    event.currentTarget.reset();
    setMessage("Grupo creado correctamente.");
    onCreated?.();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[1fr_auto]">
      <input
        name="name"
        required
        minLength={2}
        placeholder="Nombre del grupo (ej. Los del jueves)"
        className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
      />
      <button type="submit" disabled={loading} className="btn-primary text-sm">
        {loading ? "Creando..." : "Crear grupo"}
      </button>
      {message ? <p className="text-sm text-success md:col-span-2">{message}</p> : null}
      {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
    </form>
  );
}

type AddGroupMemberFormProps = {
  groupId: string;
  users: UserOption[];
  onAdded?: () => void;
};

export function AddGroupMemberForm({ groupId, users, onAdded }: AddGroupMemberFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      userId: String(form.get("userId") ?? ""),
      role: String(form.get("role") ?? "member"),
    };

    const response = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "No se pudo agregar el miembro.");
      return;
    }

    setMessage("Miembro agregado.");
    onAdded?.();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
      <select
        name="userId"
        required
        defaultValue=""
        className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
      >
        <option value="" disabled>
          Selecciona usuario
        </option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.label}
          </option>
        ))}
      </select>
      <select
        name="role"
        defaultValue="member"
        className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
      >
        <option value="member">Miembro</option>
        <option value="owner">Owner</option>
      </select>
      <button type="submit" disabled={loading} className="btn-secondary text-sm">
        {loading ? "Guardando..." : "Agregar"}
      </button>
      {message ? <p className="text-sm text-success md:col-span-3">{message}</p> : null}
      {error ? <p className="text-sm text-danger md:col-span-3">{error}</p> : null}
    </form>
  );
}
