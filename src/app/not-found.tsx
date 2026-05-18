import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-6 pt-32 text-center">
      <p className="text-eyebrow">404</p>
      <h1 className="heading-section max-w-xl">
        Esa página se perdió en el bosque.
      </h1>
      <p className="max-w-md text-[color:var(--color-text-secondary)]">
        Probá volver al inicio o explorar el catálogo de cabañas.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <LinkButton href="/" variant="primary" size="md">
          Volver al inicio
        </LinkButton>
        <LinkButton href="/cabins" variant="outline" size="md">
          Ver cabañas
        </LinkButton>
      </div>
    </section>
  );
}
