import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/modules/auth/session";
import { isAdmin } from "@/shared/auth-roles";

export const metadata: Metadata = { title: "Crear cuenta" };

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(isAdmin(user) ? "/admin" : "/dashboard");
  return (
    <section className="container-page grid min-h-[80vh] items-center pt-32 pb-24 md:grid-cols-2 md:gap-16">
      <div className="hidden md:block">
        <p className="text-eyebrow">Cuenta nueva</p>
        <h2 className="heading-display max-w-md text-balance">
          Reservá una vez. Disfrutá muchas.
        </h2>
        <p className="mt-4 max-w-md text-base/relaxed text-[color:var(--color-text-secondary)]">
          Creá tu cuenta y dejá listo todo para tu próxima estadía.
        </p>
      </div>
      <div className="mx-auto w-full max-w-md">
        <AuthForm mode="register" />
      </div>
    </section>
  );
}
