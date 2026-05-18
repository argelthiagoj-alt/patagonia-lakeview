import {
  Waves,
  Flame,
  Bath,
  Anchor,
  Wifi,
  Drumstick,
  CookingPot,
  Mountain,
  TreePine,
  Footprints,
  PawPrint,
  Car,
  type LucideIcon,
} from "lucide-react";
import type { Amenity } from "@/data/cabins";

const map: Record<Amenity, LucideIcon> = {
  "lake-view": Waves,
  fireplace: Flame,
  "hot-tub": Bath,
  "private-dock": Anchor,
  wifi: Wifi,
  grill: Drumstick,
  kitchen: CookingPot,
  "panoramic-windows": Mountain,
  "wood-stove": TreePine,
  "trail-access": Footprints,
  "pet-friendly": PawPrint,
  parking: Car,
};

export function AmenityIcon({
  amenity,
  size = 18,
  strokeWidth = 1.5,
  className,
}: {
  amenity: Amenity;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const Icon = map[amenity];
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}
