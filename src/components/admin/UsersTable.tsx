"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";
import { UserBanToggle } from "@/components/admin/UserBanToggle";
import { UserPlanToggle } from "@/components/admin/UserPlanToggle";

type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
  emailVerified: string | null;
  isBanned: boolean;
  adminPlan: "FREE" | "PRO";
  proUntil: string | null;
};

const roleLabel: Record<Role, string> = {
  USER: "User",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super-admin",
};

const roleTone: Record<Role, "stone" | "accent" | "moss"> = {
  USER: "stone",
  ADMIN: "accent",
  SUPER_ADMIN: "moss",
};

export function UsersTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name?.toLowerCase().includes(q) ?? false)
    );
  }, [users, query]);

  return (
    <div className="space-y-5">
      <div className="surface-paper flex items-center gap-3 p-3">
        <Search size={16} strokeWidth={1.5} className="ml-2 text-[color:var(--color-text-secondary)]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por email o nombre"
          className="h-10 flex-1 border-0 bg-transparent focus:bg-transparent"
        />
        <span className="pr-2 text-xs text-[color:var(--color-text-muted)]">
          {filtered.length} / {users.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-white/40 p-8 text-center text-sm text-[color:var(--color-text-secondary)]">
          Sin resultados.
        </div>
      ) : (
        <div className="surface-paper p-0">
          <div className="-mx-px overflow-x-auto rounded-[inherit]">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-[color:var(--color-surface-muted)]/60 text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">
                <tr>
                  <th className="px-5 py-3 font-medium">Usuario</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Ban</th>
                  <th className="px-5 py-3 font-medium">Creado</th>
                  <th className="px-5 py-3 text-right font-medium">Cambiar rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border)]">
                {filtered.map((u) => {
                  const isSelf = u.id === currentUserId;
                  return (
                    <tr key={u.id}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <p className="font-medium">{u.name ?? "—"}</p>
                          {isSelf && (
                            <Badge tone="dark" className="text-[10px]">
                              vos
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[color:var(--color-text-secondary)] whitespace-nowrap">
                          {u.email}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={roleTone[u.role]}>
                          {u.role === "SUPER_ADMIN" && (
                            <ShieldCheck size={11} strokeWidth={2} />
                          )}
                          {roleLabel[u.role]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <UserPlanToggle
                          userId={u.id}
                          plan={u.adminPlan}
                          proUntil={u.proUntil}
                          isAdminTarget={u.role === "ADMIN"}
                        />
                      </td>
                      <td className="px-5 py-3">
                        <UserBanToggle
                          userId={u.id}
                          isBanned={u.isBanned}
                          isSelf={isSelf}
                        />
                      </td>
                      <td className="px-5 py-3 text-[color:var(--color-text-secondary)] whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <UserRoleSelect
                          userId={u.id}
                          currentRole={u.role}
                          isSelf={isSelf}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
