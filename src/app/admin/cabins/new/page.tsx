import { CabinForm } from "@/components/admin/CabinForm";
import { listAmenities } from "@/lib/db/amenities";

export default async function NewCabinPage() {
  const amenities = await listAmenities();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-eyebrow">Inventario</p>
        <h1 className="heading-section">Nueva cabaña</h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
          Completá la información, agregá imágenes y marcá amenities. Una vez
          publicada, aparece automáticamente en el catálogo público.
        </p>
      </header>
      <CabinForm amenities={amenities} />
    </div>
  );
}
