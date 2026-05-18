import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 text-sm text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-muted)] transition-all duration-200",
        "focus:outline-none focus:border-[color:var(--color-primary)] focus:bg-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

type FieldProps = {
  label: React.ReactNode;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-[color:var(--color-text-muted)]">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-[color:var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
