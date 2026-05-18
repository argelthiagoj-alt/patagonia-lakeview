import { amenityLabels, type Amenity } from "@/data/cabins";
import { AmenityIcon } from "@/components/cabins/AmenityIcon";

export function CabinAmenities({ amenities }: { amenities: Amenity[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
      {amenities.map((amenity) => (
        <div
          key={amenity}
          className="flex items-center gap-3 text-sm text-[color:var(--color-text-primary)]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-primary)]">
            <AmenityIcon amenity={amenity} />
          </span>
          {amenityLabels[amenity]}
        </div>
      ))}
    </div>
  );
}
