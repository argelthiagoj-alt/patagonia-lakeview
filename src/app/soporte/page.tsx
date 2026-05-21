import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  CalendarCheck,
  CreditCard,
  Home,
  UserCircle,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Soporte",
  description:
    "Centro de ayuda de Patagonia Lakeview. Reservas, pagos, cuentas y consultas para anfitriones.",
};

const categories = [
  {
    icon: CalendarCheck,
    title: "Reservas",
    body: "Cambios de fecha, cancelaciones, llegadas tardías, modificación de huéspedes.",
    hint: "Ver política",
    href: "/cancelacion",
  },
  {
    icon: CreditCard,
    title: "Pagos & facturación",
    body: "Estado del pago, devoluciones simuladas, comprobantes y datos de facturación.",
    hint: "Términos",
    href: "/terminos",
  },
  {
    icon: UserCircle,
    title: "Mi cuenta",
    body: "Verificación de email, recuperar contraseña, modificar perfil, baja de cuenta.",
    hint: "Privacidad",
    href: "/privacidad",
  },
  {
    icon: Home,
    title: "Para anfitriones",
    body: "Cómo publicar una cabaña, gestionar reservas y disponibilidad por unidades.",
    hint: "Sumate al equipo",
    href: "/trabaja-con-nosotros",
  },
];

export default function SoportePage() {
  return (
    <section className="container-page pt-32 pb-32">
      {/* ───────── Header ───────── */}
      <header className="mb-16 max-w-3xl space-y-4">
        <p className="text-eyebrow">Soporte</p>
        <h1 className="heading-display text-balance">
          ¿Cómo te podemos ayudar?
        </h1>
        <p className="text-base/relaxed text-[color:var(--color-text-secondary)] md:text-lg/relaxed">
          Respondemos consultas reales en menos de 24 horas hábiles. Para
          temas urgentes durante una estadía, usá el teléfono o el chat de la
          reserva.
        </p>
      </header>

      {/* ───────── Categories ───────── */}
      <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className="surface-paper group flex flex-col gap-4 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-primary)]/12 text-[color:var(--color-primary)]">
              <cat.icon size={18} strokeWidth={1.5} />
            </span>
            <div className="space-y-1.5">
              <h2 className="text-base font-medium text-[color:var(--color-text-primary)]">
                {cat.title}
              </h2>
              <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                {cat.body}
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-accent-hover)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {cat.hint}
              <ArrowUpRight size={12} strokeWidth={1.75} />
            </span>
          </Link>
        ))}
      </div>

      {/* ───────── Form + channels ───────── */}
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        {/* Form */}
        <form className="surface-paper space-y-5 p-6 md:p-8">
          <header className="space-y-1.5">
            <h2 className="text-lg font-medium tracking-tight">
              Mandanos un mensaje
            </h2>
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              Si tu consulta es sobre una reserva específica, mencioná el
              código de reserva para que llegue al equipo correcto.
            </p>
          </header>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="s-name">
              <Input id="s-name" placeholder="Tu nombre" />
            </Field>
            <Field label="Email" htmlFor="s-email">
              <Input id="s-email" type="email" placeholder="tu@email.com" />
            </Field>
            <Field label="Tema" htmlFor="s-topic" className="sm:col-span-2">
              <select
                id="s-topic"
                className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Elegí un tema
                </option>
                <option value="reserva">Una reserva existente</option>
                <option value="pago">Pago o facturación</option>
                <option value="cuenta">Mi cuenta</option>
                <option value="anfitrion">Soy anfitrión / quiero publicar</option>
                <option value="otro">Otro tema</option>
              </select>
            </Field>
            <Field
              label="Código de reserva (opcional)"
              htmlFor="s-code"
              hint="Lo encontrás en tu mail de confirmación o en /dashboard/reservations."
              className="sm:col-span-2"
            >
              <Input id="s-code" placeholder="PL-XXXXXX" />
            </Field>
            <Field label="Mensaje" htmlFor="s-msg" className="sm:col-span-2">
              <textarea
                id="s-msg"
                rows={6}
                placeholder="Contanos qué necesitás con el detalle que puedas darnos."
                className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
              />
            </Field>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Enviar consulta
          </Button>
          <p className="text-center text-[11px] text-[color:var(--color-text-muted)]">
            Respondemos en menos de 24 horas hábiles · Lun-Sáb 9 a 19 hs (ART)
          </p>
        </form>

        {/* Sidebar: channels */}
        <aside className="space-y-5">
          <div className="surface-paper space-y-4 p-6">
            <h2 className="text-base font-medium tracking-tight">
              Canales directos
            </h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail
                  size={16}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[color:var(--color-primary)]"
                />
                <div>
                  <a
                    href="mailto:soporte@patagonialakeview.com"
                    className="font-medium text-[color:var(--color-text-primary)] hover:text-[color:var(--color-accent-hover)]"
                  >
                    soporte@patagonialakeview.com
                  </a>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    Consultas generales · ≤ 24 hs hábiles
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone
                  size={16}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[color:var(--color-primary)]"
                />
                <div>
                  <a
                    href="tel:+5492945551234"
                    className="font-medium text-[color:var(--color-text-primary)] hover:text-[color:var(--color-accent-hover)]"
                  >
                    +54 9 294 555 1234
                  </a>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    Lunes a sábado · 9 a 19 hs (ART)
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin
                  size={16}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[color:var(--color-primary)]"
                />
                <div>
                  <p className="font-medium text-[color:var(--color-text-primary)]">
                    Bariloche, Patagonia
                  </p>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    Operamos también en Villa La Angostura y El Bolsón
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[color:var(--color-accent)]/25 bg-[color:var(--color-accent)]/8 p-5 text-sm">
            <div className="mb-2 flex items-center gap-2 text-[color:var(--color-accent-hover)]">
              <Clock size={14} strokeWidth={1.75} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Estás de viaje y es urgente
              </p>
            </div>
            <p className="text-[color:var(--color-text-primary)]">
              Si ya estás hospedado y necesitás ayuda{" "}
              <strong>durante la estadía</strong>, abrí el chat dentro de tu
              reserva: tu anfitrión lo recibe al instante.
            </p>
            <Link
              href="/dashboard/reservations"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[color:var(--color-accent-hover)] hover:underline"
            >
              Ir a mis reservas
              <ArrowUpRight size={12} strokeWidth={1.75} />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
