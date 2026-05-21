import type { Metadata } from "next";
import { CabinCatalog } from "@/components/cabins/CabinFilters";
import { listCabinsWithReservations } from "@/modules/cabins/repo";

export const metadata: Metadata = {
  title: "Catálogo de cabañas",
  description:
    "Explorá las cabañas disponibles: vista al lago, bosque o montaña, todas con diseño cálido y atención boutique.",
};

export const dynamic = "force-dynamic";

export default async function CabinsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  const cabins = await listCabinsWithReservations();

  const checkIn = typeof search.checkIn === "string" ? search.checkIn : undefined;
  const checkOut =
    typeof search.checkOut === "string" ? search.checkOut : undefined;
  const guests =
    typeof search.guests === "string" ? Number(search.guests) : undefined;

  return (
    <section className="container-page pt-32 pb-24 md:pt-40 md:pb-32">
      <header className="mb-12 flex flex-col gap-4 md:mb-16">
        <p className="text-eyebrow">Catálogo</p>
        <h1 className="heading-display text-balance max-w-3xl">
          Encontrá tu cabaña en la Patagonia.
        </h1>
        <p className="max-w-2xl text-base/relaxed text-[color:var(--color-text-secondary)] md:text-lg/relaxed">
          Filtros por fecha, precio, capacidad y amenities. Todas las cabañas
          publicadas desde el panel admin aparecen acá.
        </p>
      </header>

      <CabinCatalog
        cabins={cabins}
        initial={{ checkIn, checkOut, guests }}
      />
    </section>
  );
}
