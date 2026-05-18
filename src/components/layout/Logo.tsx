import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "light",
  scrolled = false,
}: {
  className?: string;
  variant?: "light" | "dark";
  scrolled?: boolean;
}) {
  const bw = scrolled && variant === "light";

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-3 font-medium tracking-tight",
        variant === "dark"
          ? "text-[color:var(--color-primary-foreground)]"
          : "text-[color:var(--color-text-primary)]",
        className
      )}
      aria-label="Patagonia Lakeview"
    >
      <span
        style={{
          filter: bw ? "grayscale(1) contrast(1.05)" : "none",
          transition: "filter 500ms var(--ease-out-soft)",
        }}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-1 duration-500 group-hover:scale-[1.03]",
          variant === "dark"
            ? "bg-white ring-white/20"
            : "bg-[color:var(--color-surface)] ring-[color:var(--color-border)]"
        )}
      >
        <Image
          src="/assets/branding/logo.png"
          alt=""
          width={40}
          height={40}
          priority
          className="h-full w-full object-cover"
        />
      </span>
      <span
        className={cn(
          "flex flex-col leading-none transition-colors duration-500",
          bw && "text-[color:var(--color-text-primary)]"
        )}
      >
        <span className="text-base font-medium">Patagonia</span>
        <span className="text-[10px] uppercase tracking-[0.28em] opacity-70">
          Lakeview
        </span>
      </span>
    </Link>
  );
}
