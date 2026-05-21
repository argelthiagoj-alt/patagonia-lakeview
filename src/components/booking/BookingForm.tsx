"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, AlertCircle, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { computeBookingPrice } from "@/lib/booking";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import type { Cabin } from "@/data/cabins";

export type BookingUserDefaults = {
  loggedIn: boolean;
  email?: string;
  name?: string;
  documentId?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  hasSavedProfile?: boolean;
};

type Props = {
  cabin: Cabin;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  userDefaults?: BookingUserDefaults;
};

type Step = "details" | "success";
type FormError = Partial<
  Record<"checkIn" | "checkOut" | "guests" | "guestName" | "guestEmail" | "_", string>
>;

function defaultDates() {
  const t = new Date();
  const ci = new Date(t);
  ci.setDate(t.getDate() + 7);
  const co = new Date(ci);
  co.setDate(ci.getDate() + 3);
  return { ci: toDateInputValue(ci), co: toDateInputValue(co) };
}

/**
 * BookingForm — solicita la reserva (sin pago).
 *
 * Nuevo flujo:
 *   1. El huésped completa fechas + datos de contacto.
 *   2. POST /api/reservations crea una solicitud en estado PENDING.
 *   3. El anfitrión la aprueba (APPROVED).
 *   4. El huésped paga desde /dashboard/reservations/[id] (POST /api/reservations/[id]/pay).
 */
export function BookingForm({
  cabin,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  userDefaults,
}: Props) {
  const defaults = defaultDates();
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");

  const [checkIn, setCheckIn] = useState(initialCheckIn ?? defaults.ci);
  const [checkOut, setCheckOut] = useState(initialCheckOut ?? defaults.co);
  const [guests, setGuests] = useState(initialGuests ?? Math.min(2, cabin.maxGuests));
  const [guestName, setGuestName] = useState(userDefaults?.name ?? "");
  const [guestEmail, setGuestEmail] = useState(userDefaults?.email ?? "");

  const [errors, setErrors] = useState<FormError>({});
  const [demoMode, setDemoMode] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ci = useMemo(() => new Date(checkIn), [checkIn]);
  const co = useMemo(() => new Date(checkOut), [checkOut]);
  const validRange = co > ci;

  const price = useMemo(
    () =>
      validRange
        ? computeBookingPrice({
            pricePerNight: cabin.pricePerNight,
            cleaningFee: cabin.cleaningFee,
            checkIn: ci,
            checkOut: co,
          })
        : null,
    [validRange, cabin.pricePerNight, cabin.cleaningFee, ci, co]
  );

  function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    const next: FormError = {};
    if (!guestName.trim() || guestName.trim().length < 2) {
      next.guestName = "Ingresá tu nombre";
    }
    if (!/.+@.+\..+/.test(guestEmail)) {
      next.guestEmail = "Email inválido";
    }
    if (!validRange) {
      next.checkOut = "El check-out debe ser posterior al check-in";
    }
    if (guests > cabin.maxGuests) {
      next.guests = `Esta cabaña admite hasta ${cabin.maxGuests} huéspedes.`;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (ci < today) next.checkIn = "El check-in no puede ser en el pasado";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setServerError(null);
    setDemoMode(false);

    startTransition(async () => {
      try {
        const res = await fetch("/api/reservations", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            cabinSlug: cabin.slug,
            checkIn,
            checkOut,
            guests,
            guestName,
            guestEmail,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 409) {
            setServerError("Esas fechas ya no están disponibles. Probá otras.");
            return;
          }
          if (data?.demoMode) {
            setDemoMode(true);
            return;
          }
          setServerError(
            data?.error ?? "No pudimos crear la solicitud. Probá nuevamente."
          );
          return;
        }

        const data = (await res.json()) as { reservation: { id: string } };
        setSuccessId(data.reservation.id);
        setStep("success");
        router.refresh();
      } catch {
        setServerError("Sin conexión. Verificá tu red e intentá de nuevo.");
      }
    });
  }

  /* ───────────── Render ───────────── */

  if (step === "success" && successId) {
    return (
      <div className="surface-paper space-y-5 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-success)]/15 text-[color:var(--color-success)]">
          <Check size={22} strokeWidth={1.75} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-medium">Solicitud enviada</h3>
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Tu solicitud está en revisión por el anfitrión. Cuando la apruebe
            te avisamos por email y vas a poder pagarla desde tu dashboard.
            El pago es simulado: no se cobra nada todavía.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => router.push("/dashboard/reservations")}
        >
          Ver mis solicitudes
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submitRequest} className="surface-paper space-y-5 p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-medium text-[color:var(--color-text-primary)]">
            {formatCurrency(cabin.pricePerNight)}
          </span>
          <span className="ml-1 text-sm text-[color:var(--color-text-secondary)]">
            / noche
          </span>
        </div>
        <span className="text-xs text-[color:var(--color-text-secondary)]">
          {cabin.rating.toFixed(2)} ★ · {cabin.reviewCount} reseñas
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <DateField
          id="checkIn"
          label="Check-in"
          value={checkIn}
          min={toDateInputValue(new Date())}
          onChange={setCheckIn}
          error={errors.checkIn}
        />
        <DateField
          id="checkOut"
          label="Check-out"
          value={checkOut}
          min={checkIn}
          onChange={setCheckOut}
          error={errors.checkOut}
        />
      </div>

      <Field
        label="Huéspedes"
        htmlFor="guests"
        hint={`Máximo ${cabin.maxGuests} en esta cabaña.`}
        error={errors.guests}
      >
        <div className="flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4">
          <Users size={16} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="h-11 w-full bg-transparent text-sm font-medium focus:outline-none"
          >
            {Array.from({ length: cabin.maxGuests }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? "huésped" : "huéspedes"}
              </option>
            ))}
          </select>
        </div>
      </Field>

      <div className="grid gap-3 border-t border-[color:var(--color-border)] pt-4">
        <Field label="Nombre" htmlFor="guestName" error={errors.guestName}>
          <Input
            id="guestName"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Tu nombre"
            autoComplete="name"
          />
        </Field>
        <Field label="Email" htmlFor="guestEmail" error={errors.guestEmail}>
          <Input
            id="guestEmail"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
          />
        </Field>
      </div>

      {price && price.nights > 0 && (
        <div className="space-y-2 border-t border-[color:var(--color-border)] pt-4 text-sm">
          <Row
            label={`${formatCurrency(cabin.pricePerNight)} × ${price.nights} ${
              price.nights === 1 ? "noche" : "noches"
            }`}
            value={formatCurrency(price.subtotal)}
          />
          <Row label="Limpieza" value={formatCurrency(price.cleaningFee)} />
          <Row label="Servicio" value={formatCurrency(price.serviceFee)} />
          <div className="mt-3 flex items-center justify-between border-t border-[color:var(--color-border)] pt-3">
            <span className="font-medium text-[color:var(--color-text-primary)]">
              Total estimado
            </span>
            <span className="text-lg font-medium text-[color:var(--color-text-primary)]">
              {formatCurrency(price.total)}
            </span>
          </div>
        </div>
      )}

      {(serverError || demoMode) && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-sm text-[color:var(--color-error)]">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5" />
          <span>
            {demoMode
              ? "Modo demo: configurá DATABASE_URL para guardar reservas reales."
              : serverError}
          </span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Enviando solicitud…" : "Solicitar reserva"}
        <ArrowRight size={16} strokeWidth={1.75} />
      </Button>

      <p className="text-center text-xs text-[color:var(--color-text-muted)]">
        Sin pago todavía · El anfitrión aprueba y después se paga
        (simulado).
      </p>
    </form>
  );
}

function DateField({
  id,
  label,
  value,
  min,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  min?: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3">
        <CalendarDays size={15} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
        <input
          id={id}
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full bg-transparent text-sm font-medium focus:outline-none"
        />
      </div>
    </Field>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[color:var(--color-text-secondary)]">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
