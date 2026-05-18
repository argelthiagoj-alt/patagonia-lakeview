import { cabinImageSets, type ImageAsset } from "../lib/images";

export type Amenity =
  | "lake-view"
  | "fireplace"
  | "hot-tub"
  | "private-dock"
  | "wifi"
  | "grill"
  | "kitchen"
  | "panoramic-windows"
  | "wood-stove"
  | "trail-access"
  | "pet-friendly"
  | "parking";

export type Cabin = {
  id: string;
  slug: string;
  title: string;
  location: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  amenities: Amenity[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  cleaningFee: number;
  rating: number;
  reviewCount: number;
  lakeView: boolean;
  images: ImageAsset[];
};

export const cabins: Cabin[] = [
  {
    id: "cabin-arrayan",
    slug: "arrayan-lake-cabin",
    title: "Arrayán Lake Cabin",
    location: "Villa La Angostura, Patagonia",
    shortDescription:
      "Cabaña frente al lago con muelle privado y chimenea de leña.",
    description:
      "Despertá con el sonido del lago y la luz filtrándose entre los arrayanes. Una cabaña íntima con grandes ventanales, deck de madera y un muelle privado para nadar al amanecer o salir a remar al final del día.",
    highlights: [
      "Muelle privado sobre el lago",
      "Chimenea de leña con piedra local",
      "Deck panorámico para dos",
    ],
    amenities: [
      "lake-view",
      "fireplace",
      "private-dock",
      "wifi",
      "kitchen",
      "wood-stove",
      "parking",
    ],
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    pricePerNight: 280,
    cleaningFee: 45,
    rating: 4.92,
    reviewCount: 128,
    lakeView: true,
    images: cabinImageSets["arrayan-lake-cabin"],
  },
  {
    id: "cabin-cipres",
    slug: "cipres-forest-lodge",
    title: "Ciprés Forest Lodge",
    location: "San Martín de los Andes, Patagonia",
    shortDescription:
      "Lodge familiar en pleno bosque nativo con hot tub al aire libre.",
    description:
      "Rodeado de cipreses centenarios, este lodge combina espacio, calidez y privacidad. Hot tub con vista al bosque, parrilla cubierta y un living amplio pensado para reuniones largas frente al fuego.",
    highlights: [
      "Hot tub exterior con vista al bosque",
      "Parrilla cubierta para todo el año",
      "Living amplio con chimenea central",
    ],
    amenities: [
      "fireplace",
      "hot-tub",
      "grill",
      "wifi",
      "kitchen",
      "trail-access",
      "pet-friendly",
      "parking",
    ],
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 360,
    cleaningFee: 60,
    rating: 4.87,
    reviewCount: 94,
    lakeView: false,
    images: cabinImageSets["cipres-forest-lodge"],
  },
  {
    id: "cabin-condor",
    slug: "condor-mountain-refuge",
    title: "Cóndor Mountain Refuge",
    location: "El Bolsón, Patagonia",
    shortDescription:
      "Refugio minimalista en altura para dos, ideal para escapadas.",
    description:
      "Un refugio pequeño, cálido y silencioso, pensado para parejas. Materiales nobles, líneas simples y una sola gran ventana enmarcando la cordillera. Ideal para desconectar entre senderos y atardeceres.",
    highlights: [
      "Vista panorámica a la cordillera",
      "Diseño minimalista en madera y piedra",
      "Acceso directo a senderos de montaña",
    ],
    amenities: [
      "fireplace",
      "wifi",
      "kitchen",
      "trail-access",
      "wood-stove",
      "parking",
    ],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 210,
    cleaningFee: 35,
    rating: 4.95,
    reviewCount: 71,
    lakeView: false,
    images: cabinImageSets["condor-mountain-refuge"],
  },
  {
    id: "cabin-lenga",
    slug: "lenga-superior-cabin",
    title: "Lenga Superior Cabin",
    location: "Bariloche, Patagonia",
    shortDescription:
      "Cabaña premium con ventanales panorámicos y vista al valle.",
    description:
      "Nuestra cabaña insignia. Cuatro suites, ventanales de doble altura y un living abierto frente a las montañas. Pensada para grupos o familias que buscan una experiencia memorable sin renunciar a la intimidad.",
    highlights: [
      "Ventanales panorámicos de doble altura",
      "Cuatro suites con baño privado",
      "Bodega y comedor para ocho personas",
    ],
    amenities: [
      "lake-view",
      "fireplace",
      "hot-tub",
      "grill",
      "wifi",
      "kitchen",
      "panoramic-windows",
      "wood-stove",
      "trail-access",
      "parking",
    ],
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    pricePerNight: 620,
    cleaningFee: 90,
    rating: 4.98,
    reviewCount: 56,
    lakeView: true,
    images: cabinImageSets["lenga-superior-cabin"],
  },
];

export const amenityLabels: Record<Amenity, string> = {
  "lake-view": "Vista al lago",
  fireplace: "Chimenea",
  "hot-tub": "Hot tub",
  "private-dock": "Muelle privado",
  wifi: "Wi-Fi",
  grill: "Parrilla",
  kitchen: "Cocina equipada",
  "panoramic-windows": "Ventanales panorámicos",
  "wood-stove": "Estufa a leña",
  "trail-access": "Acceso a senderos",
  "pet-friendly": "Pet friendly",
  parking: "Estacionamiento",
};

export function getCabinBySlug(slug: string) {
  return cabins.find((c) => c.slug === slug);
}
