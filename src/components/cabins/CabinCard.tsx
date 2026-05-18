import Link from "next/link";
import { Star, Users, BedDouble, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { blurDataURL } from "@/lib/images";
import { cn, formatCurrency } from "@/lib/utils";
import type { Cabin } from "@/data/cabins";

type CabinCardProps = {
  cabin: Cabin;
  priority?: boolean;
  className?: string;
};

export function CabinCard({ cabin, priority = false, className }: CabinCardProps) {
  const primary = cabin.images[0];
  return (
    <Link
      href={`/cabins/${cabin.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-soft)] transition-all duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
        className
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <SafeImage
          src={primary.url}
          alt={primary.alt}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          priority={priority}
          placeholder="blur"
          blurDataURL={blurDataURL}
          className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {cabin.lakeView && <Badge tone="dark">Vista al lago</Badge>}
          {cabin.maxGuests >= 6 && <Badge tone="dark">Para grupos</Badge>}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 text-white">
          <div className="flex min-w-0 items-center gap-1.5 text-xs/none">
            <MapPin size={14} strokeWidth={1.5} className="shrink-0" />
            <span className="truncate opacity-90">{cabin.location}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs/none">
            <Star size={14} strokeWidth={1.5} className="fill-white" />
            <span>{cabin.rating.toFixed(2)}</span>
            <span className="opacity-70">· {cabin.reviewCount}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xl font-medium tracking-tight text-[color:var(--color-text-primary)]">
            {cabin.title}
          </h3>
          <p className="line-clamp-2 text-sm text-[color:var(--color-text-secondary)]">
            {cabin.shortDescription}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[color:var(--color-text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} strokeWidth={1.5} />
            {cabin.maxGuests} huéspedes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BedDouble size={14} strokeWidth={1.5} />
            {cabin.bedrooms} {cabin.bedrooms === 1 ? "hab." : "hab."}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <span className="text-2xl font-medium text-[color:var(--color-text-primary)]">
              {formatCurrency(cabin.pricePerNight)}
            </span>
            <span className="ml-1 text-xs text-[color:var(--color-text-secondary)]">
              / noche
            </span>
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--color-accent-hover)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Ver cabaña →
          </span>
        </div>
      </div>
    </Link>
  );
}
