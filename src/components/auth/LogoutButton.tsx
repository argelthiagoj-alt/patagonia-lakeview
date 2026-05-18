"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function logout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="inline-flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-[color:var(--color-text-secondary)] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-text-primary)] disabled:opacity-50"
    >
      {children}
    </button>
  );
}
