import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Ingresar" };

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(isAdmin(user) ? "/admin" : "/dashboard");
  return (
    <section className="container-page grid min-h-[80vh] items-center pt-32 pb-24 md:grid-cols-2 md:gap-16">
      <div className="hidden md:block">
        <p className="text-eyebrow">Sesión</p>
        <h2 className="heading-display max-w-md text-balance">
          Tus reservas, tus favoritos, tu próxima escapada.
        </h2>
        <p className="mt-4 max-w-md text-base/relaxed text-[color:var(--color-text-secondary)]">
          Una cuenta para reservar más rápido, guardar cabañas y volver al lago
          cuando quieras.
        </p>
        <div className="mt-8 rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)]/60 p-5 text-xs leading-relaxed text-[color:var(--color-text-secondary)]">
          <p className="font-medium text-[color:var(--color-text-primary)]">Demo</p>
          <p>guest@patagonialakeview.com · guest1234</p>
          <p>admin@patagonialakeview.com · admin1234</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md">
        <AuthForm mode="login" />
      </div>
    </section>
  );
}
