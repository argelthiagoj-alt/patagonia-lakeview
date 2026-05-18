"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { computeBookingPrice } from "@/lib/booking";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import { reservationSchema } from "@/lib/validations";
import type { Cabin } from "@/data/cabins";

type Props = {
  cabin: Cabin;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
};

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

export function BookingForm({
  cabin,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: Props) {
  const defaults = defaultDates();
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(initialCheckIn ?? defaults.ci);
  const [checkOut, setCheckOut] = useState(initialCheckOut ?? defaults.co);
  const [guests, setGuests] = useState(initialGuests ?? Math.min(2, cabin.maxGuests));
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [errors, setErrors] = useState<FormError>({});
  const [successId, setSuccessId] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSuccessId(null);

    const parsed = reservationSchema.safeParse({
      cabinSlug: cabin.slug,
      checkIn,
      checkOut,
      guests,
      guestName,
      guestEmail,
    });

    if (!parsed.success) {
      const fieldErrors: FormError = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof FormError | undefined;
        if (path) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (parsed.data.guests > cabin.maxGuests) {
      setErrors({ guests: `Esta cabaña admite hasta ${cabin.maxGuests} huéspedes.` });
      return;
    }

    startTransition(async () => {
      setDemoMode(false);
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
            setErrors({
              _: "Esas fechas ya no están disponibles. Probá otras.",
            });
            return;
          }
          if (data?.demoMode) {
            setDemoMode(true);
            return;
          }
          setErrors({
            _:
              data?.error ??
              "No pudimos crear la reserva. Intentá nuevamente en unos segundos.",
          });
          return;
        }

        const data = (await res.json()) as { reservation: { id: string } };
        setSuccessId(data.reservation.id);
        router.refresh();
      } catch {
        setErrors({
          _: "Hubo un problema de conexión. Verificá tu red e intentá de nuevo.",
        });
      }
    });
  }

  if (successId) {
    return (
      <div className="surface-paper space-y-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-success)]/15 text-[color:var(--color-success)]">
          <Check size={22} strokeWidth={1.75} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-medium">Reserva enviada</h3>
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Te enviamos un mail con los detalles. Vas a poder verla en tu
            dashboard.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => router.push("/dashboard/reservations")}
        >
          Ver mis reservas
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface-paper space-y-5 p-6">
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
              Total
            </span>
            <span className="text-lg font-medium text-[color:var(--color-text-primary)]">
              {formatCurrency(price.total)}
            </span>
          </div>
        </div>
      )}

      {demoMode && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-warning)]/25 bg-[color:var(--color-warning)]/10 p-3 text-sm text-[color:var(--color-warning)]">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5" />
          <span>
            <strong className="font-medium">Modo demo.</strong> Conectá una base
            de datos en <code className="rounded bg-black/5 px-1">DATABASE_URL</code>{" "}
            para guardar reservas reales.
          </span>
        </div>
      )}

      {errors._ && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-sm text-[color:var(--color-error)]">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5" />
          <span>{errors._}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Reservando…" : "Reservar"}
      </Button>

      <p className="text-center text-xs text-[color:var(--color-text-muted)]">
        Aún no se realiza ningún cargo. Confirmamos manualmente cada reserva.
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
