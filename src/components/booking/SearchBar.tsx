"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toDateInputValue } from "@/lib/utils";

function defaultDates() {
  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(today.getDate() + 7);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + 3);
  return {
    checkIn: toDateInputValue(checkIn),
    checkOut: toDateInputValue(checkOut),
  };
}

type SearchBarProps = {
  variant?: "hero" | "compact";
  className?: string;
};

export function SearchBar({ variant = "hero", className }: SearchBarProps) {
  const router = useRouter();
  const defaults = defaultDates();
  const [checkIn, setCheckIn] = useState(defaults.checkIn);
  const [checkOut, setCheckOut] = useState(defaults.checkOut);
  const [guests, setGuests] = useState(2);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    });
    router.push(`/cabins?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={[
        variant === "hero"
          ? // Solid warm paper + stronger ring/shadow so it sits cleanly above the gradient seam.
            "grid w-full grid-cols-1 gap-2 rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2 shadow-[var(--shadow-lift)] md:grid-cols-[1fr_1fr_1fr_auto]"
          : "surface-glass grid w-full grid-cols-1 gap-2 rounded-3xl p-2 md:grid-cols-[1fr_1fr_1fr_auto]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <FieldChunk
        icon={<CalendarDays size={16} strokeWidth={1.5} />}
        label="Check-in"
      >
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          min={toDateInputValue(new Date())}
          className="w-full bg-transparent text-sm font-medium text-[color:var(--color-text-primary)] focus:outline-none"
        />
      </FieldChunk>
      <FieldChunk
        icon={<CalendarDays size={16} strokeWidth={1.5} />}
        label="Check-out"
      >
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          min={checkIn}
          className="w-full bg-transparent text-sm font-medium text-[color:var(--color-text-primary)] focus:outline-none"
        />
      </FieldChunk>
      <FieldChunk
        icon={<Users size={16} strokeWidth={1.5} />}
        label="Huéspedes"
      >
        <select
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full bg-transparent text-sm font-medium text-[color:var(--color-text-primary)] focus:outline-none"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "huésped" : "huéspedes"}
            </option>
          ))}
        </select>
      </FieldChunk>

      <Button type="submit" variant="primary" size="lg" className="md:self-stretch">
        <Search size={16} strokeWidth={1.75} />
        Buscar
      </Button>
    </form>
  );
}

function FieldChunk({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-[color:var(--color-surface-muted)]/60">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-primary)]/12 text-[color:var(--color-primary)]">
        {icon}
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-primary)]">
          {label}
        </span>
        {children}
      </span>
    </label>
  );
}
