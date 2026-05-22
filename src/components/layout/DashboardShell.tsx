import Link from "next/link";
import {
  LayoutDashboard,
  CalendarCheck,
  User,
  Home,
  LogOut,
  Users,
  ShieldCheck,
  Flag,
  Heart,
  Sparkles,
  UserCircle,
  Crown,
} from "lucide-react";
import { isAdmin, isSuperAdmin, type CurrentUser } from "@/shared/auth-roles";
import { LogoutButton } from "@/components/auth/LogoutButton";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  superAdminOnly?: boolean;
};

const userNav: NavItem[] = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/reservations", label: "Reservas", icon: CalendarCheck },
  { href: "/dashboard/favoritos", label: "Favoritos", icon: Heart },
  { href: "/dashboard/profile", label: "Perfil", icon: User },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/cabins", label: "Cabañas", icon: Home },
  { href: "/admin/reservations", label: "Reservas", icon: CalendarCheck },
  { href: "/admin/host-profile", label: "Perfil anfitrión", icon: UserCircle },
  { href: "/admin/pro-membership", label: "Membresía Pro", icon: Crown },
  { href: "/admin/users", label: "Usuarios", icon: Users, superAdminOnly: true },
  { href: "/admin/appeals", label: "Apelaciones", icon: Flag, superAdminOnly: true },
  {
    href: "/admin/landing-atmosphere",
    label: "Landing",
    icon: Sparkles,
    superAdminOnly: true,
  },
];

export function DashboardShell({
  user,
  variant,
  children,
}: {
  user: CurrentUser;
  variant: "user" | "admin";
  children: React.ReactNode;
}) {
  const nav =
    variant === "admin"
      ? adminNav.filter((i) => !i.superAdminOnly || isSuperAdmin(user))
      : userNav;

  const headerLabel =
    variant === "admin"
      ? isSuperAdmin(user)
        ? "Super-admin"
        : "Admin"
      : "Mi cuenta";

  return (
    <section className="container-page grid gap-10 pt-32 pb-24 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="surface-paper space-y-6 p-5">
          <div className="space-y-1">
            <p className="text-eyebrow flex items-center gap-1.5">
              {variant === "admin" && isSuperAdmin(user) && (
                <ShieldCheck size={12} strokeWidth={2} />
              )}
              {headerLabel}
            </p>
            <p className="text-sm font-medium">{user.name ?? user.email}</p>
            <p className="text-xs text-[color:var(--color-text-secondary)]">
              {user.email}
            </p>
          </div>

          <nav className="space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-surface-muted)]"
              >
                <item.icon size={16} strokeWidth={1.5} />
                {item.label}
              </Link>
            ))}
            {variant === "admin" && (
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-[color:var(--color-text-secondary)] transition hover:bg-[color:var(--color-surface-muted)]"
              >
                <User size={16} strokeWidth={1.5} />
                Vista usuario
              </Link>
            )}
            {variant === "user" && isAdmin(user) && (
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-[color:var(--color-text-secondary)] transition hover:bg-[color:var(--color-surface-muted)]"
              >
                <LayoutDashboard size={16} strokeWidth={1.5} />
                Vista admin
              </Link>
            )}
          </nav>

          <div className="border-t border-[color:var(--color-border)] pt-4">
            <LogoutButton>
              <LogOut size={14} strokeWidth={1.5} />
              Cerrar sesión
            </LogoutButton>
          </div>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </section>
  );
}
