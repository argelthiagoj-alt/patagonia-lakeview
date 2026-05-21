import { getCurrentUser } from "@/modules/auth/session";
import { findProfile } from "@/modules/users/repo";
import { ProfileForm, type ProfileData } from "@/components/profile/ProfileForm";

async function loadProfile(userId: string): Promise<ProfileData & { email: string }> {
  try {
    const u = await findProfile(userId);
    if (u) return u;
  } catch {
    /* fall through */
  }
  return {
    email: "",
    name: null,
    phone: null,
    documentId: null,
    address: null,
    city: null,
    state: null,
    country: null,
    billingName: null,
  };
}

export default async function ProfilePage() {
  const me = (await getCurrentUser())!;
  const profile = await loadProfile(me.id);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-eyebrow">Tu cuenta</p>
        <h1 className="heading-section">Mis datos</h1>
      </header>
      <ProfileForm
        email={profile.email}
        initial={{
          name: profile.name,
          phone: profile.phone,
          documentId: profile.documentId,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          country: profile.country,
          billingName: profile.billingName,
        }}
      />
    </div>
  );
}
