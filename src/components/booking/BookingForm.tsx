"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, AlertCircle, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import {
  SimulatedPaymentForm,
  type CheckoutDefaults,
} from "@/components/booking/SimulatedPaymentForm";
import { computeBookingPrice } from "@/lib/booking";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import type { PaymentInput } from "@/lib/validations";
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

type Step = "details" | "payment" | "success";
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
  const [askSaveProfile, setAskSaveProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [lastPayment, setLastPayment] = useState<PaymentInput | null>(null);

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

  function continueToPayment(e: React.FormEvent) {
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
    if (Object.keys(next).length === 0) {
      setServerError(null);
      setDemoMode(false);
      setStep("payment");
    }
  }

  function submitWithPayment(payment: PaymentInput) {
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
            payment,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 409) {
            setServerError("Esas fechas ya no están disponibles. Probá otras.");
            setStep("details");
            return;
          }
          if (data?.demoMode) {
            setDemoMode(true);
            return;
          }
          setServerError(
            data?.error ?? "No pudimos procesar el pago. Probá nuevamente."
          );
          return;
        }

        const data = (await res.json()) as { reservation: { id: string } };
        setSuccessId(data.reservation.id);
        setLastPayment(payment);
        // After first booking with custom data, offer to save to profile
        if (userDefaults?.loggedIn && !userDefaults.hasSavedProfile) {
          setAskSaveProfile(true);
        }
        setStep("success");
        router.refresh();
      } catch {
        setServerError("Sin conexión. Verificá tu red e intentá de nuevo.");
      }
    });
  }

  async function saveBillingToProfile() {
    if (!lastPayment) return;
    setSavedProfile(true);
    try {
      await fetch("/api/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: guestName,
          phone: lastPayment.phone,
          documentId: lastPayment.documentId,
          address: lastPayment.billingAddress,
          city: lastPayment.city,
          state: lastPayment.state,
          country: lastPayment.country,
          billingName:
            lastPayment.provider === "CARD" ? lastPayment.cardholder : guestName,
        }),
      });
    } finally {
      setAskSaveProfile(false);
    }
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
            Pago simulado autorizado. El anfitrión va a aceptar o rechazar tu
            reserva en las próximas horas. Si la rechaza, el pago se devuelve
            (simulado).
          </p>
        </div>

        {askSaveProfile && (
          <div className="space-y-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/60 p-4">
            <p className="text-sm text-[color:var(--color-text-primary)]">
              ¿Querés guardar estos datos para futuras reservas? La próxima vez
              te precargamos el checkout.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={saveBillingToProfile}
              >
                Guardar para futuras reservas
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAskSaveProfile(false)}
              >
                Ahora no
              </Button>
            </div>
          </div>
        )}
        {savedProfile && !askSaveProfile && (
          <p className="text-xs text-[color:var(--color-success)]">
            Datos guardados en tu perfil.
          </p>
        )}

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

  if (step === "payment" && price && validRange) {
    return (
      <SimulatedPaymentForm
        amount={price.total}
        defaults={{
          email: guestEmail,
          name: guestName,
          documentId: userDefaults?.documentId,
          phone: userDefaults?.phone,
          address: userDefaults?.address,
          city: userDefaults?.city,
          state: userDefaults?.state,
          country: userDefaults?.country,
        }}
        pending={pending}
        serverError={
          demoMode
            ? "Modo demo: configurá DATABASE_URL para guardar reservas reales."
            : serverError
        }
        onBack={() => setStep("details")}
        onSubmit={submitWithPayment}
      />
    );
  }

  return (
    <form onSubmit={continueToPayment} className="surface-paper space-y-5 p-6">
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

      {serverError && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-sm text-[color:var(--color-error)]">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        Continuar al pago
        <ArrowRight size={16} strokeWidth={1.75} />
      </Button>

      <p className="text-center text-xs text-[color:var(--color-text-muted)]">
        Pago simulado · No se procesa dinero real.
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
