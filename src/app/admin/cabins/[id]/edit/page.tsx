import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CabinForm } from "@/components/admin/CabinForm";

export default async function EditCabinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let cabin;
  try {
    cabin = await prisma.cabin.findUnique({ where: { id } });
  } catch {
    notFound();
  }
  if (!cabin) notFound();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-eyebrow">Editar cabaña</p>
        <h1 className="heading-section">{cabin.title}</h1>
      </header>
      <CabinForm
        initial={{
          id: cabin.id,
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
          lakeView: cabin.lakeView,
          isActive: cabin.isActive,
        }}
      />
    </div>
  );
}
