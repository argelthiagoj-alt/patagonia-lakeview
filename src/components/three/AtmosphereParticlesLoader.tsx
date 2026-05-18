"use client";

import dynamic from "next/dynamic";

export const AtmosphereParticlesLoader = dynamic(
  () =>
    import("@/components/three/AtmosphereParticles").then(
      (m) => m.AtmosphereParticles
    ),
  { ssr: false }
);
