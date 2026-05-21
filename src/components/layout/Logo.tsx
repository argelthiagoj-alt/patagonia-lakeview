import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo + wordmark "Patagonia Lakeview".
 *
 * Comportamiento on-scroll:
 *   - El sello PNG se tinta a marrón cálido (--color-secondary) vía CSS
 *     filter (sepia + hue-rotate + saturate). El fondo del círculo NO
 *     cambia — sólo el contenido. Transición 700ms ease-out-soft.
 *   - El wordmark levemente baja su color a `--color-secondary` y sube
 *     un escalón de peso (500 → 600) para mejor contraste en mobile,
 *     manteniendo la estética AMAN.
 *
 * Cuando `prefers-reduced-motion: reduce`, la transición se acelera (el
 * gate global ya lo deshabilita).
 */
export function Logo({
  className,
  variant = "light",
  scrolled = false,
}: {
  className?: string;
  variant?: "light" | "dark";
  scrolled?: boolean;
}) {
  const tint = scrolled && variant === "light";

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-3 tracking-tight",
        variant === "dark"
          ? "text-[color:var(--color-primary-foreground)]"
          : "text-[color:var(--color-text-primary)]",
        className
      )}
      aria-label="Patagonia Lakeview"
    >
      <span
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-1",
          // El fondo del sello NO cambia. Sólo el ring se suaviza al pasar.
          variant === "dark"
            ? "bg-white ring-white/20"
            : "bg-[color:var(--color-surface)] ring-[color:var(--color-border)]"
        )}
        style={{
          transition: "box-shadow 700ms var(--ease-out-soft)",
        }}
      >
        <Image
          src="/assets/branding/logo.png"
          alt=""
          width={40}
          height={40}
          priority
          className="h-full w-full object-cover"
          style={{
            // Tint marrón sobrio cuando scrollea (en lugar del verde
            // bruto anterior). sepia(1) → satura(1.3) sintoniza la
            // dominante hacia el cálido; hue-rotate -10° la corre al
            // marrón secundario (#5c3822 area).
            filter: tint
              ? "sepia(0.85) saturate(1.25) hue-rotate(-12deg) brightness(0.78)"
              : "none",
            transition: "filter 700ms var(--ease-out-soft)",
          }}
        />
      </span>
      <span
        className="flex flex-col leading-none"
        style={{
          color: tint ? "var(--color-secondary)" : undefined,
          transition: "color 700ms var(--ease-out-soft)",
        }}
      >
        <span
          className="text-xl font-medium tracking-tight"
          style={{
            fontFamily: "var(--font-wordmark)",
            // Slight optical bump para "Patagonia" — la serif Cormorant
            // se ve elegante a 500 sin parecer bold.
            fontWeight: 500,
            letterSpacing: "0.005em",
          }}
        >
          Patagonia
        </span>
        <span
          className="text-[11px] uppercase"
          style={{
            fontFamily: "var(--font-wordmark)",
            // Peso 600 (vs el 400 default anterior) + tracking reducido +
            // opacity 1 con color heredado del padre. Mucho más legible
            // sobre header translúcido y mantiene el look AMAN.
            fontWeight: 600,
            letterSpacing: "0.24em",
            // Textshadow muy sutil para mejorar contraste contra el
            // fondo translúcido del header en mobile.
            textShadow: "0 1px 0 rgba(31, 27, 22, 0.04)",
          }}
        >
          Lakeview
        </span>
      </span>
    </Link>
  );
}
