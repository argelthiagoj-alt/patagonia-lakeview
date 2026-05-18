import { SafeImage } from "@/components/ui/SafeImage";
import { siteImages, blurDataURL } from "@/lib/images";

const tiles = [
  {
    image: siteImages.aboutLake,
    title: "Lagos cristalinos",
    caption: "Aguas profundas que cambian de color con la hora.",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    image: siteImages.aboutFire,
    title: "Chimeneas",
    caption: "Piedra local, leña seca, noches largas.",
    span: "",
  },
  {
    image: siteImages.aboutForest,
    title: "Bosque nativo",
    caption: "Senderos a pasos de cada cabaña.",
    span: "",
  },
  {
    image: siteImages.experienceInterior,
    title: "Interiores cálidos",
    caption: "Maderas oscuras, textiles naturales, luz suave.",
    span: "lg:col-span-2",
  },
];

export function AtmosphereGrid() {
  return (
    <section className="container-page py-24 md:py-32">
      <div className="mb-12 max-w-2xl space-y-3 md:mb-16">
        <p className="text-eyebrow">Atmósfera</p>
        <h2 className="heading-section text-balance">
          Pequeños detalles que cambian una estadía.
        </h2>
      </div>

      <div className="grid auto-rows-[260px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {tiles.map((tile, i) => (
          <figure
            key={i}
            className={`group relative overflow-hidden rounded-[2rem] border border-[color:var(--color-border)] ${tile.span}`}
          >
            <SafeImage
              src={tile.image.url}
              alt={tile.image.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
              placeholder="blur"
              blurDataURL={blurDataURL}
              className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-soft)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="text-lg font-medium tracking-tight">
                {tile.title}
              </h3>
              <p className="mt-1 max-w-xs text-sm text-white/80">
                {tile.caption}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
