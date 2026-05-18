import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Restablecer contraseña" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(isAdmin(user) ? "/admin" : "/dashboard");

  const sp = await searchParams;
  const initialEmail = typeof sp.email === "string" ? sp.email : undefined;

  return (
    <section className="container-page grid min-h-[80vh] items-center pt-32 pb-24 md:grid-cols-2 md:gap-16">
      <div className="hidden md:block">
        <p className="text-eyebrow">Nueva contraseña</p>
        <h2 className="heading-display max-w-md text-balance">
          Casi listo.
        </h2>
        <p className="mt-4 max-w-md text-base/relaxed text-[color:var(--color-text-secondary)]">
          Ingresá el código que recibiste por mail. Después de actualizar la
          contraseña te llevamos al login.
        </p>
      </div>
      <div className="mx-auto w-full max-w-md">
        <ResetPasswordForm initialEmail={initialEmail} />
      </div>
    </section>
  );
}
