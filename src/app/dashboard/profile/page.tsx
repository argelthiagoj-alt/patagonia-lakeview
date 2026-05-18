import { getCurrentUser } from "@/lib/auth";
import { Input, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-eyebrow">Tu cuenta</p>
        <h1 className="heading-section">Perfil</h1>
      </header>

      <form className="surface-paper grid gap-5 p-8 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="profile-name" className="sm:col-span-2">
          <Input id="profile-name" defaultValue={user.name ?? ""} readOnly />
        </Field>
        <Field label="Email" htmlFor="profile-email" className="sm:col-span-2">
          <Input id="profile-email" defaultValue={user.email} readOnly />
        </Field>
        <Field label="Rol" htmlFor="profile-role">
          <Input id="profile-role" defaultValue={user.role} readOnly />
        </Field>
        <div className="flex items-end">
          <Button type="button" variant="outline" size="md" disabled>
            Próximamente
          </Button>
        </div>
      </form>

      <p className="text-xs text-[color:var(--color-text-muted)]">
        La edición de perfil llegará en una próxima versión.
      </p>
    </div>
  );
}
