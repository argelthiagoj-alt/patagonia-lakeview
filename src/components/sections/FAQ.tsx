"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "¿Cómo funciona la reserva?",
    a: "Elegís cabaña y fechas, completás tus datos y recibís la confirmación por mail. Las reservas se confirman manualmente dentro de las 24 horas.",
  },
  {
    q: "¿Política de cancelación?",
    a: "Cancelación gratuita hasta 7 días antes del check-in. Entre 7 y 3 días se reembolsa el 50%. Dentro de las 72 horas previas no aplica reembolso.",
  },
  {
    q: "¿Aceptan mascotas?",
    a: "Algunas cabañas son pet-friendly. Vas a verlo marcado en los amenities de cada cabaña.",
  },
  {
    q: "¿Cómo se llega?",
    a: "Volamos a Bariloche o San Martín de los Andes. Te enviamos indicaciones detalladas y opciones de transfer privado al confirmar la reserva.",
  },
  {
    q: "¿Hay temporada baja?",
    a: "Sí: marzo-junio y septiembre-noviembre. Menos gente, mejores tarifas y paisajes increíbles.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="container-page py-24 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          <p className="text-eyebrow">Preguntas frecuentes</p>
          <h2 className="heading-section text-balance">
            Todo lo que necesitás saber antes de reservar.
          </h2>
          <p className="text-base/relaxed text-[color:var(--color-text-secondary)]">
            Si tu consulta no está aquí, escribinos: respondemos en pocas horas.
          </p>
        </div>

        <ul className="divide-y divide-[color:var(--color-border)] border-t border-b border-[color:var(--color-border)]">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium text-[color:var(--color-text-primary)] md:text-lg">
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] transition-transform duration-300",
                      isOpen && "rotate-45 bg-[color:var(--color-primary)] text-white"
                    )}
                  >
                    <Plus size={16} strokeWidth={1.5} />
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-500 ease-[var(--ease-out-soft)]",
                    isOpen
                      ? "grid-rows-[1fr] pb-6 opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl text-sm/relaxed text-[color:var(--color-text-secondary)] md:text-base/relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
