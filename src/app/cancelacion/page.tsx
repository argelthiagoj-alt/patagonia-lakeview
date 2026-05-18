import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Política de cancelación",
  description:
    "Reglas de cancelación, cambios de fecha y reembolsos en Patagonia Lakeview.",
};

export default function CancellationPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Política de cancelación"
      lastUpdated="mayo 2026"
    >
      <LegalSection title="1. Cancelación por parte del huésped">
        <p>Calculada desde la hora de check-in:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Más de 7 días antes:</strong> cancelación gratuita.
            Reembolso del 100% del importe.
          </li>
          <li>
            <strong>Entre 7 y 3 días antes:</strong> reembolso del 50%.
          </li>
          <li>
            <strong>Dentro de las 72 horas previas:</strong> sin reembolso.
          </li>
        </ul>
        <p>
          La cancelación se hace desde tu panel{" "}
          <em>Mi cuenta → Reservas</em>. Si no podés ingresar, escribinos.
        </p>
      </LegalSection>

      <LegalSection title="2. Cancelación por parte del alojamiento">
        <p>
          Si el anfitrión necesita cancelar (por fuerza mayor, daños no
          previstos, mantenimiento urgente), te ofrecemos:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Reasignación a otra cabaña equivalente, sujeto a disponibilidad.</li>
          <li>
            Cambio de fechas sin penalidad dentro de los próximos 12 meses.
          </li>
          <li>Reembolso íntegro del importe abonado.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Cambios de fecha">
        <p>
          Podés solicitar un cambio de fechas hasta 5 días antes del check-in,
          sujeto a disponibilidad. Si el nuevo rango tiene una tarifa mayor, se
          abona la diferencia; si es menor, no se reembolsa el exceso.
        </p>
      </LegalSection>

      <LegalSection title="4. Reembolsos">
        <p>
          Esta versión de la plataforma <strong>no procesa cobros reales</strong>;
          los reembolsos quedan sujetos a confirmación entre vos y el
          anfitrión, según el medio de pago acordado por fuera.
        </p>
      </LegalSection>

      <LegalSection title="5. No-show">
        <p>
          Si no te presentás el día de check-in ni avisás dentro de las 24
          horas posteriores, la reserva se considera consumida sin reembolso.
          Si surge un imprevisto que te impide llegar a tiempo, comunicalo
          cuanto antes: hacemos lo posible por encontrar una solución.
        </p>
      </LegalSection>

      <LegalSection title="6. Fuerza mayor">
        <p>
          Eventos fuera del control de las partes (catástrofes naturales,
          decisiones gubernamentales, cortes prolongados de servicios,
          pandemias) habilitan la cancelación o reprogramación sin penalidad
          para ambos lados.
        </p>
      </LegalSection>

      <LegalSection title="7. Contacto">
        <p>
          Para cualquier consulta sobre cancelaciones, escribinos a{" "}
          <a
            href="mailto:hola@patagonialakeview.com"
            className="text-[color:var(--color-accent-hover)] underline-offset-4 hover:underline"
          >
            hola@patagonialakeview.com
          </a>{" "}
          o desde la página de{" "}
          <a
            href="/contact"
            className="text-[color:var(--color-accent-hover)] underline-offset-4 hover:underline"
          >
            contacto
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
