import type { Metadata } from "next";
import { JobApplicationForm } from "@/components/jobs/JobApplicationForm";

export const metadata: Metadata = {
  title: "Trabajá con nosotros",
  description:
    "Unite al equipo de Patagonia Lakeview. Buscamos personas que amen la naturaleza, la hospitalidad y el detalle.",
};

export default function JobsPage() {
  return (
    <section className="container-page grid gap-16 pt-32 pb-24 lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-6">
        <p className="text-eyebrow">Equipo</p>
        <h1 className="heading-display text-balance max-w-md">
          Trabajá con nosotros.
        </h1>
        <p className="max-w-md text-base/relaxed text-[color:var(--color-text-secondary)] md:text-lg/relaxed">
          Buscamos personas curiosas, generosas y obsesionadas con los detalles.
          Si te entusiasma la idea de hospedar bien y conocés la Patagonia,
          escribinos.
        </p>
        <ul className="space-y-3 text-sm/relaxed text-[color:var(--color-text-secondary)]">
          <li className="flex items-start gap-3">
            <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
            <span>
              Roles abiertos: anfitrión, atención al huésped, limpieza, mantenimiento,
              marketing y operaciones.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
            <span>
              Trabajamos con productores y guías locales: si tenés vínculo con la
              comunidad, mejor todavía.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
            <span>Respondemos cada postulación con un mensaje real, no automático.</span>
          </li>
        </ul>
      </div>

      <JobApplicationForm />
    </section>
  );
}
