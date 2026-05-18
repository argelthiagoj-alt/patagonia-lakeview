import { Mountain, Flame, Waves, TreePine } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { siteImages, blurDataURL } from "@/lib/images";

const pillars = [
  {
    icon: Waves,
    title: "Lago",
    description: "Aguas transparentes, kayaks al amanecer y muelles privados.",
  },
  {
    icon: TreePine,
    title: "Bosque",
    description: "Senderos entre arrayanes, lengas y cipreses centenarios.",
  },
  {
    icon: Mountain,
    title: "Montaña",
    description: "Cumbres patagónicas a la vista desde cada ventanal.",
  },
  {
    icon: Flame,
    title: "Fuego",
    description: "Chimeneas de piedra para noches lentas frente al fuego.",
  },
];

export function Experience() {
  return (
    <section className="surface-dark relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 -z-0 opacity-25">
        <SafeImage
          src={siteImages.experienceMountain.url}
          alt={siteImages.experienceMountain.alt}
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={blurDataURL}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--color-background-deep)] via-[color:var(--color-background-deep)]/85 to-[color:var(--color-background-deep)]" />
      </div>

      <div className="container-page relative grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="space-y-6 text-white">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/55">
            La experiencia
          </p>
          <h2 className="heading-section text-balance text-white">
            Cuatro elementos. Una sola idea: descansar bien.
          </h2>
          <p className="max-w-xl text-base/relaxed text-white/75">
            Diseñamos cada estadía alrededor del lago, el bosque, la montaña y
            el fuego. Materiales nobles, espacios amplios y una atención que
            cuida los detalles sin invadir.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pillars.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition-all duration-300 hover:bg-white/[0.07]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent-soft)] transition-colors group-hover:bg-[color:var(--color-accent)]/25">
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-medium text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-white/65">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
