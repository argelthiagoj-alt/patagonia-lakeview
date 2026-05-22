"use client";

import { useEffect, useMemo, useState } from "react";
import type { Season } from "@/modules/seasonal-theme/config";

/**
 * Capa decorativa estacional — diseño premium, sin librerías 3D.
 *
 * Estrategia por estación:
 *   - autumn (otoño): hojas SVG cayendo dispersas (look ya validado).
 *   - winter (invierno): copos simétricos con profundidad (validado).
 *   - summer (verano): bruma luminosa — orbs cálidos pulsantes,
 *     gradient ambient muy sutil, sin "caer". Evoca el reflejo del sol
 *     en el lago. **Reemplaza** el sistema Three.js anterior.
 *   - spring (primavera): luciérnagas/orbs rosa pálido que respiran.
 *     No flores cayendo — es premium, no infantil.
 *
 * Garantías:
 *   - `pointer-events: none` → nunca tapa CTAs/inputs.
 *   - `z-index: 0` (debajo del contenido `relative z-10`).
 *   - Cantidad y velocidad adaptan a mobile.
 *   - `prefers-reduced-motion: reduce` → no renderiza nada.
 *   - SVG/CSS-only → bundle liviano, sin Three.js.
 *   - Mount via IntersectionObserver opcional (el component vive
 *     dentro del Hero que siempre está mounted; no necesita ser lazy).
 */
export function SeasonalAtmosphere({
  season,
  intensity = "MEDIUM",
  enabled = true,
}: {
  season: Season;
  intensity?: "LOW" | "MEDIUM" | "HIGH";
  enabled?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!enabled || !mounted) return null;

  const multiplier =
    intensity === "LOW" ? 0.6 : intensity === "HIGH" ? 1.4 : 1;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
      style={{ zIndex: 0 }}
    >
      {season === "summer" && (
        <SummerAura isMobile={isMobile} multiplier={multiplier} />
      )}
      {season === "spring" && (
        <SpringFireflies isMobile={isMobile} multiplier={multiplier} />
      )}
      {season === "autumn" && (
        <FallingParticles
          season="autumn"
          isMobile={isMobile}
          multiplier={multiplier}
        />
      )}
      {season === "winter" && (
        <FallingParticles
          season="winter"
          isMobile={isMobile}
          multiplier={multiplier}
        />
      )}
    </div>
  );
}

/* ─────────── Pseudo-random determinístico ─────────── */
function pseudo(seed: number, salt: number) {
  const v = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/* ─────────────────────── VERANO ───────────────────────
   "Bruma luminosa": 2 gradientes radiales que respiran muy lento +
   pequeños orbs cálidos suspendidos que pulsan. Cero movimiento
   vertical agresivo. Sensación de luz reflejada en el agua. */

function SummerAura({
  isMobile,
  multiplier,
}: {
  isMobile: boolean;
  multiplier: number;
}) {
  const base = isMobile ? 7 : 14;
  const count = Math.round(base * multiplier);
  const orbs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        i,
        left: pseudo(i, 1) * 100,
        top: 10 + pseudo(i, 2) * 70,
        size: (isMobile ? 60 : 110) + pseudo(i, 3) * (isMobile ? 60 : 140),
        delay: pseudo(i, 4) * 10,
        duration: 9 + pseudo(i, 5) * 9,
        opacity: 0.12 + pseudo(i, 6) * 0.22,
      })),
    [count, isMobile]
  );

  return (
    <>
      <style>{`
        @keyframes lakeview-breathe {
          0%, 100% { opacity: var(--orb-min, 0.18); transform: scale(0.92); }
          50%      { opacity: var(--orb-max, 0.42); transform: scale(1.08); }
        }
        @keyframes lakeview-aura-drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(2vw, -1.5vh, 0); }
        }
      `}</style>

      {/* Capa ambiente: gradient radial sutil. CSS-only, GPU-friendly. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 30%, rgba(255, 220, 170, 0.18), transparent 70%), radial-gradient(50% 40% at 20% 80%, rgba(255, 200, 140, 0.12), transparent 70%)",
          animation: "lakeview-aura-drift 24s ease-in-out infinite",
        }}
      />

      {orbs.map((o) => (
        <span
          key={o.i}
          style={{
            position: "absolute",
            left: `${o.left}%`,
            top: `${o.top}%`,
            width: `${o.size}px`,
            height: `${o.size}px`,
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(255, 230, 190, 0.7) 0%, rgba(255, 200, 140, 0.25) 35%, transparent 70%)",
            filter: "blur(8px)",
            ["--orb-min" as string]: o.opacity * 0.55,
            ["--orb-max" as string]: o.opacity,
            animation: `lakeview-breathe ${o.duration}s ease-in-out ${o.delay}s infinite`,
            willChange: "opacity, transform",
          }}
        />
      ))}
    </>
  );
}

/* ─────────────────────── PRIMAVERA ───────────────────────
   "Luciérnagas rosadas": puntos pequeños rosa-pálido que pulsan y
   se desplazan muy lento de manera errática. No caen como pétalos;
   parecen polvo de cerezo flotando en el aire. */

function SpringFireflies({
  isMobile,
  multiplier,
}: {
  isMobile: boolean;
  multiplier: number;
}) {
  const base = isMobile ? 14 : 26;
  const count = Math.round(base * multiplier);
  const points = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        i,
        left: pseudo(i, 1) * 100,
        top: 10 + pseudo(i, 2) * 80,
        size: (isMobile ? 3 : 4) + pseudo(i, 3) * (isMobile ? 3 : 5),
        delay: pseudo(i, 4) * 12,
        duration: 7 + pseudo(i, 5) * 6,
        driftX: (pseudo(i, 6) - 0.5) * (isMobile ? 8 : 16),
        driftY: (pseudo(i, 7) - 0.5) * (isMobile ? 6 : 12),
        opacity: 0.4 + pseudo(i, 8) * 0.5,
      })),
    [count, isMobile]
  );

  return (
    <>
      <style>{`
        @keyframes lakeview-firefly {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) scale(0.7);
          }
          18% {
            opacity: var(--ff-opacity, 0.7);
            transform: translate3d(calc(var(--ff-x) * 0.3), calc(var(--ff-y) * 0.3), 0) scale(1);
          }
          50% {
            opacity: var(--ff-opacity, 0.7);
            transform: translate3d(var(--ff-x, 0vw), var(--ff-y, 0vh), 0) scale(1.05);
          }
          82% {
            opacity: var(--ff-opacity, 0.7);
            transform: translate3d(calc(var(--ff-x) * 0.6), calc(var(--ff-y) * 1.2), 0) scale(0.95);
          }
          100% {
            opacity: 0;
            transform: translate3d(0, calc(var(--ff-y) * 1.4), 0) scale(0.7);
          }
        }
      `}</style>
      {points.map((p) => (
        <span
          key={p.i}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(255, 220, 230, 0.95) 0%, rgba(232, 168, 184, 0.7) 50%, transparent 80%)",
            boxShadow: "0 0 8px rgba(255, 200, 215, 0.55)",
            ["--ff-x" as string]: `${p.driftX}vw`,
            ["--ff-y" as string]: `${p.driftY}vh`,
            ["--ff-opacity" as string]: p.opacity,
            animation: `lakeview-firefly ${p.duration}s ease-in-out ${p.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </>
  );
}

/* ─────────────────── Otoño + Invierno (caer) ─────────────────── */

function FallingParticles({
  season,
  isMobile,
  multiplier,
}: {
  season: "autumn" | "winter";
  isMobile: boolean;
  multiplier: number;
}) {
  const base = isMobile ? 8 : 18;
  const count = Math.round(base * multiplier);
  const speedFactor = isMobile ? 1.4 : 1;

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const baseLeft = ((i + 0.5) / count) * 100;
        const jitter = (pseudo(i, 1) - 0.5) * (90 / count);
        const left = Math.max(0, Math.min(100, baseLeft + jitter));
        const startTop = -(20 + pseudo(i, 2) * 80);
        const baseDuration = isMobile ? 22 : 16;
        const duration = (baseDuration + pseudo(i, 3) * 12) * speedFactor;
        const delay = pseudo(i, 4) * duration;
        const drift = (pseudo(i, 5) - 0.5) * (isMobile ? 14 : 28);
        const size =
          season === "winter"
            ? (isMobile ? 4 : 6) + pseudo(i, 6) * (isMobile ? 4 : 6)
            : (isMobile ? 10 : 14) + pseudo(i, 6) * (isMobile ? 8 : 12);
        const opacity = 0.35 + pseudo(i, 7) * 0.45;
        const spin = season === "autumn" ? 180 : 0;
        return {
          i,
          left,
          startTop,
          duration,
          delay,
          drift,
          size,
          opacity,
          spin,
        };
      }),
    [count, isMobile, season, speedFactor]
  );

  return (
    <>
      <style>{`
        @keyframes seasonal-fall {
          0% {
            transform: translate3d(0, var(--p-start, -40vh), 0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: var(--p-opacity, 0.6); }
          90% { opacity: var(--p-opacity, 0.6); }
          100% {
            transform: translate3d(var(--p-drift, 0vw), 120vh, 0)
              rotate(var(--p-spin, 0deg));
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((p) => (
        <span
          key={p.i}
          style={{
            position: "absolute",
            top: 0,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            ["--p-start" as string]: `${p.startTop}vh`,
            ["--p-drift" as string]: `${p.drift}vw`,
            ["--p-opacity" as string]: p.opacity,
            ["--p-spin" as string]: `${p.spin}deg`,
            animation: `seasonal-fall ${p.duration}s linear ${p.delay}s infinite`,
            willChange: "transform, opacity",
            display: "inline-block",
          }}
        >
          {season === "autumn" ? <Leaf /> : <Snowflake />}
        </span>
      ))}
    </>
  );
}

/* ─────────────────── Glyphs (autumn / winter) ─────────────────── */

function Leaf() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="none"
      stroke="rgba(173, 97, 48, 0.85)"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M12 2c4 3 7 7 7 11s-3 7-7 9c-4-2-7-5-7-9s3-8 7-11z"
        fill="rgba(201, 121, 61, 0.7)"
      />
      <path d="M12 4v18M12 8l-3 2M12 12l-3 2M12 16l-3 2M12 8l3 2M12 12l3 2M12 16l3 2" />
    </svg>
  );
}

function Snowflake() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none">
      <g
        stroke="rgba(255, 255, 255, 0.95)"
        strokeWidth="0.9"
        strokeLinecap="round"
      >
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i * 60 * Math.PI) / 180;
          const x = 12 + Math.cos(a) * 9;
          const y = 12 + Math.sin(a) * 9;
          const bx1 = 12 + Math.cos(a) * 5 + Math.cos(a - Math.PI / 4) * 2;
          const by1 = 12 + Math.sin(a) * 5 + Math.sin(a - Math.PI / 4) * 2;
          const bx2 = 12 + Math.cos(a) * 5 + Math.cos(a + Math.PI / 4) * 2;
          const by2 = 12 + Math.sin(a) * 5 + Math.sin(a + Math.PI / 4) * 2;
          return (
            <g key={i}>
              <line x1="12" y1="12" x2={x} y2={y} />
              <line
                x1={12 + Math.cos(a) * 5}
                y1={12 + Math.sin(a) * 5}
                x2={bx1}
                y2={by1}
              />
              <line
                x1={12 + Math.cos(a) * 5}
                y1={12 + Math.sin(a) * 5}
                x2={bx2}
                y2={by2}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
