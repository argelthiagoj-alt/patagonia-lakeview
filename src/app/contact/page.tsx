import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribinos para consultas, reservas privadas, eventos o llegadas especiales.",
};

export default function ContactPage() {
  return (
    <section className="container-page grid gap-16 pt-32 pb-32 lg:grid-cols-2">
      <div className="space-y-6">
        <p className="text-eyebrow">Contacto</p>
        <h1 className="heading-display text-balance">Hablemos.</h1>
        <p className="max-w-md text-base/relaxed text-[color:var(--color-text-secondary)]">
          Para consultas, eventos, llegadas especiales o reservas a medida.
          Respondemos en menos de 24 horas hábiles.
        </p>
        <ul className="space-y-4 pt-2">
          <li className="flex items-start gap-3">
            <Mail size={18} strokeWidth={1.5} className="mt-0.5 text-[color:var(--color-text-secondary)]" />
            <div>
              <p className="text-sm font-medium">hola@patagonialakeview.com</p>
              <p className="text-xs text-[color:var(--color-text-secondary)]">
                Consultas generales
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Phone size={18} strokeWidth={1.5} className="mt-0.5 text-[color:var(--color-text-secondary)]" />
            <div>
              <p className="text-sm font-medium">+54 9 294 555 1234</p>
              <p className="text-xs text-[color:var(--color-text-secondary)]">
                Lunes a sábado, 9 a 19 hs
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <MapPin size={18} strokeWidth={1.5} className="mt-0.5 text-[color:var(--color-text-secondary)]" />
            <div>
              <p className="text-sm font-medium">Bariloche, Patagonia Argentina</p>
              <p className="text-xs text-[color:var(--color-text-secondary)]">
                Atendemos también en Villa La Angostura y El Bolsón
              </p>
            </div>
          </li>
        </ul>
      </div>

      <form className="surface-paper space-y-4 p-8">
        <Field label="Nombre" htmlFor="c-name">
          <Input id="c-name" placeholder="Tu nombre" />
        </Field>
        <Field label="Email" htmlFor="c-email">
          <Input id="c-email" type="email" placeholder="tu@email.com" />
        </Field>
        <Field label="Mensaje" htmlFor="c-msg">
          <textarea
            id="c-msg"
            rows={5}
            placeholder="Contanos en qué pensás"
            className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
          />
        </Field>
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Enviar mensaje
        </Button>
      </form>
    </section>
  );
}
