/**
 * Seasonal theme — paleta, narrativa y copy por temporada.
 *
 * Las CSS variables propiamente dichas se aplican vía
 * `[data-season="..."]` en `src/app/globals.css`. Este archivo es la
 * fuente de verdad para el catálogo de tokens; si querés cambiar la
 * paleta de otoño, lo hacés acá y en globals.css.
 */

export const SEASONS = ["summer", "autumn", "winter", "spring"] as const;
export type Season = (typeof SEASONS)[number];

export type SeasonPalette = {
  background: string;
  backgroundDeep: string;
  surface: string;
  surfaceMuted: string;
  accent: string;
  accentHover: string;
  border: string;
  textSecondary: string;
};

export type SeasonConfig = {
  label: string;
  tagline: string;
  /** Tokens usados como override en `[data-season]` (globals.css). */
  palette: SeasonPalette;
};

export const SEASON_CONFIG: Record<Season, SeasonConfig> = {
  summer: {
    label: "Verano patagónico",
    tagline: "Lagos quietos, días largos.",
    palette: {
      background: "#f5efe6",
      backgroundDeep: "#1f1b16",
      surface: "#fbf6f0",
      surfaceMuted: "#ede3d5",
      accent: "#1e7a7f",
      accentHover: "#155f63",
      border: "#d7cbbb",
      textSecondary: "#7e7365",
    },
  },
  autumn: {
    label: "Otoño en el bosque",
    tagline: "Lengas en cobre, aire claro.",
    palette: {
      background: "#f3ead9",
      backgroundDeep: "#2a1d12",
      surface: "#faf2e2",
      surfaceMuted: "#ead5b4",
      accent: "#c9793d",
      accentHover: "#ad6130",
      border: "#d9c4a0",
      textSecondary: "#856a4c",
    },
  },
  winter: {
    label: "Invierno bajo nieve",
    tagline: "Fuegos largos, paisajes blancos.",
    palette: {
      background: "#eef2f5",
      backgroundDeep: "#19222b",
      surface: "#f6f9fb",
      surfaceMuted: "#e0e7ee",
      accent: "#3a6c8c",
      accentHover: "#2d5571",
      border: "#c6d0d9",
      textSecondary: "#6c7782",
    },
  },
  spring: {
    label: "Primavera lenta",
    tagline: "Brotes nuevos, ríos altos.",
    palette: {
      background: "#f1f3e8",
      backgroundDeep: "#1c2418",
      surface: "#f8faf0",
      surfaceMuted: "#e1e8cf",
      accent: "#6a8f4a",
      accentHover: "#557338",
      border: "#cdd6b8",
      textSecondary: "#6e7d5b",
    },
  },
};
