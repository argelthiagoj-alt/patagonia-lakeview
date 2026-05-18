import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CabinCard } from "@/components/cabins/CabinCard";
import { cabins } from "@/data/cabins";

export function FeaturedCabins() {
  const featured = cabins.slice(0, 4);
  return (
    <section className="container-page py-24 md:py-32">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:mb-16 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-3">
          <p className="text-eyebrow">Cabañas destacadas</p>
          <h2 className="heading-section text-balance">
            Refugios elegidos por nuestros huéspedes
          </h2>
          <p className="max-w-xl text-base/relaxed text-[color:var(--color-text-secondary)]">
            Cuatro propuestas distintas, todas con el mismo cuidado por la
            atmósfera, los materiales y la vista.
          </p>
        </div>
        <Link
          href="/cabins"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-text-primary)] hover:text-[color:var(--color-accent-hover)]"
        >
          Ver todo el catálogo
          <ArrowUpRight size={16} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {featured.map((cabin, i) => (
          <CabinCard key={cabin.id} cabin={cabin} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}
