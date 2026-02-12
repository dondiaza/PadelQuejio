"use client";

import { useState } from "react";

type ReservationActionsProps = {
  reservationId: string;
  isCancellable: boolean;
};

export function ReservationActions({ reservationId, isCancellable }: ReservationActionsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function cancelReservation() {
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
      method: "POST",
    });
    const payload = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "No se pudo cancelar.");
      return;
    }

    setMessage("Reserva cancelada correctamente.");
  }

  async function inviteFriend() {
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/reservations/${reservationId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const payload = (await response.json()) as { error?: string; data?: { inviteUrl: string } };
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "No se pudo crear invitacion.");
      return;
    }

    setMessage(`Invitacion creada: ${payload.data?.inviteUrl ?? ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="btn-secondary text-sm"
        disabled={loading}
        onClick={inviteFriend}
      >
        Invitar amigos
      </button>
      <button
        type="button"
        className="btn-primary text-sm disabled:opacity-60"
        disabled={loading || !isCancellable}
        onClick={cancelReservation}
      >
        Cancelar reserva
      </button>
      {message ? <p className="text-sm text-secondary">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
