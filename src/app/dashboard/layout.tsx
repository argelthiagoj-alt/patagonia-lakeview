import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/session";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <DashboardShell user={user} variant="user">
      {children}
    </DashboardShell>
  );
}
