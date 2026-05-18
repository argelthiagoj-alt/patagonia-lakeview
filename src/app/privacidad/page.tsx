import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo recolectamos, usamos y protegemos tus datos en Patagonia Lakeview.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Política de privacidad"
      lastUpdated="mayo 2026"
    >
      <LegalSection title="1. Datos que recolectamos">
        <p>Recopilamos solo lo necesario para que la plataforma funcione:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Cuenta:</strong> nombre, email y contraseña (hasheada con
            bcrypt). Si entrás con Google, además recibimos tu ID público,
            foto y email.
          </li>
          <li>
            <strong>Reservas:</strong> fechas, cantidad de huéspedes, nombre y
            email a quien va dirigida la estadía.
          </li>
          <li>
            <strong>Postulaciones laborales:</strong> los datos que enviás por
            el formulario "Trabajá con nosotros".
          </li>
          <li>
            <strong>Técnicos:</strong> IP, fecha/hora de las peticiones y user
            agent, para rate-limiting y diagnóstico.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Cómo usamos esos datos">
        <p>Usamos tus datos exclusivamente para:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Operar tu cuenta y gestionar reservas.</li>
          <li>Enviarte códigos de verificación o recuperación de contraseña.</li>
          <li>Responder consultas de postulación.</li>
          <li>Cumplir obligaciones legales si correspondieran.</li>
        </ul>
        <p>
          No vendemos tus datos a terceros y no los usamos con fines
          publicitarios.
        </p>
      </LegalSection>

      <LegalSection title="3. Cookies y tecnologías similares">
        <p>
          Usamos una cookie httpOnly llamada <code>pl_session</code> para
          mantenerte logueado. No usamos cookies de tracking de terceros ni
          píxeles publicitarios. Durante el flujo de Google OAuth podemos
          dejar una cookie corta de estado (CSRF) que se borra apenas se
          completa el login.
        </p>
      </LegalSection>

      <LegalSection title="4. Proveedores externos">
        <p>Para operar dependemos de los siguientes servicios:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Supabase</strong> — almacena la base de datos. Aplica su
            propia política de privacidad.
          </li>
          <li>
            <strong>Vercel</strong> — hosting y logs operativos.
          </li>
          <li>
            <strong>Resend</strong> — envío de emails transaccionales
            (verificación, recuperación, postulaciones).
          </li>
          <li>
            <strong>Google</strong> — opcional, si elegís entrar con tu cuenta
            Google.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Conservación de datos">
        <p>
          Mantenemos tu cuenta mientras esté activa. Si nos pedís eliminarla,
          la borramos junto con tus reservas en un plazo razonable, salvo que
          una obligación legal nos exija conservar algún dato. Las
          postulaciones laborales se eliminan a los 12 meses si no avanza el
          proceso.
        </p>
      </LegalSection>

      <LegalSection title="6. Derechos del usuario">
        <p>
          Podés solicitar acceso, rectificación, portabilidad o eliminación de
          tus datos en cualquier momento escribiendo a{" "}
          <a
            href="mailto:hola@patagonialakeview.com"
            className="text-[color:var(--color-accent-hover)] underline-offset-4 hover:underline"
          >
            hola@patagonialakeview.com
          </a>
          . Vamos a confirmar tu identidad antes de procesar el pedido.
        </p>
      </LegalSection>

      <LegalSection title="7. Seguridad">
        <p>
          Las contraseñas y códigos de verificación se almacenan como hash
          (bcrypt). Las cookies de sesión son httpOnly. Aún así, ningún sistema
          es 100% seguro: si detectás algo raro, avisanos.
        </p>
      </LegalSection>

      <LegalSection title="8. Contacto">
        <p>
          Para temas de privacidad, escribinos a{" "}
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
