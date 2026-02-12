"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "No se pudo crear la cuenta.");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      callbackUrl: "/app",
    });
  }

  return (
    <div className="card mx-auto w-full max-w-md p-6">
      <h1 className="text-4xl">CREAR CUENTA</h1>
      <p className="mt-1 text-sm text-muted">Cuenta lista para reservar en minutos.</p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="block text-sm">
          Nombre
          <input
            name="name"
            required
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          Telefono
          <input
            name="phone"
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          Contrasena
          <input
            name="password"
            type="password"
            minLength={8}
            required
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
          {loading ? "Creando cuenta..." : "Registrarme"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        Ya tienes cuenta? <Link href="/login" className="text-secondary">Entrar</Link>
      </p>
    </div>
  );
}
