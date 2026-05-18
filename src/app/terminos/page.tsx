import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Términos y condiciones de uso de Patagonia Lakeview. Reservas, responsabilidades y disponibilidad.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Términos y condiciones"
      lastUpdated="mayo 2026"
    >
      <LegalSection title="1. Aceptación de los términos">
        <p>
          Al acceder a Patagonia Lakeview ("la plataforma") aceptás estos
          Términos. Si no estás de acuerdo, te pedimos que no la uses. Podemos
          actualizarlos: te avisaremos por el sitio o por mail antes de que los
          cambios apliquen.
        </p>
      </LegalSection>

      <LegalSection title="2. Uso de la plataforma">
        <p>
          La plataforma facilita la búsqueda y reserva de cabañas operadas por
          anfitriones independientes. Las imágenes, precios y descripciones son
          provistos por cada anfitrión y pueden actualizarse en cualquier
          momento. No te permite usarla para actividades ilegales, automatizar
          scrapers ni revender el acceso.
        </p>
      </LegalSection>

      <LegalSection title="3. Reservas">
        <p>
          Las reservas se confirman por escrito. El precio total incluye
          tarifa por noche, limpieza y un cargo de servicio. Las fechas de
          check-in y check-out son las pactadas en la confirmación. La
          disponibilidad se sostiene siempre que no haya una reserva previa que
          ocupe el mismo rango.
        </p>
      </LegalSection>

      <LegalSection title="4. Pagos">
        <p>
          Esta versión de la plataforma <strong>no procesa cobros reales</strong>.
          Los importes mostrados son referenciales y los acuerdos de pago se
          coordinan por fuera con el anfitrión. Si en el futuro se integra una
          pasarela de pago, los Términos serán actualizados.
        </p>
      </LegalSection>

      <LegalSection title="5. Responsabilidades del huésped">
        <p>
          Como huésped te comprometés a: respetar las normas de la cabaña, no
          exceder la cantidad máxima de personas, mantener el inmueble en buen
          estado y reportar cualquier inconveniente al anfitrión. Sos
          responsable por los daños causados durante tu estadía.
        </p>
      </LegalSection>

      <LegalSection title="6. Responsabilidades del alojamiento">
        <p>
          El anfitrión se compromete a entregar la cabaña limpia, en condiciones
          de uso y según lo descripto en la ficha. Si surge una incompatibilidad
          mayor (servicios caídos, daños no comunicados), debe ofrecer una
          alternativa razonable o el reembolso correspondiente.
        </p>
      </LegalSection>

      <LegalSection title="7. Disponibilidad y modificaciones del servicio">
        <p>
          Hacemos esfuerzos razonables para mantener la plataforma disponible,
          pero pueden existir interrupciones por mantenimiento, fallas técnicas
          o causas de terceros (Supabase, Vercel, Resend, Google). Podemos
          modificar o discontinuar funcionalidades sin previo aviso.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitación de responsabilidad">
        <p>
          Patagonia Lakeview no se hace responsable por daños indirectos,
          lucro cesante, ni eventos fuera de su control razonable (clima,
          cortes de servicios, decisiones gubernamentales). Nuestra
          responsabilidad máxima se limita al monto efectivamente abonado por
          la reserva.
        </p>
      </LegalSection>

      <LegalSection title="9. Propiedad intelectual">
        <p>
          Todo el contenido del sitio (textos, marca, diseño, código) pertenece
          a Patagonia Lakeview o a sus licenciantes. No podés reproducirlo sin
          autorización escrita.
        </p>
      </LegalSection>

      <LegalSection title="10. Contacto">
        <p>
          Para cualquier consulta sobre estos Términos, escribinos a{" "}
          <a
            href="mailto:hola@patagonialakeview.com"
            className="text-[color:var(--color-accent-hover)] underline-offset-4 hover:underline"
          >
            hola@patagonialakeview.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
