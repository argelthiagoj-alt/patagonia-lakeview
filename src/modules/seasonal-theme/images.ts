/**
 * Set de imágenes hero/landing por temporada.
 *
 * Mantener client-safe (lo usan tanto server components como client).
 * Si una imagen específica falla en runtime, los components ya usan
 * `SafeImage` que cae al placeholder; acá no hace falta lógica extra.
 *
 * Las URLs siguen el mismo patrón que `@/lib/images.ts` (Unsplash con
 * `?auto=format&fit=crop`). Reemplazar por `/images/...` locales más
 * adelante NO requiere cambios en components: sólo en este archivo.
 */

import type { Season } from "./config";
import { siteImages, type ImageAsset } from "@/lib/images";

const unsplash = (id: string, w = 2000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export type SeasonImages = {
  /** Hero principal de la landing. */
  hero: ImageAsset;
  /** Secundario para overlays / OG cuando aplique. */
  heroSecondary: ImageAsset;
  /** Galería de 3 imágenes ambientales para secciones como AtmosphereGrid. */
  ambient: [ImageAsset, ImageAsset, ImageAsset];
};

export const SEASON_IMAGES: Record<Season, SeasonImages> = {
  // Verano: estética actual (lago + cumbres + bosque dorado).
  summer: {
    hero: siteImages.heroPrimary,
    heroSecondary: siteImages.heroSecondary,
    ambient: [
      siteImages.aboutLake,
      siteImages.experienceMountain,
      siteImages.aboutForest,
    ],
  },
  // Otoño: cobres, hojas, fuego, senderos cálidos.
  autumn: {
    hero: {
      url: unsplash("1507371341162-763b5e419408"),
      alt: "Bosque otoñal con hojas cobre y luz dorada",
    },
    heroSecondary: {
      url: unsplash("1474440692490-2e83ae13ba29", 1600),
      alt: "Sendero entre árboles otoñales",
    },
    ambient: [
      {
        url: unsplash("1502230831726-fe5549140034", 1400),
        alt: "Chimenea encendida adentro de una cabaña",
      },
      {
        url: unsplash("1508921912186-1d1a45ebb3c1", 1400),
        alt: "Carpa armada en bosque otoñal al atardecer",
      },
      {
        url: unsplash("1476611317561-60117649dd94", 1400),
        alt: "Sendero entre hojas caídas",
      },
    ],
  },
  // Invierno: nieve, montaña, hogar.
  winter: {
    hero: {
      url: unsplash("1483921020237-2ff51e8e4b22"),
      alt: "Montañas nevadas al amanecer con cielo despejado",
    },
    heroSecondary: {
      url: unsplash("1551524559-8af4e6624178", 1600),
      alt: "Cabaña con luces tibias sobre paisaje nevado",
    },
    ambient: [
      {
        url: unsplash("1551524559-8af4e6624178", 1400),
        alt: "Cabaña iluminada en montaña nevada",
      },
      {
        url: unsplash("1521488674822-8a6c89c61c8a", 1400),
        alt: "Esquiadores en pista de montaña",
      },
      {
        url: unsplash("1486520299386-6d106b22014b", 1400),
        alt: "Fogata al atardecer en montaña fría",
      },
    ],
  },
  // Primavera: verdes vivos, agua, campamento, sendero.
  spring: {
    hero: {
      url: unsplash("1500382017468-9049fed747ef"),
      alt: "Valle verde primaveral con flores y montañas",
    },
    heroSecondary: {
      url: unsplash("1501785888041-af3ef285b470", 1600),
      alt: "Lago patagónico con bosque verde en la orilla",
    },
    ambient: [
      {
        url: unsplash("1504280390367-361c6d9f38f4", 1400),
        alt: "Campamento entre flores silvestres",
      },
      {
        url: unsplash("1444930694458-01babe71870e", 1400),
        alt: "Sendero verde entre árboles altos",
      },
      siteImages.aboutForest,
    ],
  },
};

/**
 * Helper: para una temporada dada, devolvé el set de imágenes. Sirve
 * para no tener que importar `SEASON_IMAGES` + indexar manualmente.
 */
export function imagesForSeason(season: Season): SeasonImages {
  return SEASON_IMAGES[season];
}
