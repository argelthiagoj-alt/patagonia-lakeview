"use client";

import { Controller, type Control } from "react-hook-form";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { CabinInput } from "@/modules/cabins/schemas";

/**
 * URL input that auto-collapses when the value is a data: URL
 * (i.e. an image uploaded from disk) so the textarea-of-base64 doesn't
 * clutter the form. Falls back to a regular text input for remote URLs.
 */
export function ImageUrlField({
  control,
  index,
}: {
  control: Control<CabinInput>;
  index: number;
}) {
  return (
    <Controller
      control={control}
      name={`images.${index}.url`}
      render={({ field }) => {
        const isData = field.value?.startsWith("data:");
        if (isData) {
          const sizeKb = Math.round((field.value.length * 0.75) / 1024);
          return (
            <div className="flex h-11 items-center justify-between gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 text-sm">
              <span className="inline-flex items-center gap-1.5 text-[color:var(--color-text-secondary)]">
                <Upload size={12} strokeWidth={1.75} />
                Subida desde el dispositivo · ~{sizeKb} KB
              </span>
              <button
                type="button"
                onClick={() => field.onChange("")}
                className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-error)]"
              >
                Quitar
              </button>
            </div>
          );
        }
        return (
          <Input
            placeholder="https://…/foto.jpg"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        );
      }}
    />
  );
}
