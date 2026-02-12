"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/app";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);
    if (!result || result.error) {
      setError("Credenciales invalidas o usuario bloqueado.");
      return;
    }

    window.location.href = result.url ?? callbackUrl;
  }

  return (
    <div className="card mx-auto w-full max-w-md p-6">
      <h1 className="text-4xl">ENTRAR</h1>
      <p className="mt-1 text-sm text-muted">Accede con email o Google.</p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
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
          Contrasena
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
          {loading ? "Validando..." : "Entrar"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="btn-secondary mt-3 w-full text-sm"
      >
        Continuar con Google
      </button>
    </div>
  );
}
