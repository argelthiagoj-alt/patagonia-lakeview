import { Info } from "lucide-react";

export function LegalLayout({
  eyebrow,
  title,
  lastUpdated,
  children,
}: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="container-page max-w-3xl pt-32 pb-32">
      <header className="space-y-3 border-b border-[color:var(--color-border)] pb-10">
        <p className="text-eyebrow">{eyebrow}</p>
        <h1 className="heading-display text-balance">{title}</h1>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Última actualización: {lastUpdated}
        </p>
      </header>

      <aside className="mt-8 flex items-start gap-3 rounded-2xl border border-[color:var(--color-warning)]/25 bg-[color:var(--color-warning)]/8 p-4 text-sm text-[color:var(--color-text-primary)]">
        <Info
          size={16}
          strokeWidth={1.75}
          className="mt-0.5 shrink-0 text-[color:var(--color-warning)]"
        />
        <p>
          <strong className="font-medium">Disclaimer.</strong> Este contenido es
          orientativo y debe ser revisado por un profesional legal antes de
          usarse comercialmente. Patagonia Lakeview es, en este momento, un
          proyecto demo de portfolio.
        </p>
      </aside>

      <div className="prose-legal mt-10 space-y-8">{children}</div>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-medium tracking-tight text-[color:var(--color-text-primary)]">
        {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-[color:var(--color-text-secondary)]">
        {children}
      </div>
    </section>
  );
}
