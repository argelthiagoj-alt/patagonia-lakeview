import type { CityRecord, ExperienceRecord } from "./schemas";

/**
 * Contenido estático para la guía de ciudades + experiencias.
 *
 * Si en una fase futura esto crece o necesita CRUD del admin, se promueve
 * a un modelo Prisma (Cities + Experiences) y este archivo desaparece.
 * Por ahora es la fuente de verdad.
 */

export const CITIES: ReadonlyArray<CityRecord> = [
  {
    slug: "bariloche",
    name: "Bariloche",
    tagline: "El lago, la montaña, la postal clásica.",
    description:
      "San Carlos de Bariloche es la puerta a la cordillera. Aire frío, agua transparente, chocolate y bosques de coihue. Buenas bases para senderos a media tarde y vueltas en lancha al atardecer.",
    heroImage: "/images/cities/bariloche.jpg",
  },
  {
    slug: "villa-la-angostura",
    name: "Villa La Angostura",
    tagline: "Bosque arrayanes y costas calmas.",
    description:
      "Más tranquila que Bariloche, conserva el carácter de pueblo de cordillera. Buena para escapadas largas con foco en silencio, lectura y caminatas suaves entre arrayanes.",
    heroImage: "/images/cities/villa-la-angostura.jpg",
  },
  {
    slug: "el-bolson",
    name: "El Bolsón",
    tagline: "Valles tibios y feria los sábados.",
    description:
      "Microclima más cálido y un alma artesanal que se siente apenas se baja del auto. Cervezas locales, frutas finas y vistas al cerro Piltriquitrón.",
    heroImage: "/images/cities/el-bolson.jpg",
  },
  {
    slug: "san-martin-de-los-andes",
    name: "San Martín de los Andes",
    tagline: "Lago Lácar, ruta de los Siete Lagos.",
    description:
      "Punta norte de la ruta de los Siete Lagos. Buena base para esquí en invierno y para recorrer el Lanín en primavera y verano.",
    heroImage: "/images/cities/san-martin.jpg",
  },
];

export const EXPERIENCES: ReadonlyArray<ExperienceRecord> = [
  {
    slug: "circuito-chico",
    citySlug: "bariloche",
    title: "Circuito Chico en bici",
    summary:
      "Vuelta clásica de unos 27 km bordeando lagos y miradores. Ideal para empezar a entender la geografía.",
    duration: "Media jornada",
    category: "outdoor",
  },
  {
    slug: "ahumados-y-cervezas",
    citySlug: "el-bolson",
    title: "Ahumados, chacras y cervezas",
    summary:
      "Recorrido por productores chicos del valle: trucha ahumada, cervezas artesanales y dulces de frutos rojos.",
    duration: "Tarde",
    category: "gastronomy",
  },
  {
    slug: "bosque-arrayanes",
    citySlug: "villa-la-angostura",
    title: "Caminata por el bosque de arrayanes",
    summary:
      "Trekking suave por uno de los pocos bosques puros de arrayanes del mundo. Mejor temprano para ver la luz pasar entre los troncos color canela.",
    duration: "Media jornada",
    category: "outdoor",
  },
  {
    slug: "siete-lagos",
    citySlug: "san-martin-de-los-andes",
    title: "Ruta de los Siete Lagos en auto",
    summary:
      "Tramo escénico Villa La Angostura ↔ San Martín. Tres paradas obligatorias para fotos y un almuerzo en Villa Traful si se puede.",
    duration: "Día completo",
    category: "adventure",
  },
];
