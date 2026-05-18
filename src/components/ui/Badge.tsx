import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "moss" | "accent" | "stone" | "dark" | "success" | "warning" | "error";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default:
    "bg-white/70 text-[color:var(--color-text-primary)] border border-[color:var(--color-border)]",
  moss:
    "bg-[color:var(--color-moss)]/15 text-[color:var(--color-moss)] border border-[color:var(--color-moss)]/25",
  accent:
    "bg-[color:var(--color-accent)]/12 text-[color:var(--color-accent-hover)] border border-[color:var(--color-accent)]/25",
  stone:
    "bg-[color:var(--color-stone)]/50 text-[color:var(--color-text-primary)] border border-[color:var(--color-border)]",
  dark:
    "bg-[color:var(--color-background-deep)] text-[color:var(--color-primary-foreground)] border border-white/10",
  success:
    "bg-[color:var(--color-success)]/12 text-[color:var(--color-success)] border border-[color:var(--color-success)]/25",
  warning:
    "bg-[color:var(--color-warning)]/12 text-[color:var(--color-warning)] border border-[color:var(--color-warning)]/25",
  error:
    "bg-[color:var(--color-error)]/12 text-[color:var(--color-error)] border border-[color:var(--color-error)]/25",
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
