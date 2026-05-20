"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  senderId: string;
  sender: {
    name: string | null;
    email: string;
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
  };
};

type State =
  | { kind: "loading" }
  | { kind: "ready"; messages: Message[]; currentUserId: string }
  | { kind: "error"; message: string };

export function ChatPanel({ reservationId }: { reservationId: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservations/${reservationId}/messages`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setState({
          kind: "error",
          message:
            res.status === 403
              ? "No tenés acceso a este chat."
              : data?.error ?? "No pudimos cargar los mensajes.",
        });
        return;
      }
      const data = (await res.json()) as {
        messages: Message[];
        currentUserId: string;
      };
      setState({
        kind: "ready",
        messages: data.messages,
        currentUserId: data.currentUserId,
      });
    } catch {
      setState({ kind: "error", message: "Sin conexión." });
    }
  }, [reservationId]);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh when tab regains focus
  useEffect(() => {
    function onFocus() {
      load();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (state.kind !== "ready") return;
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const value = draft.trim();
    if (!value || sending) return;
    setSendError(null);
    setSending(true);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSendError(data?.error ?? "No pudimos enviar el mensaje.");
        return;
      }
      setDraft("");
      await load();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="surface-paper flex h-[480px] flex-col overflow-hidden p-0">
      <header className="flex items-center gap-2 border-b border-[color:var(--color-border)] px-5 py-3">
        <MessageSquare size={14} strokeWidth={1.75} />
        <p className="text-sm font-medium">Chat con {""}
          <span className="text-[color:var(--color-text-secondary)]">
            anfitrión / huésped
          </span>
        </p>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {state.kind === "loading" && (
          <div className="flex h-full items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
            <Loader2 size={16} className="mr-2 animate-spin" /> Cargando…
          </div>
        )}
        {state.kind === "error" && (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[color:var(--color-error)]">
            {state.message}
          </div>
        )}
        {state.kind === "ready" && state.messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-[color:var(--color-text-secondary)]">
            <MessageSquare size={20} strokeWidth={1.5} />
            <p>Sin mensajes todavía.</p>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Coordiná la llegada, dudas o servicios extra dentro de la
              plataforma.
            </p>
          </div>
        )}
        {state.kind === "ready" &&
          state.messages.map((m) => {
            const mine = m.senderId === state.currentUserId;
            const role =
              m.sender.role === "USER"
                ? "Huésped"
                : m.sender.role === "ADMIN"
                ? "Anfitrión"
                : "Super-admin";
            return (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col gap-1",
                  mine ? "items-end" : "items-start"
                )}
              >
                <span className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-muted)]">
                  {mine ? "Vos" : `${m.sender.name ?? m.sender.email} · ${role}`}
                </span>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words",
                    mine
                      ? "bg-[color:var(--color-primary)] text-white"
                      : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-primary)]"
                  )}
                >
                  {m.body}
                </div>
                <span className="text-[10px] text-[color:var(--color-text-muted)]">
                  {new Date(m.createdAt).toLocaleString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })}
                  {mine && m.readAt && " · leído"}
                </span>
              </div>
            );
          })}
      </div>

      <form
        onSubmit={send}
        className="border-t border-[color:var(--color-border)] p-3 flex items-end gap-2"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder="Escribí un mensaje…"
          className="flex-1 resize-none rounded-2xl border border-[color:var(--color-border)] bg-white/60 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e as unknown as React.FormEvent);
            }
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={sending || draft.trim().length === 0}
        >
          {sending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} strokeWidth={1.75} />
          )}
          Enviar
        </Button>
      </form>
      {sendError && (
        <p className="px-5 pb-2 text-xs text-[color:var(--color-error)]">
          {sendError}
        </p>
      )}
    </div>
  );
}
