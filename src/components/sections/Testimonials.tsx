import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Es de esos lugares que se vuelven una excusa para volver. La cabaña frente al lago superó todo lo que esperábamos.",
    author: "Lucía & Tomás",
    origin: "Buenos Aires, AR",
    rating: 5,
  },
  {
    quote:
      "El silencio, el fuego, los detalles. Una experiencia que no parece de hospedaje: parece de otra vida.",
    author: "Marina",
    origin: "Santiago, CL",
    rating: 5,
  },
  {
    quote:
      "Reservar fue simple y la atención impecable. Cada rincón está pensado para que uno deje de pensar.",
    author: "Federico",
    origin: "Montevideo, UY",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="container-page py-24 md:py-32">
      <div className="mb-14 max-w-2xl space-y-3">
        <p className="text-eyebrow">Huéspedes</p>
        <h2 className="heading-section text-balance">
          Estadías que se cuentan despacio.
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.author}
            className="surface-paper flex flex-col gap-6 p-8"
          >
            <div className="flex gap-0.5 text-[color:var(--color-accent)]">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={14} className="fill-current" />
              ))}
            </div>
            <blockquote className="text-base/relaxed text-[color:var(--color-text-primary)]">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-auto flex items-center justify-between border-t border-[color:var(--color-border)] pt-5">
              <span className="text-sm font-medium text-[color:var(--color-text-primary)]">
                {t.author}
              </span>
              <span className="text-xs text-[color:var(--color-text-secondary)]">
                {t.origin}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
