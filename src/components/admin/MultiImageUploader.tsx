"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, ArrowUp, ArrowDown, Star, ImageIcon } from "lucide-react";
import {
  processImageFiles,
  uploadErrorMessage,
  UploadError,
  ACCEPTED_TYPES,
} from "@/lib/image-upload";
import { cn } from "@/lib/utils";

export type UploadedImage = {
  url: string;
  alt?: string | null;
};

/**
 * Componente reutilizable para subir múltiples imágenes con drag & drop,
 * file picker, reorder (↑↓), eliminar, y elegir cuál es la principal
 * (la primera es siempre la "principal" en el modelo — el botón estrella
 * la mueve a la posición 0).
 *
 * - Procesa cada archivo client-side (`processImageFiles`): resize a
 *   1600px, JPEG 82%, max 8 MB por archivo.
 * - Devuelve `UploadedImage[]` via `onChange`.
 * - Sin URLs externas; el flujo es siempre desde archivos del usuario.
 * - Mobile-friendly: tap para abrir picker, mismo grid responsive.
 *
 * Usalo tanto para galleryImages de Destination como images[] de
 * TourismItem.
 */
export function MultiImageUploader({
  value,
  onChange,
  max = 15,
  label,
  hint = "Arrastrá fotos acá o hacé click para elegirlas",
}: {
  value: UploadedImage[];
  onChange: (next: UploadedImage[]) => void;
  max?: number;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null | undefined) {
    if (!files || files.length === 0) return;
    if (value.length >= max) {
      setError(`Llegaste al máximo de ${max} imágenes.`);
      return;
    }
    setError(null);
    setPending(true);
    try {
      const { images, errors } = await processImageFiles(files);
      const room = max - value.length;
      const next = [
        ...value,
        ...images.slice(0, room).map((img) => ({ url: img.url, alt: null })),
      ];
      onChange(next);
      if (errors.length) {
        const first = errors.find((e) => e instanceof UploadError);
        if (first instanceof UploadError) setError(uploadErrorMessage(first));
        else setError("Algunas imágenes no se pudieron procesar.");
      }
    } finally {
      setPending(false);
    }
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function move(i: number, delta: number) {
    const next = [...value];
    const target = i + delta;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  }

  function setMain(i: number) {
    if (i === 0) return;
    const next = [...value];
    const [picked] = next.splice(i, 1);
    next.unshift(picked);
    onChange(next);
  }

  function updateAlt(i: number, alt: string) {
    onChange(value.map((img, idx) => (idx === i ? { ...img, alt } : img)));
  }

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">
          {label}
        </p>
      )}

      {/* Dropzone */}
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
          handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border bg-white/60 px-4 py-6 text-center transition",
          dragOver
            ? "border-[color:var(--color-primary)] ring-2 ring-[color:var(--color-primary)]/30"
            : "border-dashed border-[color:var(--color-border)] hover:border-[color:var(--color-primary)]/60"
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-secondary)]">
          <Upload size={16} strokeWidth={1.5} />
        </span>
        <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
          {pending ? "Procesando…" : hint}
        </p>
        <p className="text-[11px] text-[color:var(--color-text-muted)]">
          JPG · PNG · WebP — varias a la vez — max {max} · 8 MB c/u
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-xs text-[color:var(--color-error)]">{error}</p>
      )}

      {/* Galería con controles */}
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((img, i) => (
            <li
              key={`${i}-${img.url.slice(-20)}`}
              className="surface-paper space-y-2 p-2 text-xs"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-[color:var(--color-surface-muted)]">
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt={img.alt ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[color:var(--color-text-muted)]">
                    <ImageIcon size={16} strokeWidth={1.5} />
                  </div>
                )}
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-primary)] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-[color:var(--color-primary-foreground)]">
                    <Star
                      size={9}
                      strokeWidth={1.75}
                      className="fill-current"
                    />
                    Principal
                  </span>
                )}
              </div>
              <input
                type="text"
                value={img.alt ?? ""}
                onChange={(e) => updateAlt(i, e.target.value)}
                placeholder="alt (opcional)"
                className="block w-full rounded-md border border-[color:var(--color-border)] bg-white/60 px-2 py-1 text-[11px] focus:outline-none"
              />
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Subir"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white/60 text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-primary)] disabled:opacity-40"
                  >
                    <ArrowUp size={11} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === value.length - 1}
                    aria-label="Bajar"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white/60 text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-primary)] disabled:opacity-40"
                  >
                    <ArrowDown size={11} strokeWidth={1.75} />
                  </button>
                </div>
                <div className="flex gap-1">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => setMain(i)}
                      aria-label="Marcar como principal"
                      title="Hacer principal"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white/60 text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                    >
                      <Star size={11} strokeWidth={1.75} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="Eliminar"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white/60 text-[color:var(--color-error)] transition hover:border-[color:var(--color-error)]"
                  >
                    <Trash2 size={11} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
