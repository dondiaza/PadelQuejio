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

function formatHour(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  }).format(new Date(value));
}

const reasonMap: Record<string, string> = {
  outside_booking_window: "Fuera de ventana de reserva de tu plan",
  max_active_reservations_reached: "Has alcanzado el maximo de reservas activas",
  subscription_required: "Necesitas una suscripcion activa",
  subscription_past_due: "Tu suscripcion esta pendiente de pago",
};

export function ReserveForm({ courts }: ReserveFormProps) {
  const [date, setDate] = useState(today);
  const [courtId, setCourtId] = useState(courts[0]?.id ?? "");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [paymentMode, setPaymentMode] = useState<"club" | "online">("club");
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
        requiresPayment: paymentMode === "online",
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      data?: { id: string; status: string };
    };

    if (!response.ok) {
      setSubmitting(false);
      setError(payload.error ?? "No se pudo crear la reserva.");
      return;
    }

    if (paymentMode === "online" && payload.data?.id && payload.data.status === "pending_payment") {
      const checkoutResponse = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: payload.data.id }),
      });
      const checkoutPayload = (await checkoutResponse.json()) as {
        error?: string;
        data?: { checkoutUrl?: string };
      };

      if (!checkoutResponse.ok || !checkoutPayload.data?.checkoutUrl) {
        setSubmitting(false);
        setError(checkoutPayload.error ?? "No se pudo iniciar el pago.");
        return;
      }

      window.location.href = checkoutPayload.data.checkoutUrl;
      return;
    }

    setSubmitting(false);
    setSelectedSlot(null);
    setSuccess(`Reserva confirmada: ${payload.data?.id ?? ""}`);
  }

  return (
    <section className="card p-6">
      <h1 className="section-title">RESERVAR PISTA</h1>
      <p className="mt-2 text-sm text-muted">
        Selecciona fecha, pista y franja. Sin solapes y con disponibilidad en tiempo real.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="text-sm">
          Fecha
          <input
            type="date"
            value={date}
            min={today()}
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

        <fieldset className="rounded-xl border border-border bg-white px-3 py-2 text-sm">
          <legend className="px-1 text-xs text-muted">Metodo de pago</legend>
          <div className="mt-1 flex items-center gap-3">
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="paymentMode"
                checked={paymentMode === "club"}
                onChange={() => setPaymentMode("club")}
              />
              En club
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="paymentMode"
                checked={paymentMode === "online"}
                onChange={() => setPaymentMode("online")}
              />
              Online
            </label>
          </div>
        </fieldset>
      </div>

      <div className="mt-6">
        <h2 className="text-3xl">Slots disponibles {selectedCourt ? `en ${selectedCourt.name}` : ""}</h2>
        {availabilityQuery.isPending ? <p className="mt-2 text-sm text-muted">Cargando...</p> : null}
        {availabilityQuery.isError ? (
          <p className="mt-2 text-sm text-danger">
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
              className={`rounded-2xl border px-3 py-3 text-left text-sm transition ${
                selectedSlot?.startAt === slot.startAt
                  ? "border-secondary bg-secondary/10"
                  : "border-border bg-white"
              } ${!slot.bookable ? "cursor-not-allowed opacity-70" : "hover:border-secondary/50"}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {formatHour(slot.startAt)} - {formatHour(slot.endAt)}
                </p>
                <span className={`chip ${slot.bookable ? "" : "border-red-200 text-red-700"}`}>
                  {slot.bookable ? "Disponible" : "Bloqueada"}
                </span>
              </div>
              <p className="mt-1 text-muted">
                {slot.price} {slot.currency}
              </p>
              {!slot.bookable ? (
                <p className="mt-1 text-xs text-danger">{reasonMap[slot.reason ?? ""] ?? slot.reason}</p>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!selectedSlot || submitting}
          onClick={confirmReservation}
          className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Confirmando..."
            : paymentMode === "online"
              ? "Confirmar y pagar online"
              : "Confirmar reserva"}
        </button>
        {selectedSlot ? (
          <p className="text-sm text-muted">
            Slot: {formatHour(selectedSlot.startAt)} - {formatHour(selectedSlot.endAt)}
          </p>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-success">{success}</p> : null}
    </section>
  );
}
