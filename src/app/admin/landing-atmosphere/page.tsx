import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import { isSuperAdmin } from "@/shared/auth-roles";
import { getLandingConfig } from "@/modules/admin/landing-config";
import { LandingAtmosphereForm } from "@/components/admin/LandingAtmosphereForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Atmósfera de la landing" };

export default async function LandingAtmospherePage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin/landing-atmosphere");
  if (!isSuperAdmin(me)) redirect("/admin");

  const config = await getLandingConfig();

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-3">
        <p className="text-eyebrow flex items-center gap-1.5">
          <Sparkles size={12} strokeWidth={2} />
          Super-admin
        </p>
        <h1 className="heading-section">Atmósfera de la landing</h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
          Editá el hero y el ambiente visual de la página principal. Si
          dejás un campo vacío, la landing cae a los valores por defecto
          del módulo seasonal-theme.
        </p>
      </header>

      <LandingAtmosphereForm initial={config ?? null} />
    </div>
  );
}
