"use client";

import { useMemo } from "react";
import type { Season } from "@/modules/seasonal-theme/config";

/**
 * Capa decorativa estacional: hojas (otoño), copos (invierno), pétalos
 * (primavera). Verano no usa este componente — sigue con la capa Three.js
 * existente.
 *
 * Sin librerías. CSS-only con `transform` + `opacity`. La cantidad de
 * partículas (PARTICLE_COUNT) está acotada para no degradar mobile.
 * Cuando `prefers-reduced-motion: reduce`, no se renderiza nada.
 */
export function SeasonalAtmosphere({ season }: { season: Season }) {
  // Sólo 3 temporadas tienen partículas. Verano se va por la otra rama.
  if (season === "summer") return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-[1] overflow-hidden motion-reduce:hidden"
    >
      <Particles season={season} />
    </div>
  );
}

const PARTICLE_COUNT = 18;

/** Pseudo-random determinístico por índice (sin hooks de cliente). */
function pseudo(seed: number, salt: number) {
  const v = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function Particles({ season }: { season: Exclude<Season, "summer"> }) {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const left = pseudo(i, 1) * 100; // %
        const delay = pseudo(i, 2) * 12; // s
        const duration = 14 + pseudo(i, 3) * 10; // s
        const drift = (pseudo(i, 4) - 0.5) * 30; // vw
        const size = 10 + pseudo(i, 5) * 14; // px
        const opacity = 0.45 + pseudo(i, 6) * 0.4;
        return { i, left, delay, duration, drift, size, opacity };
      }),
    []
  );

  const glyph =
    season === "autumn" ? "❦" : season === "winter" ? "❄" : "✿";
  const color =
    season === "autumn"
      ? "rgba(201, 121, 61, 0.85)"
      : season === "winter"
      ? "rgba(255, 255, 255, 0.85)"
      : "rgba(106, 143, 74, 0.75)";

  return (
    <>
      <style>{`
        @keyframes seasonal-fall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 0;
          }
          12% {
            opacity: var(--p-opacity, 0.7);
          }
          100% {
            transform: translate3d(var(--p-drift, 0vw), 110vh, 0)
              rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((p) => (
        <span
          key={p.i}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            color,
            ["--p-drift" as string]: `${p.drift}vw`,
            ["--p-opacity" as string]: p.opacity,
            animation: `seasonal-fall ${p.duration}s linear ${p.delay}s infinite`,
            willChange: "transform, opacity",
            userSelect: "none",
          }}
        >
          {glyph}
        </span>
      ))}
    </>
  );
}
