import { notFound, redirect } from "next/navigation";
import { CabinForm } from "@/components/admin/CabinForm";
import { AvailabilityWidget } from "@/components/admin/AvailabilityWidget";
import { getCurrentUser } from "@/modules/auth/session";
import { canManageCabin } from "@/shared/auth-roles";
import { findCabinForEdit, listAmenities } from "@/modules/cabins/repo";
import { FEATURE_KEYS, type FeatureKey } from "@/modules/cabins/schemas";

export default async function EditCabinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = (await getCurrentUser())!;
  const { id } = await params;

  let cabin;
  try {
    cabin = await findCabinForEdit(id);
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
          propertyType: cabin.propertyType,
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
          latitude: cabin.latitude ?? null,
          longitude: cabin.longitude ?? null,
          cancellationPolicy: cabin.cancellationPolicy,
          houseRules: cabin.houseRules,
          checkInTime: cabin.checkInTime,
          checkOutTime: cabin.checkOutTime,
          hostDisplayName: cabin.hostDisplayName,
          hostBio: cabin.hostBio,
          hostPhoto: cabin.hostPhoto,
          hostCity: cabin.hostCity,
          hostingSince: cabin.hostingSince,
          features: Object.fromEntries(
            FEATURE_KEYS.map((k) => [k, Boolean((cabin as Record<string, unknown>)[k])])
          ) as Record<FeatureKey, boolean>,
          images: cabin.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
          beds: cabin.beds.map((b) => ({ type: b.type, quantity: b.quantity })),
          roomTypes: cabin.roomTypes?.map((rt) => ({
            id: rt.id,
            name: rt.name,
            description: rt.description,
            pricePerNight: rt.pricePerNight,
            maxGuests: rt.maxGuests,
            totalUnits: rt.totalUnits,
            amenities: rt.amenities,
            beds: rt.beds.map((b) => ({ type: b.type, quantity: b.quantity })),
          })) ?? [],
        }}
      />

      <AvailabilityWidget cabinId={cabin.id} />
    </div>
  );
}
