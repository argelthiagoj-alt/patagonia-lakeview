import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { getCurrentUser } from "@/modules/auth/session";

export const metadata: Metadata = { title: "Verificar email" };
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/verify-email");

  return (
    <section className="container-page flex min-h-[80vh] items-center justify-center pt-32 pb-24">
      <div className="w-full max-w-md">
        <VerifyEmailForm
          email={user.email}
          alreadyVerified={Boolean(user.emailVerified)}
        />
      </div>
    </section>
  );
}
