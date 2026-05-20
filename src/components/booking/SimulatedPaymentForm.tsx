"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CreditCard,
  Lock,
  Mail,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  type CardBrand,
} from "@/lib/payments";
import { formatCurrency, cn } from "@/lib/utils";
import type { PaymentInput } from "@/lib/validations";

type Method = "CARD" | "MERCADO_PAGO";

export type CheckoutDefaults = {
  email?: string;
  name?: string;
  documentId?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
};

type BillingValues = {
  documentId: string;
  phone: string;
  billingAddress: string;
  city: string;
  state: string;
  country: string;
};

type Props = {
  amount: number;
  defaults?: CheckoutDefaults;
  pending: boolean;
  serverError: string | null;
  onBack: () => void;
  onSubmit: (payment: PaymentInput) => void;
};

export function SimulatedPaymentForm({
  amount,
  defaults,
  pending,
  serverError,
  onBack,
  onSubmit,
}: Props) {
  const [method, setMethod] = useState<Method>("CARD");

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--color-warning)]/25 bg-[color:var(--color-warning)]/10 p-4 text-sm text-[color:var(--color-text-primary)]">
        <AlertTriangle
          size={18}
          strokeWidth={1.75}
          className="mt-0.5 shrink-0 text-[color:var(--color-warning)]"
        />
        <div className="space-y-1">
          <p className="font-medium">Pago simulado para demo</p>
          <p className="text-[color:var(--color-text-secondary)]">
            No se procesará dinero real. Usá datos ficticios; ningún número de
            tarjeta llega al servidor (guardamos solo marca + últimos 4
            dígitos).
          </p>
        </div>
      </div>

      <div className="surface-paper space-y-5 p-6 md:p-7">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl font-medium tracking-tight">Pago</h2>
            <p className="text-xs text-[color:var(--color-text-secondary)]">
              Total a pagar:{" "}
              <strong className="text-[color:var(--color-text-primary)]">
                {formatCurrency(amount)}
              </strong>
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-surface-muted)] p-1 text-xs">
            <MethodTab active={method === "CARD"} onClick={() => setMethod("CARD")}>
              <CreditCard size={13} strokeWidth={1.75} />
              Tarjeta
            </MethodTab>
            <MethodTab
              active={method === "MERCADO_PAGO"}
              onClick={() => setMethod("MERCADO_PAGO")}
            >
              <Wallet size={13} strokeWidth={1.75} />
              Mercado Pago
            </MethodTab>
          </div>
        </header>

        {method === "CARD" ? (
          <CardForm defaults={defaults} pending={pending} onBack={onBack} onSubmit={onSubmit} />
        ) : (
          <MercadoPagoForm
            defaults={defaults}
            pending={pending}
            onBack={onBack}
            onSubmit={onSubmit}
          />
        )}

        {serverError && (
          <div className="rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-sm text-[color:var(--color-error)]">
            {serverError}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-[color:var(--color-border)] pt-3 text-[11px] text-[color:var(--color-text-muted)]">
          <ShieldCheck size={12} strokeWidth={1.75} />
          Procesamiento simulado · No se transmiten datos sensibles
        </div>
      </div>
    </div>
  );
}

function MethodTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition",
        active
          ? "bg-white text-[color:var(--color-text-primary)] shadow-sm"
          : "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
      )}
    >
      {children}
    </button>
  );
}

/* ─────────────── Card form ─────────────── */

function CardForm({
  defaults,
  pending,
  onBack,
  onSubmit,
}: {
  defaults?: CheckoutDefaults;
  pending: boolean;
  onBack: () => void;
  onSubmit: (payment: PaymentInput) => void;
}) {
  const [cardholder, setCardholder] = useState(defaults?.name ?? "");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [email, setEmail] = useState(defaults?.email ?? "");
  const [billing, setBilling] = useState<BillingValues>(
    defaultBilling(defaults)
  );
  const [touched, setTouched] = useState(false);

  const brand: CardBrand = detectCardBrand(number);
  const digits = number.replace(/\s+/g, "");
  const errors = {
    cardholder: cardholder.trim().length < 2 ? "Ingresá el titular" : null,
    number:
      digits.length < 13 || digits.length > 19 ? "Entre 13 y 19 dígitos" : null,
    expiry: /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) ? null : "Formato MM/YY",
    cvv: /^\d{3,4}$/.test(cvv) ? null : "CVV inválido",
    email: /.+@.+\..+/.test(email) ? null : "Email inválido",
    ...billingErrors(billing),
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    onSubmit({
      provider: "CARD",
      cardholder,
      number: digits,
      expiry,
      cvv,
      email,
      ...billing,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        label="Nombre del titular"
        htmlFor="pay-name"
        error={touched ? errors.cardholder ?? undefined : undefined}
      >
        <Input
          id="pay-name"
          value={cardholder}
          onChange={(e) => setCardholder(e.target.value)}
          placeholder="Como figura en la tarjeta"
          autoComplete="cc-name"
        />
      </Field>

      <Field
        label={
          <span className="flex items-center justify-between gap-2">
            <span>Número de tarjeta</span>
            {brand !== "OTHER" && (
              <Badge tone="stone" className="text-[10px]">
                {brand}
              </Badge>
            )}
          </span>
        }
        htmlFor="pay-num"
        hint="Probá con 4242 4242 4242 4242 (Visa fake)."
        error={touched ? errors.number ?? undefined : undefined}
      >
        <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3">
          <CreditCard size={15} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
          <Input
            id="pay-num"
            inputMode="numeric"
            autoComplete="cc-number"
            value={number}
            onChange={(e) => setNumber(formatCardNumber(e.target.value))}
            placeholder="4242 4242 4242 4242"
            className="h-11 border-0 bg-transparent px-0 font-medium tracking-wider focus:bg-transparent"
            maxLength={23}
          />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Vencimiento"
          htmlFor="pay-exp"
          error={touched ? errors.expiry ?? undefined : undefined}
        >
          <Input
            id="pay-exp"
            inputMode="numeric"
            autoComplete="cc-exp"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
          />
        </Field>
        <Field
          label="CVV"
          htmlFor="pay-cvv"
          error={touched ? errors.cvv ?? undefined : undefined}
        >
          <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3">
            <Lock size={15} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
            <Input
              id="pay-cvv"
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D+/g, "").slice(0, 4))}
              placeholder="123"
              className="h-11 border-0 bg-transparent px-0 tracking-widest focus:bg-transparent"
              maxLength={4}
            />
          </div>
        </Field>
      </div>

      <Field
        label="Email del comprobante"
        htmlFor="pay-email"
        error={touched ? errors.email ?? undefined : undefined}
      >
        <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3">
          <Mail size={15} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
          <Input
            id="pay-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            className="h-11 border-0 bg-transparent px-0 focus:bg-transparent"
          />
        </div>
      </Field>

      <BillingFields
        billing={billing}
        onChange={setBilling}
        errors={touched ? errors : undefined}
      />

      <Actions pending={pending} onBack={onBack} />
    </form>
  );
}

/* ─────────────── MP form ─────────────── */

function MercadoPagoForm({
  defaults,
  pending,
  onBack,
  onSubmit,
}: {
  defaults?: CheckoutDefaults;
  pending: boolean;
  onBack: () => void;
  onSubmit: (payment: PaymentInput) => void;
}) {
  const [email, setEmail] = useState(defaults?.email ?? "");
  const [billing, setBilling] = useState<BillingValues>(defaultBilling(defaults));
  const [touched, setTouched] = useState(false);
  const [stage, setStage] = useState<"idle" | "redirecting" | "approved">("idle");

  const errors = {
    email: /.+@.+\..+/.test(email) ? null : "Email inválido",
    ...billingErrors(billing),
  };
  const hasErrors = Object.values(errors).some(Boolean);

  // Fake-redirect animation when the user clicks the MP button
  useEffect(() => {
    if (stage !== "redirecting") return;
    const t1 = setTimeout(() => setStage("approved"), 1200);
    const t2 = setTimeout(() => {
      onSubmit({ provider: "MERCADO_PAGO", email, ...billing });
    }, 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [stage, email, billing, onSubmit]);

  function start(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    setStage("redirecting");
  }

  if (stage === "redirecting" || stage === "approved") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-white/60 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#009ee3] text-white">
          {stage === "redirecting" ? (
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-white border-r-transparent" />
          ) : (
            <ShieldCheck size={26} strokeWidth={1.75} />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {stage === "redirecting"
              ? "Redirigiendo a Mercado Pago…"
              : "Pago simulado aprobado"}
          </p>
          <p className="text-xs text-[color:var(--color-text-secondary)]">
            {stage === "redirecting"
              ? "Estamos validando el pago. No cierres la ventana."
              : "Confirmando tu reserva como pendiente de aprobación…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={start} className="space-y-4">
      <p className="text-sm text-[color:var(--color-text-secondary)]">
        Esta integración es <strong>simulada</strong>. Vamos a mostrarte la
        pantalla "Redirigiendo a Mercado Pago…" y luego marcamos el pago como
        autorizado.
      </p>

      <Field
        label="Email registrado en Mercado Pago"
        htmlFor="mp-email"
        error={touched ? errors.email ?? undefined : undefined}
      >
        <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3">
          <Mail size={15} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
          <Input
            id="mp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="h-11 border-0 bg-transparent px-0 focus:bg-transparent"
          />
        </div>
      </Field>

      <BillingFields
        billing={billing}
        onChange={setBilling}
        errors={touched ? errors : undefined}
      />

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#009ee3] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0084c0] disabled:opacity-50"
      >
        <Wallet size={16} strokeWidth={1.75} />
        Pagar con Mercado Pago (simulado)
      </button>

      <Actions pending={pending} onBack={onBack} hideSubmit />
    </form>
  );
}

/* ─────────────── Shared billing block ─────────────── */

function BillingFields({
  billing,
  onChange,
  errors,
}: {
  billing: BillingValues;
  onChange: (b: BillingValues) => void;
  errors?: Record<string, string | null>;
}) {
  function set<K extends keyof BillingValues>(key: K, v: string) {
    onChange({ ...billing, [key]: v });
  }

  return (
    <div className="space-y-3 border-t border-[color:var(--color-border)] pt-4">
      <p className="text-eyebrow">Datos de facturación</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="DNI / Documento"
          htmlFor="b-doc"
          error={errors?.documentId ?? undefined}
        >
          <Input
            id="b-doc"
            value={billing.documentId}
            onChange={(e) => set("documentId", e.target.value)}
            placeholder="32.456.789"
          />
        </Field>
        <Field
          label="Teléfono"
          htmlFor="b-phone"
          error={errors?.phone ?? undefined}
        >
          <Input
            id="b-phone"
            type="tel"
            value={billing.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+54 9 …"
          />
        </Field>
        <Field
          label="Dirección"
          htmlFor="b-addr"
          className="sm:col-span-2"
          error={errors?.billingAddress ?? undefined}
        >
          <Input
            id="b-addr"
            value={billing.billingAddress}
            onChange={(e) => set("billingAddress", e.target.value)}
            placeholder="Calle, número, depto."
          />
        </Field>
        <Field label="Ciudad" htmlFor="b-city" error={errors?.city ?? undefined}>
          <Input
            id="b-city"
            value={billing.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Buenos Aires"
          />
        </Field>
        <Field
          label="Provincia / Estado"
          htmlFor="b-state"
          error={errors?.state ?? undefined}
        >
          <Input
            id="b-state"
            value={billing.state}
            onChange={(e) => set("state", e.target.value)}
            placeholder="CABA"
          />
        </Field>
        <Field
          label="País"
          htmlFor="b-country"
          className="sm:col-span-2"
          error={errors?.country ?? undefined}
        >
          <Input
            id="b-country"
            value={billing.country}
            onChange={(e) => set("country", e.target.value)}
            placeholder="Argentina"
          />
        </Field>
      </div>
    </div>
  );
}

function Actions({
  pending,
  onBack,
  hideSubmit = false,
}: {
  pending: boolean;
  onBack: () => void;
  hideSubmit?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <Button type="button" variant="ghost" size="md" onClick={onBack} disabled={pending}>
        ← Volver
      </Button>
      {!hideSubmit && (
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? "Procesando…" : "Pagar simulado"}
        </Button>
      )}
    </div>
  );
}

/* ─────────────── helpers ─────────────── */

function defaultBilling(d?: CheckoutDefaults): BillingValues {
  return {
    documentId: d?.documentId ?? "",
    phone: d?.phone ?? "",
    billingAddress: d?.address ?? "",
    city: d?.city ?? "",
    state: d?.state ?? "",
    country: d?.country ?? "",
  };
}

function billingErrors(b: BillingValues) {
  return {
    documentId: b.documentId.trim().length < 4 ? "Documento requerido" : null,
    phone: b.phone.trim().length < 6 ? "Teléfono requerido" : null,
    billingAddress: b.billingAddress.trim().length < 4 ? "Dirección requerida" : null,
    city: b.city.trim().length < 2 ? "Ciudad requerida" : null,
    state: b.state.trim().length < 2 ? "Provincia requerida" : null,
    country: b.country.trim().length < 2 ? "País requerido" : null,
  };
}
