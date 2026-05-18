import type { Metadata } from "next";
import { SearchBar } from "@/components/booking/SearchBar";
import { CabinCard } from "@/components/cabins/CabinCard";
import { cabins } from "@/data/cabins";

export const metadata: Metadata = {
  title: "Disponibilidad",
  description:
    "Buscá cabañas disponibles por fechas y cantidad de huéspedes.",
};

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  const guests =
    typeof search.guests === "string" ? Number(search.guests) : undefined;

  const filtered = guests
    ? cabins.filter((c) => c.maxGuests >= guests)
    : cabins;

  return (
    <section className="container-page pt-32 pb-24">
      <header className="mb-10 space-y-4">
        <p className="text-eyebrow">Disponibilidad</p>
        <h1 className="heading-display max-w-3xl text-balance">
          Elegí fechas y descubrí qué cabañas están libres.
        </h1>
      </header>

      <div className="mb-12">
        <SearchBar variant="compact" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {filtered.map((c, i) => (
          <CabinCard key={c.id} cabin={c} priority={i < 3} />
        ))}
      </div>
    </section>
  );
}
