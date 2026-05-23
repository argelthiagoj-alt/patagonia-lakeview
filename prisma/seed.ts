import { PrismaClient, UserRole, TourismType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cabins as cabinSeed, amenityLabels } from "../src/data/cabins";

const prisma = new PrismaClient();

// ─────────────── Destinations seed data ───────────────
const DESTINATION_SEEDS: Array<{
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
}> = [
  {
    slug: "bariloche",
    name: "Bariloche",
    tagline: "El lago, la montaña, la postal clásica.",
    shortDescription: "Aire frío, agua transparente, chocolate y bosques.",
    longDescription:
      "San Carlos de Bariloche es la puerta a la cordillera. Aire frío, agua transparente, chocolate y bosques de coihue. Buena base para senderos a media tarde y vueltas en lancha al atardecer.",
  },
  {
    slug: "villa-la-angostura",
    name: "Villa La Angostura",
    tagline: "Bosque arrayanes y costas calmas.",
    shortDescription: "Pueblo de cordillera, calma y arrayanes.",
    longDescription:
      "Más tranquila que Bariloche, conserva el carácter de pueblo de cordillera. Caminatas suaves entre arrayanes, lecturas largas, atardeceres sin apuro.",
  },
  {
    slug: "el-bolson",
    name: "El Bolsón",
    tagline: "Valles tibios y feria los sábados.",
    shortDescription: "Microclima cálido y alma artesanal.",
    longDescription:
      "Microclima más cálido y un alma artesanal. Cervezas locales, frutas finas y vistas al cerro Piltriquitrón.",
  },
  {
    slug: "san-martin-de-los-andes",
    name: "San Martín de los Andes",
    tagline: "Lago Lácar, ruta de los Siete Lagos.",
    shortDescription: "Punta norte de los Siete Lagos.",
    longDescription:
      "Punta norte de la ruta de los Siete Lagos. Esquí en invierno, Lanín en primavera y verano, base ideal para todo el norte de la cordillera.",
  },
];

const TOURISM_ITEM_SEEDS: Array<{
  destinationSlug: string;
  slug: string;
  title: string;
  description: string;
  type: TourismType;
  duration?: string;
}> = [
  {
    destinationSlug: "bariloche",
    slug: "circuito-chico",
    title: "Circuito Chico en bici",
    description:
      "Vuelta clásica de unos 27 km bordeando lagos y miradores. Ideal para empezar a entender la geografía.",
    type: "ADVENTURE",
    duration: "Media jornada",
  },
  {
    destinationSlug: "el-bolson",
    slug: "ahumados-y-cervezas",
    title: "Ahumados, chacras y cervezas",
    description:
      "Recorrido por productores chicos del valle: trucha ahumada, cervezas artesanales y dulces de frutos rojos.",
    type: "RESTAURANT",
    duration: "Tarde",
  },
  {
    destinationSlug: "villa-la-angostura",
    slug: "bosque-arrayanes",
    title: "Caminata por el bosque de arrayanes",
    description:
      "Trekking suave por uno de los pocos bosques puros de arrayanes del mundo.",
    type: "TRAIL",
    duration: "Media jornada",
  },
  {
    destinationSlug: "san-martin-de-los-andes",
    slug: "siete-lagos",
    title: "Ruta de los Siete Lagos en auto",
    description:
      "Tramo escénico Villa La Angostura ↔ San Martín. Tres paradas obligatorias para fotos.",
    type: "ADVENTURE",
    duration: "Día completo",
  },
];

const reviewsByCabinSlug: Record<
  string,
  { name: string; rating: number; comment: string }[]
> = {
  "arrayan-lake-cabin": [
    {
      name: "Lucía & Tomás",
      rating: 5,
      comment:
        "Despertar con el lago a los pies fue surreal. El muelle privado, la chimenea, la atención: todo impecable.",
    },
    {
      name: "Marina",
      rating: 5,
      comment:
        "El lugar es exactamente como en las fotos, pero mejor. Volveríamos en cualquier época del año.",
    },
    {
      name: "Federico",
      rating: 4,
      comment:
        "Cabaña hermosa, muy bien cuidada. Solo cuidado con el viento al amanecer cerca del agua: lleven una campera más.",
    },
  ],
  "cipres-forest-lodge": [
    {
      name: "Camila",
      rating: 5,
      comment:
        "El hot tub al atardecer con olor a bosque es algo que no voy a olvidar. Familia feliz.",
    },
    {
      name: "Andrés y familia",
      rating: 5,
      comment:
        "Espacio enorme, parrilla cubierta para todo clima, y el living invita a quedarse charlando hasta tarde.",
    },
  ],
  "condor-mountain-refuge": [
    {
      name: "Sofía",
      rating: 5,
      comment:
        "Refugio íntimo y silencioso. Perfecto para parejas. La vista desde la cama es la mejor que vi en años.",
    },
    {
      name: "Diego",
      rating: 5,
      comment:
        "Minimalismo bien entendido. Cero ruido, cero exceso, todo lo justo. Volvemos seguro.",
    },
  ],
  "lenga-superior-cabin": [
    {
      name: "Familia Martínez",
      rating: 5,
      comment:
        "Vinimos ocho personas y a nadie le faltó nada. Los ventanales de doble altura son una postal permanente.",
    },
    {
      name: "Renata",
      rating: 5,
      comment:
        "Es la cabaña más linda en la que estuve. La atención del anfitrión hace la diferencia.",
    },
  ],
};

async function main() {
  console.log("🌲 Seeding Patagonia Lakeview…\n");

  // Wipe existing demo data in dependency-safe order
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.cabinAmenity.deleteMany();
  await prisma.cabinImage.deleteMany();
  await prisma.cabin.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ────────────────────────────────────────────────────────
  // Shared demo password — all demo accounts use the same one for portfolio simplicity.
  const DEMO_PASSWORD = "demo1234";
  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const reviewerPassword = await bcrypt.hash("reviewer1234", 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: "Elena Owner",
      email: "superadmin@patagonialakeview.demo",
      passwordHash: demoHash,
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
      phone: "+54 9 294 555 0001",
      city: "Bariloche",
      country: "Argentina",
    },
  });

  const adminLucia = await prisma.user.create({
    data: {
      name: "Lucía · Anfitriona Pro",
      email: "admin1@patagonialakeview.demo",
      passwordHash: demoHash,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      adminPlan: "PRO",
      proUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      phone: "+54 9 294 555 0011",
      city: "Villa La Angostura",
      country: "Argentina",
    },
  });

  const adminMartin = await prisma.user.create({
    data: {
      name: "Martín Admin",
      email: "admin2@patagonialakeview.demo",
      passwordHash: demoHash,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      phone: "+54 9 294 555 0012",
      city: "El Bolsón",
      country: "Argentina",
    },
  });

  const adminSofia = await prisma.user.create({
    data: {
      name: "Sofía Admin",
      email: "admin3@patagonialakeview.demo",
      passwordHash: demoHash,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      phone: "+54 9 294 555 0013",
      city: "San Martín de los Andes",
      country: "Argentina",
    },
  });

  const guest = await prisma.user.create({
    data: {
      name: "Tomás Huésped",
      email: "user@patagonialakeview.demo",
      passwordHash: demoHash,
      role: UserRole.USER,
      emailVerified: new Date(),
      phone: "+54 9 11 5555 1234",
      documentId: "32.456.789",
      address: "Av. Siempreviva 742",
      city: "Buenos Aires",
      state: "CABA",
      country: "Argentina",
      billingName: "Tomás Huésped",
    },
  });

  // Owner assignment per cabin slug — Lucía has 2 (one PRO), Martín + Sofía one each.
  const ownerBySlug: Record<string, string> = {
    "arrayan-lake-cabin": adminLucia.id,
    "cipres-forest-lodge": adminLucia.id,
    "condor-mountain-refuge": adminMartin.id,
    "lenga-superior-cabin": adminSofia.id,
  };

  // Extra reviewer users so each review has a distinct authored account
  const reviewerNames = Array.from(
    new Set(
      Object.values(reviewsByCabinSlug)
        .flat()
        .map((r) => r.name)
    )
  );
  const reviewerUsers = await Promise.all(
    reviewerNames.map((name, i) =>
      prisma.user.create({
        data: {
          name,
          email: `reviewer${i + 1}@patagonialakeview.com`,
          passwordHash: reviewerPassword,
          role: UserRole.USER,
        },
      })
    )
  );
  const reviewerByName = new Map(
    reviewerUsers.map((u) => [u.name as string, u])
  );

  console.log(
    `  ✓ Users: 1 super-admin, 2 admins, 1 guest, ${reviewerUsers.length} reviewers`
  );

  // ── Amenities ────────────────────────────────────────────────────
  const amenityRecords = await Promise.all(
    Object.entries(amenityLabels).map(([key, name]) =>
      prisma.amenity.create({ data: { key, name } })
    )
  );
  const amenityByKey = new Map(amenityRecords.map((a) => [a.key, a]));
  console.log(`  ✓ Amenities created: ${amenityRecords.length}`);

  // Per-cabin: number of identical units + bed configuration
  const cabinExtras: Record<
    string,
    {
      totalUnits: number;
      beds: { type: "TWIN" | "DOUBLE" | "QUEEN" | "KING" | "SOFA_BED" | "BUNK"; quantity: number }[];
    }
  > = {
    "arrayan-lake-cabin": {
      totalUnits: 2,
      beds: [
        { type: "QUEEN", quantity: 1 },
        { type: "TWIN", quantity: 2 },
      ],
    },
    "cipres-forest-lodge": {
      totalUnits: 3,
      beds: [
        { type: "DOUBLE", quantity: 2 },
        { type: "TWIN", quantity: 2 },
        { type: "SOFA_BED", quantity: 1 },
      ],
    },
    "condor-mountain-refuge": {
      totalUnits: 1,
      beds: [{ type: "QUEEN", quantity: 1 }],
    },
    "lenga-superior-cabin": {
      totalUnits: 1,
      beds: [
        { type: "KING", quantity: 2 },
        { type: "QUEEN", quantity: 2 },
        { type: "SOFA_BED", quantity: 2 },
      ],
    },
  };

  // ── Cabins ───────────────────────────────────────────────────────
  for (const c of cabinSeed) {
    const ownerId = ownerBySlug[c.slug] ?? superAdmin.id;
    const extras = cabinExtras[c.slug] ?? { totalUnits: 1, beds: [] };
    const cabin = await prisma.cabin.create({
      data: {
        slug: c.slug,
        title: c.title,
        description: c.description,
        shortDescription: c.shortDescription,
        location: c.location,
        lakeView: c.lakeView,
        maxGuests: c.maxGuests,
        bedrooms: c.bedrooms,
        bathrooms: c.bathrooms,
        pricePerNight: c.pricePerNight,
        cleaningFee: c.cleaningFee,
        rating: c.rating,
        reviewCount: c.reviewCount,
        highlights: c.highlights,
        totalUnits: extras.totalUnits,
        ownerId,
        images: {
          create: c.images.map((img, i) => ({
            url: img.url,
            alt: img.alt,
            order: i,
          })),
        },
        amenities: {
          create: c.amenities
            .map((a) => amenityByKey.get(a))
            .filter((a): a is NonNullable<typeof a> => Boolean(a))
            .map((a) => ({ amenityId: a.id })),
        },
        beds: {
          create: extras.beds.map((b) => ({ type: b.type, quantity: b.quantity })),
        },
      },
    });

    // Reviews for this cabin
    const reviews = reviewsByCabinSlug[c.slug] ?? [];
    for (const r of reviews) {
      const reviewer = reviewerByName.get(r.name);
      if (!reviewer) continue;
      await prisma.review.create({
        data: {
          userId: reviewer.id,
          cabinId: cabin.id,
          rating: r.rating,
          comment: r.comment,
        },
      });
    }

    console.log(
      `  ✓ ${cabin.title.padEnd(28)} ${reviews.length} reviews`
    );
  }

  // ── Sample reservations + simulated payments ─────────────────────
  const arrayan = await prisma.cabin.findUnique({
    where: { slug: "arrayan-lake-cabin" },
  });
  const lenga = await prisma.cabin.findUnique({
    where: { slug: "lenga-superior-cabin" },
  });
  const cipres = await prisma.cabin.findUnique({
    where: { slug: "cipres-forest-lodge" },
  });

  function daysFromNow(d: number) {
    const x = new Date();
    x.setDate(x.getDate() + d);
    return x;
  }

  // 1. CONFIRMED + payment CAPTURED
  if (arrayan) {
    const checkIn = daysFromNow(21);
    const checkOut = daysFromNow(24);
    const total = arrayan.pricePerNight * 3 + arrayan.cleaningFee;
    await prisma.reservation.create({
      data: {
        userId: guest.id,
        cabinId: arrayan.id,
        guestName: guest.name ?? "Tomás",
        guestEmail: guest.email,
        checkIn,
        checkOut,
        guests: 2,
        totalPrice: total,
        status: "CONFIRMED",
        payment: {
          create: {
            provider: "CARD",
            status: "SIMULATED_CAPTURED",
            amount: total,
            cardBrand: "VISA",
            last4: "4242",
            payerEmail: guest.email,
            simulated: true,
          },
        },
      },
    });
  }

  // 2. PENDING + payment APPROVED (awaiting admin decision)
  if (lenga) {
    const checkIn = daysFromNow(60);
    const checkOut = daysFromNow(64);
    const total = lenga.pricePerNight * 4 + lenga.cleaningFee;
    await prisma.reservation.create({
      data: {
        userId: guest.id,
        cabinId: lenga.id,
        guestName: guest.name ?? "Tomás",
        guestEmail: guest.email,
        checkIn,
        checkOut,
        guests: 6,
        totalPrice: total,
        status: "PENDING",
        payment: {
          create: {
            provider: "MERCADO_PAGO",
            status: "SIMULATED_APPROVED",
            amount: total,
            payerEmail: guest.email,
            simulated: true,
          },
        },
      },
    });
  }

  // 3. REJECTED + payment REFUNDED (so the UI shows the refund banner)
  if (cipres) {
    const checkIn = daysFromNow(-30);
    const checkOut = daysFromNow(-26);
    const total = cipres.pricePerNight * 4 + cipres.cleaningFee;
    await prisma.reservation.create({
      data: {
        userId: guest.id,
        cabinId: cipres.id,
        guestName: guest.name ?? "Tomás",
        guestEmail: guest.email,
        checkIn,
        checkOut,
        guests: 4,
        totalPrice: total,
        status: "REJECTED",
        payment: {
          create: {
            provider: "CARD",
            status: "SIMULATED_REFUNDED",
            amount: total,
            cardBrand: "MASTERCARD",
            last4: "5454",
            payerEmail: guest.email,
            simulated: true,
          },
        },
      },
    });
  }

  console.log(`  ✓ Sample reservations + payments created`);

  // ─────────────── Destinations seed ───────────────
  // Idempotente (upsert por slug). El SUPER_ADMIN puede editar/borrar
  // todo después desde /admin/city-guide.
  for (const [order, d] of DESTINATION_SEEDS.entries()) {
    await prisma.destination.upsert({
      where: { slug: d.slug },
      update: {
        name: d.name,
        tagline: d.tagline,
        shortDescription: d.shortDescription,
        longDescription: d.longDescription,
        order,
      },
      create: {
        slug: d.slug,
        name: d.name,
        tagline: d.tagline,
        shortDescription: d.shortDescription,
        longDescription: d.longDescription,
        order,
      },
    });
  }
  for (const item of TOURISM_ITEM_SEEDS) {
    const dest = await prisma.destination.findUnique({
      where: { slug: item.destinationSlug },
    });
    if (!dest) continue;
    await prisma.tourismItem.upsert({
      where: {
        destinationId_slug: { destinationId: dest.id, slug: item.slug },
      },
      update: {
        title: item.title,
        description: item.description,
        type: item.type,
        duration: item.duration ?? null,
      },
      create: {
        destinationId: dest.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        type: item.type,
        duration: item.duration ?? null,
      },
    });
  }
  console.log(
    `  ✓ Destinations seed: ${DESTINATION_SEEDS.length} ciudades · ${TOURISM_ITEM_SEEDS.length} lugares`
  );

  console.log(`
✨ Seed complete · Demo password for every account: ${DEMO_PASSWORD}

  superadmin@patagonialakeview.demo   SUPER_ADMIN, sees everything
  admin1@patagonialakeview.demo       ADMIN · Pro Host · owns Arrayán + Ciprés
  admin2@patagonialakeview.demo       ADMIN · owns Cóndor Mountain Refuge
  admin3@patagonialakeview.demo       ADMIN · owns Lenga Superior Cabin
  user@patagonialakeview.demo         USER · perfil + 3 reservas demo
`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
