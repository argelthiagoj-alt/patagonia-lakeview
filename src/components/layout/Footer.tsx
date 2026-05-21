import Link from "next/link";
import { Instagram, Facebook, Mail, Crown } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { getCurrentUser } from "@/modules/auth/session";
import { isAdmin } from "@/shared/auth-roles";

const links = {
  Explorar: [
    { href: "/cabins", label: "Cabañas" },
    { href: "/availability", label: "Disponibilidad" },
    { href: "/about", label: "Experiencia" },
  ],
  Empresa: [
    { href: "/soporte", label: "Soporte" },
    { href: "/trabaja-con-nosotros", label: "Trabajá con nosotros" },
    { href: "/about", label: "Sobre nosotros" },
    { href: "/login", label: "Iniciar sesión" },
  ],
  Legal: [
    { href: "/terminos", label: "Términos" },
    { href: "/privacidad", label: "Privacidad" },
    { href: "/cancelacion", label: "Cancelación" },
  ],
};

export async function Footer() {
  // "Ganar visibilidad" sólo es relevante para anfitriones (ADMIN logueado).
  // Lo escondemos del huésped común y del super-admin (que no necesita
  // mejorar su propia visibilidad).
  const me = await getCurrentUser();
  const showProUpsell = !!me && isAdmin(me) && me.role !== "SUPER_ADMIN";

  return (
    <footer className="surface-dark relative mt-32 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="container-page py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr_1fr]">
          <div className="space-y-6">
            <Logo variant="dark" />
            <p className="max-w-sm text-sm leading-relaxed text-[color:var(--color-stone)]/80">
              Cabañas boutique frente a los lagos de la Patagonia. Diseñadas para
              descansar, explorar y reconectar con lo esencial.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white"
              >
                <Instagram size={16} strokeWidth={1.5} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white"
              >
                <Facebook size={16} strokeWidth={1.5} />
              </a>
              <a
                href="mailto:hola@patagonialakeview.com"
                aria-label="Email"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white"
              >
                <Mail size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {Object.entries(links).map(([group, items]) => (
              <div key={group} className="space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
                  {group}
                </p>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-white/80 transition hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {showProUpsell && (
              <Link
                href="/admin/pro-membership"
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-accent)]/50 bg-[color:var(--color-accent)]/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--color-accent-soft)] transition hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent)]/25"
              >
                <Crown size={12} strokeWidth={1.75} />
                Ganar visibilidad
              </Link>
            )}
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
              Recibí novedades
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              Atardeceres, aperturas y disponibilidad de temporada.
            </p>
            <form className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1.5">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-[color:var(--color-accent)] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[color:var(--color-accent-hover)]"
              >
                Suscribir
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Patagonia Lakeview. Todos los derechos reservados.</p>
          <p>Diseñado en la Patagonia · Construido con cuidado.</p>
        </div>
      </div>
    </footer>
  );
}
