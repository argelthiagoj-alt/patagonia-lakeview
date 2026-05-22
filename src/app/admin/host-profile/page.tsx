import { redirect } from "next/navigation";
import { UserCircle } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import { isAdmin } from "@/shared/auth-roles";
import { getHostProfile } from "@/modules/users/host-profile";
import { HostProfileForm } from "@/components/admin/HostProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Perfil de anfitrión" };

export default async function HostProfilePage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin/host-profile");
  if (!isAdmin(me)) redirect("/dashboard");

  const profile = await getHostProfile(me.id).catch(() => null);

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-3">
        <p className="text-eyebrow flex items-center gap-1.5">
          <UserCircle size={12} strokeWidth={2} />
          Tu cuenta
        </p>
        <h1 className="heading-section">Perfil de anfitrión</h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
          Configurá tus datos una sola vez. Aparecen automáticamente en
          cada una de tus cabañas como tarjeta de anfitrión y, si publicás
          un hotel, como tarjeta institucional.
        </p>
      </header>

      <HostProfileForm
        initial={
          (profile as Parameters<typeof HostProfileForm>[0]["initial"]) ?? null
        }
      />
    </div>
  );
}
