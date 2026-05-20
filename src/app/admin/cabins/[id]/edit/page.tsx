import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CabinForm } from "@/components/admin/CabinForm";
import { listAmenities } from "@/lib/db/amenities";
import { canManageCabin, getCurrentUser } from "@/lib/auth";

export default async function EditCabinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = (await getCurrentUser())!;
  const { id } = await params;

  let cabin;
  try {
    cabin = await prisma.cabin.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        amenities: { include: { amenity: true } },
        beds: true,
      },
    });
  } catch {
    notFound();
  }
  if (!cabin) notFound();

  if (!canManageCabin(user, cabin)) {
    // Don't 404 (which leaks existence) — bounce to the admin index.
    redirect("/admin/cabins");
  }

  const amenities = await listAmenities();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-eyebrow">Editar cabaña</p>
        <h1 className="heading-section">{cabin.title}</h1>
      </header>
      <CabinForm
        id={cabin.id}
        amenities={amenities}
        initial={{
          title: cabin.title,
          slug: cabin.slug,
          location: cabin.location,
          shortDescription: cabin.shortDescription ?? "",
          description: cabin.description,
          bedrooms: cabin.bedrooms,
          bathrooms: cabin.bathrooms,
          maxGuests: cabin.maxGuests,
          pricePerNight: cabin.pricePerNight,
          cleaningFee: cabin.cleaningFee,
          totalUnits: cabin.totalUnits,
          lakeView: cabin.lakeView,
          isActive: cabin.isActive,
          highlights: cabin.highlights ?? [],
          amenityKeys: cabin.amenities.map((a) => a.amenity.key),
          images: cabin.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
          beds: cabin.beds.map((b) => ({ type: b.type, quantity: b.quantity })),
        }}
      />
    </div>
  );
}
