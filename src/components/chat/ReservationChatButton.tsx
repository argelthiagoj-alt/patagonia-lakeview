"use client";

import { useEffect, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { cn } from "@/lib/utils";

type Props = {
  reservationId: string;
  cabinTitle: string;
  /** Number of inbound messages the current user hasn't read yet. */
  unreadCount?: number;
  /** Visual variant — "solid" for primary CTA inside cards, "ghost" for secondary spots. */
  variant?: "solid" | "ghost";
  className?: string;
};

/**
 * Inline "Chat con anfitrión" button that opens a right-side drawer with the
 * ChatPanel inside. Lets users coordinate without leaving the reservation list.
 *
 * - Backdrop click + Escape close the drawer.
 * - Body scroll locks while open.
 * - Respects prefers-reduced-motion via framer-motion.
 */
export function ReservationChatButton({
  reservationId,
  cabinTitle,
  unreadCount = 0,
  variant = "solid",
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isSolid = variant === "solid";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition",
          isSolid
            ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary-hover)]"
            : "border border-[color:var(--color-border)] bg-white/70 text-[color:var(--color-text-primary)] hover:border-[color:var(--color-text-primary)] hover:bg-white",
          className
        )}
      >
        <MessageSquare size={13} strokeWidth={1.75} />
        Chat con anfitrión
        {unreadCount > 0 && (
          <span
            className={cn(
              "ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium",
              isSolid
                ? "bg-[color:var(--color-accent)] text-white"
                : "bg-[color:var(--color-accent)] text-white"
            )}
            aria-label={`${unreadCount} mensajes nuevos`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90] bg-[color:var(--color-background-deep)]/55 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label={`Chat con anfitrión · ${cabinTitle}`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col border-l border-[color:var(--color-border)] bg-[color:var(--color-background)] shadow-[var(--shadow-lift)]"
            >
              <header className="flex items-start justify-between gap-3 border-b border-[color:var(--color-border)] px-5 py-4">
                <div className="min-w-0">
                  <p className="text-eyebrow">Chat con anfitrión</p>
                  <p className="mt-1 truncate text-sm font-medium tracking-tight text-[color:var(--color-text-primary)]">
                    {cabinTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-text-primary)] hover:text-[color:var(--color-text-primary)]"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>
              </header>

              <div className="flex-1 overflow-hidden p-3">
                <ChatPanel reservationId={reservationId} fill />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
