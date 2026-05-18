"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";
import { isAdmin, type CurrentUser } from "@/lib/auth-roles";

const navLinks = [
  { href: "/cabins", label: "Cabañas" },
  { href: "/availability", label: "Disponibilidad" },
  { href: "/about", label: "Experiencia" },
  { href: "/contact", label: "Contacto" },
];

export function Header({ user }: { user: CurrentUser | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const dashboardHref = isAdmin(user) ? "/admin" : "/dashboard";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div className="container-page">
        <div
          className={cn(
            "flex items-center justify-between gap-6 rounded-full border px-4 transition-all duration-500",
            scrolled
              ? "surface-glass border-[color:var(--color-border)] py-2 shadow-[var(--shadow-soft)]"
              : "border-transparent bg-transparent py-3"
          )}
        >
          <Logo scrolled={scrolled} />

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-primary)]"
                      : "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <LinkButton href={dashboardHref} variant="ghost" size="sm">
                  <LayoutDashboard size={14} strokeWidth={1.75} />
                  {isAdmin(user) ? "Panel admin" : "Mi cuenta"}
                </LinkButton>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={logout}
                  disabled={loggingOut}
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={14} strokeWidth={1.75} />
                  {loggingOut ? "Saliendo…" : "Salir"}
                </Button>
              </>
            ) : (
              <>
                <LinkButton href="/login" variant="ghost" size="sm">
                  Ingresar
                </LinkButton>
                <LinkButton href="/cabins" variant="primary" size="sm">
                  Reservar
                </LinkButton>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white/70 text-[color:var(--color-text-primary)] md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-x-0 top-[72px] z-40 origin-top transform px-5 transition-all duration-300 md:hidden",
          menuOpen
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        )}
      >
        <div className="surface-paper flex flex-col gap-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl px-4 py-3 text-base text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-surface-muted)]"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[color:var(--color-border)] pt-3">
            {user ? (
              <>
                <LinkButton href={dashboardHref} variant="secondary" size="sm">
                  {isAdmin(user) ? "Panel" : "Mi cuenta"}
                </LinkButton>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={logout}
                  disabled={loggingOut}
                >
                  {loggingOut ? "Saliendo…" : "Salir"}
                </Button>
              </>
            ) : (
              <>
                <LinkButton href="/login" variant="secondary" size="sm">
                  Ingresar
                </LinkButton>
                <LinkButton href="/cabins" variant="primary" size="sm">
                  Reservar
                </LinkButton>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
