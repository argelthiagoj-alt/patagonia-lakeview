"use client";

import { useState, useTransition } from "react";
import { CalendarDays, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";

type Unit = {
  id: string;
  label: string;
  total: number;
  booked: number;
  available: number;
};

type Availability = {
  propertyType: "CABIN" | "HOTEL";
  units: Unit[];
};

/**
 * Widget admin: dado un cabinId y un rango de fechas, muestra cuántas
 * unidades están libres y cuántas reservadas. Para HOTEL desglosa por
 * tipo de habitación.
 *
 * Si la llamada falla (red caída, demo mode, etc.) muestra un fallback
 * legible y no rompe la página.
 */
export function AvailabilityWidget({ cabinId }: { cabinId: string }) {
  const today = toInput(new Date());
  const tomorrow = toInput(addDays(new Date(), 1));
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(tomorrow);
  const [data, setData] = useState<Availability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function load() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/cabins/${cabinId}/availability?from=${from}&to=${to}`
        );
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError(j?.error ?? "No pudimos cargar la disponibilidad.");
          setData(null);
          return;
        }
        const j = (await res.json()) as { availability: Availability };
        setData(j.availability);
      } catch {
        setError("Sin conexión. Probá de nuevo en un momento.");
      }
    });
  }

  return (
    <div className="surface-paper space-y-4 p-5">
      <div className="flex items-center gap-2">
        <CalendarDays size={14} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
        <h3 className="text-sm font-medium">Disponibilidad por fechas</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Field label="Desde" htmlFor="av-from">
          <Input
            id="av-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field label="Hasta" htmlFor="av-to">
          <Input
            id="av-to"
            type="date"
            min={from}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </Field>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={load}
          disabled={pending}
          className="sm:self-end"
        >
          {pending ? "Calculando…" : "Calcular"}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-xs text-[color:var(--color-error)]">
          <AlertCircle size={14} strokeWidth={1.5} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <div className="space-y-2">
          {data.units.length === 0 ? (
            <p className="text-xs text-[color:var(--color-text-muted)]">
              {data.propertyType === "HOTEL"
                ? "Este hotel todavía no tiene tipos de habitación."
                : "No hay datos."}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {data.units.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{u.label}</span>
                  <span className="text-xs text-[color:var(--color-text-secondary)]">
                    <strong className="text-[color:var(--color-text-primary)]">
                      {u.available}
                    </strong>{" "}
                    libres · {u.booked} reservadas · {u.total} total
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function toInput(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
