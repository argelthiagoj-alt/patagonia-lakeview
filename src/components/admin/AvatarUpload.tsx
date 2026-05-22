"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, ImageIcon } from "lucide-react";
import {
  processImageFile,
  uploadErrorMessage,
  UploadError,
  ACCEPTED_TYPES,
} from "@/lib/image-upload";
import { cn } from "@/lib/utils";

/**
 * AvatarUpload — uploader friendly de una sola imagen (avatar / logo).
 *
 * - Drag & drop o click para abrir el file picker.
 * - Procesa client-side con `processImageFile` (resize a max 1600px, JPEG
 *   ~82% quality). El resultado es una data URL → se envía como string
 *   directamente al backend, sin almacenamiento externo.
 * - Estado vacío: silueta neutral con CTA "Subir foto".
 * - Estado lleno: muestra la imagen con botones "Cambiar" / "Quitar".
 *
 * Forma:
 *   - shape="circle" (default) → ideal avatar anfitrión.
 *   - shape="rounded" → logo institucional, esquinas suavizadas.
 */
export function AvatarUpload({
  value,
  onChange,
  label = "Foto",
  shape = "circle",
}: {
  value: string | null;
  onChange: (next: string | null) => void;
  label?: string;
  shape?: "circle" | "rounded";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    setError(null);
    setPending(true);
    try {
      const processed = await processImageFile(file);
      onChange(processed.url);
    } catch (err) {
      if (err instanceof UploadError) setError(uploadErrorMessage(err));
      else setError("No pudimos procesar la imagen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            handleFile(f);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label={value ? "Cambiar imagen" : "Subir imagen"}
          className={cn(
            "relative h-28 w-28 shrink-0 cursor-pointer overflow-hidden border bg-[color:var(--color-surface-muted)] transition",
            shape === "circle" ? "rounded-full" : "rounded-2xl",
            dragOver
              ? "border-[color:var(--color-primary)] ring-2 ring-[color:var(--color-primary)]/30"
              : "border-[color:var(--color-border)] hover:border-[color:var(--color-primary)]/60"
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[color:var(--color-text-muted)]">
              <ImageIcon size={20} strokeWidth={1.5} />
              <span className="text-[10px] uppercase tracking-[0.16em]">
                Arrastrá
              </span>
            </div>
          )}
          {pending && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-xs text-white">
              Procesando…
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white/60 px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-primary)] disabled:opacity-50"
            >
              <Upload size={12} strokeWidth={1.75} />
              {value ? "Cambiar" : "Subir foto"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white/60 px-3 py-1.5 text-xs font-medium text-[color:var(--color-error)] transition hover:border-[color:var(--color-error)] disabled:opacity-50"
              >
                <Trash2 size={12} strokeWidth={1.75} />
                Quitar
              </button>
            )}
          </div>
          <p className="text-[11px] text-[color:var(--color-text-muted)]">
            JPG, PNG o WebP. Max 8 MB. Recortamos automáticamente.
          </p>
          {error && (
            <p className="text-xs text-[color:var(--color-error)]">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
