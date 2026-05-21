"use client";

import { useRef, useState } from "react";
import { AlertCircle, Upload } from "lucide-react";
import {
  ACCEPTED_TYPES,
  processImageFiles,
  uploadErrorMessage,
  type ProcessedImage,
} from "@/lib/image-upload";
import { cn } from "@/lib/utils";

/**
 * Drag-and-drop + click-to-pick image uploader.
 * Self-contained — owns its drag state, processing state and per-file errors.
 * Parent receives the processed images (with data URLs + alt guess) via `onFiles`.
 */
export function ImageDropzone({
  onFiles,
}: {
  onFiles: (images: ProcessedImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || (files as FileList).length === 0) return;
    setIssues([]);
    setProcessing(true);
    try {
      const { images, errors } = await processImageFiles(files);
      if (images.length > 0) onFiles(images);
      if (errors.length > 0) {
        setIssues(
          Array.from(new Set(errors.map((e) => uploadErrorMessage(e))))
        );
      }
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={(e) => {
          // Only flip off when leaving the actual element, not its children
          if (e.currentTarget === e.target) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer",
          dragging
            ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5"
            : "border-[color:var(--color-border)] bg-white/40 hover:border-[color:var(--color-text-primary)] hover:bg-white/60"
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-secondary)]">
          {processing ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : (
            <Upload size={20} strokeWidth={1.5} />
          )}
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
            {processing
              ? "Procesando imágenes…"
              : dragging
              ? "Soltá las imágenes acá"
              : "Arrastrá imágenes o hacé click para elegir"}
          </p>
          <p className="text-xs text-[color:var(--color-text-secondary)]">
            JPG, PNG, WebP o AVIF · hasta 8 MB · se redimensionan a 1600px
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {issues.length > 0 && (
        <ul className="space-y-1 text-xs text-[color:var(--color-error)]">
          {issues.map((m, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <AlertCircle size={12} className="mt-0.5" />
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
