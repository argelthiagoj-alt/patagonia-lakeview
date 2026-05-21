"use client";

import { Controller, type Control, type UseFormRegisterReturn } from "react-hook-form";
import { Input, Field } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { CabinInput } from "@/modules/cabins/schemas";

/**
 * Visual primitives reused across the CabinForm sections.
 * Live in their own file so the orchestrator (CabinForm.tsx) stays focused
 * on the form's flow rather than re-declaring layout helpers.
 */

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-paper space-y-5 p-6 md:p-8">
      <header className="space-y-1.5">
        <h2 className="text-lg font-medium tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function NumField({
  label,
  id,
  register,
  error,
}: {
  label: string;
  id: string;
  register: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <Input id={id} type="number" min={0} {...register} />
    </Field>
  );
}

export function ToggleField({
  label,
  description,
  control,
  name,
}: {
  label: string;
  description?: string;
  control: Control<CabinInput>;
  name: "lakeView" | "isActive";
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex items-start gap-3">
          <span
            role="switch"
            aria-checked={field.value}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                field.onChange(!field.value);
              }
            }}
            onClick={() => field.onChange(!field.value)}
            className={cn(
              "relative mt-0.5 inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border transition",
              field.value
                ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]"
                : "border-[color:var(--color-border)] bg-white"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
                field.value ? "translate-x-5" : "translate-x-1"
              )}
            />
          </span>
          <span className="flex flex-col gap-0.5 text-sm">
            <span className="font-medium text-[color:var(--color-text-primary)]">
              {label}
            </span>
            {description && (
              <span className="text-xs text-[color:var(--color-text-secondary)]">
                {description}
              </span>
            )}
          </span>
        </label>
      )}
    />
  );
}

export function IconBtn({
  children,
  onClick,
  disabled,
  danger,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border transition disabled:opacity-30",
        danger
          ? "border-[color:var(--color-border)] text-[color:var(--color-error)] hover:border-[color:var(--color-error)] hover:bg-[color:var(--color-error)]/8"
          : "border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-text-primary)] hover:text-[color:var(--color-text-primary)]"
      )}
      {...props}
    >
      {children}
    </button>
  );
}
