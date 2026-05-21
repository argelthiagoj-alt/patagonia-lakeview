import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { DemoLoginButtons } from "@/components/auth/DemoLoginButtons";
import { getCurrentUser } from "@/modules/auth/session";
import { isAdmin } from "@/shared/auth-roles";

export const metadata: Metadata = { title: "Ingresar" };

export const dynamic = "force-dynamic";

function demoEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  );
}

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(isAdmin(user) ? "/admin" : "/dashboard");

  const showDemo = demoEnabled();

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
        {showDemo && (
          <div className="mt-8 max-w-md">
            <DemoLoginButtons />
          </div>
        )}
      </div>
      <div className="mx-auto w-full max-w-md space-y-6">
        <AuthForm mode="login" />
        {showDemo && (
          <div className="md:hidden">
            <DemoLoginButtons />
          </div>
        )}
      </div>
    </section>
  );
}
