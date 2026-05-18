import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-[var(--ease-out-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-background)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary-hover)] hover:-translate-y-0.5 shadow-[var(--shadow-soft)]",
        accent:
          "bg-[color:var(--color-accent)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-accent-hover)] hover:-translate-y-0.5 shadow-[var(--shadow-soft)]",
        secondary:
          "bg-[color:var(--color-surface)] text-[color:var(--color-text-primary)] border border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-muted)]",
        ghost:
          "bg-transparent text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-surface-muted)]",
        outline:
          "bg-transparent text-[color:var(--color-text-primary)] border border-[color:var(--color-border)] hover:border-[color:var(--color-text-primary)]",
        dark:
          "bg-[color:var(--color-background-deep)] text-[color:var(--color-primary-foreground)] hover:bg-black hover:-translate-y-0.5",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-9 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

type LinkButtonProps = React.ComponentProps<typeof Link> &
  VariantProps<typeof buttonVariants>;

export function LinkButton({
  className,
  variant,
  size,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
