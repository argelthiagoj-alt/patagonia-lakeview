import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cabins as cabinSeed, amenityLabels } from "../src/data/cabins";

const prisma = new PrismaClient();

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
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const guestPassword = await bcrypt.hash("guest1234", 10);
  const reviewerPassword = await bcrypt.hash("reviewer1234", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Lucía Admin",
      email: "admin@patagonialakeview.com",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const guest = await prisma.user.create({
    data: {
      name: "Tomás Huésped",
      email: "guest@patagonialakeview.com",
      passwordHash: guestPassword,
      role: UserRole.USER,
    },
  });

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
    `  ✓ Users created: 1 admin, 1 guest, ${reviewerUsers.length} reviewers`
  );

  // ── Amenities ────────────────────────────────────────────────────
  const amenityRecords = await Promise.all(
    Object.entries(amenityLabels).map(([key, name]) =>
      prisma.amenity.create({ data: { key, name } })
    )
  );
  const amenityByKey = new Map(amenityRecords.map((a) => [a.key, a]));
  console.log(`  ✓ Amenities created: ${amenityRecords.length}`);

  // ── Cabins ───────────────────────────────────────────────────────
  for (const c of cabinSeed) {
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

  // ── Sample reservations ──────────────────────────────────────────
  const arrayan = await prisma.cabin.findUnique({
    where: { slug: "arrayan-lake-cabin" },
  });
  const lenga = await prisma.cabin.findUnique({
    where: { slug: "lenga-superior-cabin" },
  });

  if (arrayan) {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 21);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + 3);

    await prisma.reservation.create({
      data: {
        userId: guest.id,
        cabinId: arrayan.id,
        guestName: guest.name ?? "Tomás",
        guestEmail: guest.email,
        checkIn,
        checkOut,
        guests: 2,
        totalPrice: arrayan.pricePerNight * 3 + arrayan.cleaningFee,
        status: "CONFIRMED",
      },
    });
  }

  if (lenga) {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 60);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + 4);

    await prisma.reservation.create({
      data: {
        userId: guest.id,
        cabinId: lenga.id,
        guestName: guest.name ?? "Tomás",
        guestEmail: guest.email,
        checkIn,
        checkOut,
        guests: 6,
        totalPrice: lenga.pricePerNight * 4 + lenga.cleaningFee,
        status: "PENDING",
      },
    });
  }

  console.log(`  ✓ Sample reservations created`);

  console.log(`
✨ Seed complete

  Admin → admin@patagonialakeview.com / admin1234
  Guest → guest@patagonialakeview.com / guest1234
`);

  // Unused — kept around for parity with prior version
  void admin;
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
