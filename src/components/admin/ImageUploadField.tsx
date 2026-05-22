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
 * ImageUploadField — uploader único (1 imagen) reutilizable en todo el
 * admin: landing atmosphere, branding, fallback images, etc.
 *
 * - Drag & drop nativo + file picker (`<input type="file">`).
 * - Procesa client-side con `processImageFile`: resize automático a max
 *   1600px, JPEG ~82%. Devuelve un data URL (`onChange(string)`).
 * - Sin almacenamiento externo: el data URL se persiste como string en
 *   Postgres. Cuando integremos S3/Vercel Blob, sólo cambia `processImageFile`.
 * - Aspect configurable (16:9 default — premium para heros / logos).
 * - Drag-over states visibles y accesible por teclado.
 */
export function ImageUploadField({
  value,
  onChange,
  label,
  hint,
  aspect = "16/9",
  emptyHint = "Arrastrá una imagen o hacé click para elegir",
}: {
  value: string | null;
  onChange: (next: string | null) => void;
  label?: string;
  hint?: string;
  /** Tailwind aspect ratio. "16/9" default, "1/1" para logos cuadrados. */
  aspect?: "16/9" | "4/3" | "1/1" | "5/4";
  emptyHint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const aspectClass =
    aspect === "1/1"
      ? "aspect-square"
      : aspect === "4/3"
      ? "aspect-[4/3]"
      : aspect === "5/4"
      ? "aspect-[5/4]"
      : "aspect-video";

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">
          {label}
        </p>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label={value ? "Cambiar imagen" : "Subir imagen"}
        className={cn(
          "group relative w-full cursor-pointer overflow-hidden rounded-2xl border bg-[color:var(--color-surface-muted)] transition",
          aspectClass,
          dragOver
            ? "border-[color:var(--color-primary)] ring-2 ring-[color:var(--color-primary)]/30"
            : "border-dashed border-[color:var(--color-border)] hover:border-[color:var(--color-primary)]/60"
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
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center text-[color:var(--color-text-muted)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-[color:var(--color-text-secondary)]">
              <ImageIcon size={18} strokeWidth={1.5} />
            </span>
            <p className="text-sm text-[color:var(--color-text-primary)]">
              {emptyHint}
            </p>
            <p className="text-[11px] text-[color:var(--color-text-muted)]">
              JPG, PNG, WebP · max 8 MB · se ajusta automáticamente
            </p>
          </div>
        )}

        {pending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white">
            Procesando…
          </div>
        )}

        {value && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-end opacity-0 transition-opacity group-hover:opacity-100">
            <div className="pointer-events-auto m-3 flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] hover:bg-white"
              >
                <Upload size={12} strokeWidth={1.75} />
                Cambiar
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-[color:var(--color-error)] shadow-[var(--shadow-soft)] hover:bg-white"
              >
                <Trash2 size={12} strokeWidth={1.75} />
                Quitar
              </button>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {(hint || error) && (
        <p
          className={cn(
            "text-xs",
            error
              ? "text-[color:var(--color-error)]"
              : "text-[color:var(--color-text-muted)]"
          )}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
