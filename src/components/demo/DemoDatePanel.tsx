"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, X } from "lucide-react";
import { getAppDateClient, setAppDateClient } from "@/modules/demo-tools/date";
import { currentSeason } from "@/modules/seasonal-theme/helpers";
import { SEASON_CONFIG } from "@/modules/seasonal-theme/config";

/**
 * Panel flotante que aparece sólo si el cliente está en demo mode.
 * Permite cambiar la fecha interna de la app sin tocar el reloj del SO.
 *
 * Por defecto está cerrado para no molestar; se abre con un botón chip
 * en la esquina inferior izquierda.
 */
export function DemoDatePanel() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    const d = getAppDateClient();
    setValue(toDateInput(d));
  }, []);

  if (!mounted) return null;

  function apply() {
    const next = value ? new Date(value) : null;
    startTransition(async () => {
      try {
        await fetch("/api/demo/date", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ date: next ? next.toISOString() : null }),
        });
      } catch {
        // best-effort; fallback al document.cookie
      }
      setAppDateClient(next);
      router.refresh();
    });
  }

  function reset() {
    startTransition(async () => {
      try {
        await fetch("/api/demo/date", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ date: null }),
        });
      } catch {
        // best-effort
      }
      setAppDateClient(null);
      setValue(toDateInput(new Date()));
      router.refresh();
    });
  }

  const previewDate = value ? new Date(value) : new Date();
  const previewSeason = currentSeason(previewDate);
  const seasonLabel = SEASON_CONFIG[previewSeason].label;

  return (
    <div className="fixed bottom-4 left-4 z-[60] flex flex-col items-start gap-2">
      {open && (
        <div className="surface-paper w-72 space-y-3 p-4 text-sm shadow-[var(--shadow-lift)]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-secondary)]">
              Demo · Fecha interna
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
              aria-label="Cerrar"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>

          <input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-white/70 px-3 py-2 text-sm focus:outline-none"
          />

          <p className="text-[11px] text-[color:var(--color-text-secondary)]">
            Vista previa: <strong className="text-[color:var(--color-text-primary)]">{seasonLabel}</strong>
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={apply}
              disabled={pending}
              className="rounded-full bg-[color:var(--color-primary)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-primary-foreground)] transition hover:bg-[color:var(--color-primary-hover)] disabled:opacity-50"
            >
              {pending ? "Aplicando…" : "Usar esta fecha"}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={pending}
              className="rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)] disabled:opacity-50"
            >
              Reset (hoy real)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 pt-1">
            {SEASON_HINTS.map((h) => (
              <button
                key={h.label}
                type="button"
                onClick={() => setValue(h.value)}
                className="rounded-lg border border-[color:var(--color-border)] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-text-primary)]"
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/95 px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] backdrop-blur transition hover:border-[color:var(--color-accent)]"
        aria-label="Panel demo: fecha interna"
      >
        <Calendar size={12} strokeWidth={1.75} />
        Demo · {toHuman(previewDate)} · {seasonLabel}
      </button>
    </div>
  );
}

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toHuman(d: Date): string {
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const SEASON_HINTS: { label: string; value: string }[] = [
  { label: "Verano", value: "2026-01-15" },
  { label: "Otoño", value: "2026-04-15" },
  { label: "Invierno", value: "2026-07-15" },
  { label: "Primavera", value: "2026-10-15" },
];
