import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)]/60 py-16 px-6 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-secondary)]">
          <Icon size={20} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-lg font-medium text-[color:var(--color-text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="max-w-md text-sm text-[color:var(--color-text-secondary)]">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Algo salió mal",
  description = "No pudimos cargar este contenido. Intentá nuevamente en unos segundos.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/5 py-12 px-6 text-center",
        className
      )}
    >
      <h3 className="text-lg font-medium text-[color:var(--color-error)]">
        {title}
      </h3>
      <p className="max-w-md text-sm text-[color:var(--color-text-secondary)]">
        {description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
