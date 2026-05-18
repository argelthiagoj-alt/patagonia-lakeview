import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Recuperar contraseña" };
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect(isAdmin(user) ? "/admin" : "/dashboard");

  return (
    <section className="container-page grid min-h-[80vh] items-center pt-32 pb-24 md:grid-cols-2 md:gap-16">
      <div className="hidden md:block">
        <p className="text-eyebrow">Recuperación</p>
        <h2 className="heading-display max-w-md text-balance">
          Te ayudamos a volver.
        </h2>
        <p className="mt-4 max-w-md text-base/relaxed text-[color:var(--color-text-secondary)]">
          Mandanos tu email y enviamos un código de un solo uso. En 10 minutos
          podés crear una contraseña nueva.
        </p>
      </div>
      <div className="mx-auto w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
