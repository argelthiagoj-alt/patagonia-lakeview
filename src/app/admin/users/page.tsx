import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";
import { UsersTable, type UserRow } from "@/components/admin/UsersTable";

async function loadUsers(): Promise<UserRow[]> {
  try {
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerified: true,
      },
    });
    return rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      emailVerified: u.emailVerified ? u.emailVerified.toISOString() : null,
    }));
  } catch {
    return [];
  }
}

export default async function AdminUsersPage() {
  const me = await getCurrentUser();
  if (!isSuperAdmin(me)) redirect("/admin");

  const users = await loadUsers();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-eyebrow flex items-center gap-1.5">
          <ShieldCheck size={12} strokeWidth={2} />
          Super-admin
        </p>
        <h1 className="heading-section">Usuarios</h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
          Buscá por email o nombre y asigná roles. Las cabañas le pertenecen al
          admin que las creó: si demotás a un admin, sus cabañas siguen en su
          cuenta hasta que las reasignes.
        </p>
      </header>

      <UsersTable users={users} currentUserId={me!.id} />
    </div>
  );
}
