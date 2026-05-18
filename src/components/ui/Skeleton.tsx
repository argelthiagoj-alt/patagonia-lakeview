import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-[color:var(--color-surface-muted)]",
        "after:absolute after:inset-0 after:animate-shimmer after:content-['']",
        className
      )}
      {...props}
    />
  );
}
