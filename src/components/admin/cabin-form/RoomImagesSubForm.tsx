"use client";

import { useRef, useState } from "react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import { Upload, Trash2, ImageIcon } from "lucide-react";
import {
  processImageFiles,
  uploadErrorMessage,
  UploadError,
  ACCEPTED_TYPES,
} from "@/lib/image-upload";
import type { CabinInput } from "@/modules/cabins/schemas";
import { cn } from "@/lib/utils";

/**
 * Sub-form para imágenes propias de un RoomType (hoteles).
 *
 * Drag & drop + file picker. Acepta múltiples archivos a la vez, los
 * procesa client-side (resize 1600px / JPEG 82%) y los pushea al field
 * array. Si una habitación queda sin imágenes, la vista pública cae a
 * las imágenes generales del hotel padre.
 */
export function RoomImagesSubForm({
  control,
  register,
  index,
}: {
  control: Control<CabinInput>;
  register: UseFormRegister<CabinInput>;
  index: number;
}) {
  const fa = useFieldArray({
    control,
    name: `roomTypes.${index}.images` as const,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null | undefined) {
    if (!files || files.length === 0) return;
    setError(null);
    setPending(true);
    try {
      const { images, errors } = await processImageFiles(files);
      images.forEach((img) =>
        fa.append({ url: img.url, alt: img.alt ?? null })
      );
      if (errors.length) {
        const first = errors.find((e) => e instanceof UploadError);
        if (first instanceof UploadError) setError(uploadErrorMessage(first));
        else setError("Algunas imágenes no se pudieron procesar.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/40 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">
          Imágenes de esta habitación
        </p>
        <span className="text-[10px] text-[color:var(--color-text-muted)]">
          {fa.fields.length}/15 · opcional
        </span>
      </div>

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
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border bg-white/60 px-4 py-5 text-center transition",
          dragOver
            ? "border-[color:var(--color-primary)] ring-2 ring-[color:var(--color-primary)]/30"
            : "border-dashed border-[color:var(--color-border)] hover:border-[color:var(--color-primary)]/60"
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-secondary)]">
          <Upload size={14} strokeWidth={1.5} />
        </span>
        <p className="text-xs font-medium text-[color:var(--color-text-primary)]">
          {pending ? "Procesando…" : "Arrastrá imágenes o elegí archivos"}
        </p>
        <p className="text-[10px] text-[color:var(--color-text-muted)]">
          JPG, PNG, WebP · varias a la vez · max 8 MB c/u
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

      {fa.fields.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fa.fields.map((f, i) => (
            <li key={f.id} className="space-y-1.5">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-white/60">
                <ImagePreview control={control} index={index} i={i} />
                <button
                  type="button"
                  onClick={() => fa.remove(i)}
                  aria-label="Eliminar imagen"
                  className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[color:var(--color-error)] shadow-[var(--shadow-soft)] hover:bg-white"
                >
                  <Trash2 size={12} strokeWidth={1.75} />
                </button>
              </div>
              <input
                type="text"
                placeholder="alt (opcional)"
                className="block w-full rounded-md border border-[color:var(--color-border)] bg-white/60 px-2 py-1 text-[10px] focus:outline-none"
                {...register(`roomTypes.${index}.images.${i}.alt` as const, {
                  setValueAs: (v) =>
                    typeof v === "string" && v.trim() === "" ? null : v,
                })}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ImagePreview({
  control,
  index,
  i,
}: {
  control: Control<CabinInput>;
  index: number;
  i: number;
}) {
  const url = useWatch({
    control,
    name: `roomTypes.${index}.images.${i}.url` as const,
  });
  if (!url) {
    return (
      <div className="flex h-full w-full items-center justify-center text-[color:var(--color-text-muted)]">
        <ImageIcon size={18} strokeWidth={1.5} />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-full w-full object-cover" />;
}
