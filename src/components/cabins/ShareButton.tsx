"use client";

import { useState, useTransition } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Botón compartir publicación.
 *   - Si el browser expone `navigator.share`, abre el sheet nativo.
 *   - Si no, cae a `clipboard.writeText()` y muestra "Link copiado".
 *   - Si todo falla (browsers viejos), abre `mailto:` con el link.
 */
export function ShareButton({
  title,
  text,
  url,
  className,
}: {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const target = url ?? (typeof window !== "undefined" ? window.location.href : "");
      try {
        if (typeof navigator !== "undefined" && "share" in navigator) {
          await (navigator as Navigator & {
            share: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
          }).share({ title, text, url: target });
          return;
        }
      } catch {
        // El usuario canceló o el browser rechazó: caemos a clipboard.
      }
      try {
        await navigator.clipboard.writeText(target);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        // Fallback final: mailto con el link.
        window.location.href = `mailto:?subject=${encodeURIComponent(
          title
        )}&body=${encodeURIComponent(target)}`;
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white/85 px-3 text-xs font-medium text-[color:var(--color-text-primary)] backdrop-blur transition hover:border-[color:var(--color-primary)]",
        className
      )}
    >
      {copied ? <Check size={12} strokeWidth={1.75} /> : <Share2 size={12} strokeWidth={1.75} />}
      {copied ? "Copiado" : "Compartir"}
    </button>
  );
}
