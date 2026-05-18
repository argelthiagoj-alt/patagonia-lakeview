import type { Metadata } from "next";
import { CabinCatalog } from "@/components/cabins/CabinFilters";
import { listCabins } from "@/lib/db/cabins";

export const metadata: Metadata = {
  title: "Catálogo de cabañas",
  description:
    "Explorá las cabañas disponibles: vista al lago, bosque o montaña, todas con diseño cálido y atención boutique.",
};

export const dynamic = "force-dynamic";

export default async function CabinsPage() {
  const cabins = await listCabins();

  return (
    <section className="container-page pt-32 pb-24 md:pt-40 md:pb-32">
      <header className="mb-12 flex flex-col gap-4 md:mb-16">
        <p className="text-eyebrow">Catálogo</p>
        <h1 className="heading-display text-balance max-w-3xl">
          Encontrá tu cabaña en la Patagonia.
        </h1>
        <p className="max-w-2xl text-base/relaxed text-[color:var(--color-text-secondary)] md:text-lg/relaxed">
          Cuatro propuestas, todas con vista, materiales nobles y la
          tranquilidad de los lagos patagónicos.
        </p>
      </header>

      <CabinCatalog cabins={cabins} />
    </section>
  );
}
