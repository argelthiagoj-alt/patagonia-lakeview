"use client";

import { useEffect, useRef } from "react";

/**
 * Atmospheric particles overlay rendered with vanilla Three.js.
 *
 * We deliberately avoid @react-three/fiber here:
 *   - It pulls React internals (ReactCurrentOwner) that aren't
 *     stable across React 18/19, which caused runtime crashes.
 *   - This effect is tiny and stateless — we only need a single
 *     mounted canvas with one animation loop.
 *
 * Safety:
 *   - Skips entirely on server.
 *   - Skips if WebGL isn't available.
 *   - Respects prefers-reduced-motion.
 *   - Stops animating off-viewport (no rAF leak).
 *   - Tolerates Three.js import failure with a silent no-op.
 */
export function AtmosphereParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return;

    let cleanup: (() => void) | null = null;

    import("three")
      .then((THREE) => {
        if (cancelled || !container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        // Circular sprite texture, generated on the fly so we don't ship a PNG.
        const tex = (() => {
          const size = 64;
          const c = document.createElement("canvas");
          c.width = c.height = size;
          const ctx = c.getContext("2d");
          if (!ctx) return null;
          const g = ctx.createRadialGradient(
            size / 2,
            size / 2,
            0,
            size / 2,
            size / 2,
            size / 2
          );
          g.addColorStop(0, "rgba(255,255,255,1)");
          g.addColorStop(0.5, "rgba(255,255,255,0.7)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.fill();
          const t = new THREE.CanvasTexture(c);
          t.colorSpace = THREE.SRGBColorSpace;
          return t;
        })();

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
        camera.position.z = 6;

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const COUNT = 220;
        const positions = new Float32Array(COUNT * 3);
        const speeds = new Float32Array(COUNT);

        for (let i = 0; i < COUNT; i++) {
          positions[i * 3 + 0] = (Math.random() - 0.5) * 14;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
          speeds[i] = 0.05 + Math.random() * 0.18;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );

        const material = new THREE.PointsMaterial({
          size: 0.09,
          sizeAttenuation: true,
          color: 0xf5e3c4,
          transparent: true,
          opacity: 0.7,
          depthWrite: false,
          alphaTest: 0.01,
          blending: THREE.AdditiveBlending,
          ...(tex ? { map: tex } : {}),
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        let rafId = 0;
        let visible = true;
        let lastTime = performance.now();

        const tick = (now: number) => {
          const delta = Math.min(0.05, (now - lastTime) / 1000);
          lastTime = now;

          const arr = geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < COUNT; i++) {
            arr[i * 3 + 1] += speeds[i] * delta * 0.25;
            if (arr[i * 3 + 1] > 4) arr[i * 3 + 1] = -4;
            arr[i * 3 + 0] +=
              Math.sin((arr[i * 3 + 1] + i) * 0.4) * delta * 0.04;
          }
          geometry.attributes.position.needsUpdate = true;
          points.rotation.y += delta * 0.01;

          renderer.render(scene, camera);
          if (visible) rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        const onResize = () => {
          const w = container.clientWidth;
          const h = container.clientHeight;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", onResize);

        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              visible = entry.isIntersecting;
              if (visible) {
                lastTime = performance.now();
                rafId = requestAnimationFrame(tick);
              } else {
                cancelAnimationFrame(rafId);
              }
            }
          },
          { threshold: 0 }
        );
        observer.observe(container);

        cleanup = () => {
          cancelAnimationFrame(rafId);
          observer.disconnect();
          window.removeEventListener("resize", onResize);
          geometry.dispose();
          material.dispose();
          tex?.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
        stopRef.current = cleanup;
      })
      .catch(() => {
        // Three.js failed to load — fail silently, the page keeps working.
      });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
      else if (stopRef.current) stopRef.current();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-[5] opacity-70 mix-blend-screen"
    />
  );
}
