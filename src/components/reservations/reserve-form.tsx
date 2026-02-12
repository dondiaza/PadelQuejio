"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

type CourtOption = {
  id: string;
  name: string;
};

type AvailabilitySlot = {
  startAt: string;
  endAt: string;
  price: number;
  currency: string;
  bookable: boolean;
  reason?: string;
};

type AvailabilityPayload = {
  data: {
    courtId: string;
    date: string;
    slots: AvailabilitySlot[];
  };
};

type ReserveFormProps = {
  courts: CourtOption[];
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ReserveForm({ courts }: ReserveFormProps) {
  const [date, setDate] = useState(today);
  const [courtId, setCourtId] = useState(courts[0]?.id ?? "");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedCourt = useMemo(
    () => courts.find((court) => court.id === courtId),
    [courtId, courts],
  );

  const availabilityQuery = useQuery({
    queryKey: ["availability", date, courtId],
    enabled: Boolean(date && courtId),
    queryFn: async () => {
      const response = await fetch(`/api/public/availability?date=${date}&courtId=${courtId}`);
      const payload = (await response.json()) as AvailabilityPayload;
      if (!response.ok) {
        throw new Error("No se pudo cargar disponibilidad.");
      }
      return payload.data.slots;
    },
  });

  const slots = availabilityQuery.data ?? [];

  async function confirmReservation() {
    if (!selectedSlot) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courtId,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        requiresPayment: false,
      }),
    });

    const payload = (await response.json()) as { error?: string; data?: { id: string } };

    setSubmitting(false);
    if (!response.ok) {
      setError(payload.error ?? "No se pudo crear la reserva.");
      return;
    }

    setSuccess(`Reserva confirmada: ${payload.data?.id ?? ""}`);
  }

  return (
    <section className="card p-6">
      <h1 className="text-5xl">RESERVAR PISTA</h1>
      <p className="mt-2 text-sm text-muted">Selecciona fecha, pista y franja.</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Fecha
          <input
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setSelectedSlot(null);
            }}
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm">
          Pista
          <select
            value={courtId}
            onChange={(event) => {
              setCourtId(event.target.value);
              setSelectedSlot(null);
            }}
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
          >
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6">
        <h2 className="text-3xl">Slots disponibles {selectedCourt ? `en ${selectedCourt.name}` : ""}</h2>
        {availabilityQuery.isPending ? <p className="mt-2 text-sm text-muted">Cargando...</p> : null}
        {availabilityQuery.isError ? (
          <p className="mt-2 text-sm text-red-600">
            {availabilityQuery.error instanceof Error
              ? availabilityQuery.error.message
              : "Error de disponibilidad."}
          </p>
        ) : null}
        {!availabilityQuery.isPending && !availabilityQuery.isError && slots.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No hay disponibilidad para esa fecha.</p>
        ) : null}

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <button
              key={slot.startAt}
              type="button"
              disabled={!slot.bookable}
              onClick={() => setSelectedSlot(slot)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                selectedSlot?.startAt === slot.startAt
                  ? "border-secondary bg-secondary/10"
                  : "border-border bg-white"
              } ${!slot.bookable ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <p className="font-semibold">
                {slot.startAt.slice(11, 16)} - {slot.endAt.slice(11, 16)}
              </p>
              <p className="text-muted">
                {slot.price} {slot.currency}
              </p>
              {!slot.bookable ? <p className="text-xs text-red-600">{slot.reason}</p> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          disabled={!selectedSlot || submitting}
          onClick={confirmReservation}
          className="btn-primary text-sm disabled:opacity-60"
        >
          {submitting ? "Confirmando..." : "Confirmar reserva"}
        </button>
        {selectedSlot ? (
          <p className="text-sm text-muted">
            {selectedSlot.startAt.slice(11, 16)} - {selectedSlot.endAt.slice(11, 16)}
          </p>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-secondary">{success}</p> : null}
    </section>
  );
}
