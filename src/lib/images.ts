/**
 * Central registry of every image used across the site.
 *
 * Swap remote Unsplash URLs for local /public assets later without
 * touching components: the keys stay the same.
 *
 * Convention:
 *   - All URLs are HTTPS.
 *   - All Unsplash URLs use `?auto=format&fit=crop&w=...&q=80`.
 *   - The IDs below are deliberately well-known, high-popularity photos
 *     (millions of downloads each), much less likely to disappear than
 *     long-tail Unsplash IDs.
 *   - Replace freely with /images/your-photo.jpg later.
 */

export type ImageAsset = {
  url: string;
  alt: string;
};

const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const siteImages = {
  heroPrimary: {
    url: unsplash("1464822759023-fed622ff2c3b", 2000),
    alt: "Montañas patagónicas reflejadas en un lago al amanecer",
  },
  heroSecondary: {
    url: unsplash("1501785888041-af3ef285b470", 1600),
    alt: "Lago de montaña con bosque nativo en la orilla",
  },
  aboutLake: {
    url: unsplash("1501785888041-af3ef285b470", 1600),
    alt: "Lago de montaña con bosque nativo en la orilla",
  },
  aboutFire: {
    url: unsplash("1502230831726-fe5549140034", 1200),
    alt: "Chimenea encendida en interior de cabaña de madera",
  },
  aboutForest: {
    url: unsplash("1448375240586-882707db888b", 1600),
    alt: "Bosque al amanecer con luz dorada filtrándose entre los árboles",
  },
  experienceMountain: {
    url: unsplash("1464822759023-fed622ff2c3b", 1600),
    alt: "Cumbres montañosas con nieve y nubes bajas",
  },
  experienceInterior: {
    url: unsplash("1469854523086-cc02fe5d8800", 1600),
    alt: "Interior cálido de cabaña con grandes ventanales hacia la naturaleza",
  },
  testimonialBackdrop: {
    url: unsplash("1486520299386-6d106b22014b", 1600),
    alt: "Vista panorámica de lago al atardecer",
  },
} satisfies Record<string, ImageAsset>;

/**
 * Cabin imagery — referenced from src/data/cabins.ts by slug.
 * Using stable, popular Unsplash IDs that are unlikely to be deleted.
 */
export const cabinImageSets = {
  "arrayan-lake-cabin": [
    {
      url: unsplash("1469474968028-56623f02e42e", 1600),
      alt: "Cabaña frente al lago al amanecer rodeada de bosque",
    },
    {
      url: unsplash("1505693416388-ac5ce068fe85", 1400),
      alt: "Interior cálido con vista al lago a través de un ventanal",
    },
    {
      url: unsplash("1501785888041-af3ef285b470", 1400),
      alt: "Lago patagónico con bosque en la orilla",
    },
    {
      url: unsplash("1493809842364-78817add7ffb", 1400),
      alt: "Living amplio con sofá frente a un ventanal panorámico",
    },
  ],
  "cipres-forest-lodge": [
    {
      url: unsplash("1448375240586-882707db888b", 1600),
      alt: "Bosque denso al amanecer con luz dorada",
    },
    {
      url: unsplash("1502672260266-1c1ef2d93688", 1400),
      alt: "Living con sofá frente a chimenea de piedra",
    },
    {
      url: unsplash("1469854523086-cc02fe5d8800", 1400),
      alt: "Interior cálido con grandes ventanales hacia el bosque",
    },
    {
      url: unsplash("1518791841217-8f162f1e1131", 1400),
      alt: "Detalle de naturaleza patagónica entre los árboles",
    },
  ],
  "condor-mountain-refuge": [
    {
      url: unsplash("1464822759023-fed622ff2c3b", 1600),
      alt: "Cumbres montañosas al atardecer",
    },
    {
      url: unsplash("1452796853824-fc40e7e6f4cb", 1400),
      alt: "Habitación íntima con cama mirando a un paisaje natural",
    },
    {
      url: unsplash("1488646953014-85cb44e25828", 1400),
      alt: "Sendero de montaña en la madrugada",
    },
  ],
  "lenga-superior-cabin": [
    {
      url: unsplash("1499696010180-025ef6e1a8f9", 1600),
      alt: "Cabaña premium con ventanal panorámico al valle",
    },
    {
      url: unsplash("1493809842364-78817add7ffb", 1400),
      alt: "Living amplio con sofá frente al ventanal panorámico",
    },
    {
      url: unsplash("1505691938895-1758d7feb511", 1400),
      alt: "Comedor con mesa larga de madera y luz natural",
    },
    {
      url: unsplash("1416331108676-a22ccb276e35", 1400),
      alt: "Vista exterior de cabaña con bosque al fondo",
    },
  ],
} satisfies Record<string, ImageAsset[]>;

/** Fallback used when a remote image fails or is missing. */
export const fallbackImage: ImageAsset = {
  url: unsplash("1501785888041-af3ef285b470", 1200),
  alt: "Lago patagónico con bosque nativo",
};

/** Tiny inline SVG used as blur/placeholder while remote images load. */
export const blurDataURL =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='#ede3d5'/></svg>`
  );
