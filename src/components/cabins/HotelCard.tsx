import { MapPin, Phone, Mail, ExternalLink, Clock, FileText } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

type Hotel = {
  legalName: string | null;
  logo: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  receptionHours: string | null;
  generalPolicies: string | null;
};

/**
 * Tarjeta institucional para publicaciones tipo HOTEL.
 *
 * No mostramos un "anfitrión personal" como en cabañas — el hotel es la
 * entidad pública. Si el admin no cargó ningún campo, devuelve null para
 * dejar la página limpia.
 */
export function HotelCard({ hotel }: { hotel: Hotel }) {
  const hasAny =
    hotel.legalName ||
    hotel.description ||
    hotel.address ||
    hotel.phone ||
    hotel.email ||
    hotel.website ||
    hotel.receptionHours ||
    hotel.generalPolicies;
  if (!hasAny) return null;

  return (
    <article className="surface-paper flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
      {hotel.logo && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[color:var(--color-surface-muted)] sm:h-24 sm:w-24">
          <SafeImage
            src={hotel.logo}
            alt={hotel.legalName ?? "Hotel"}
            fill
            sizes="96px"
            className="object-contain"
          />
        </div>
      )}
      <div className="flex-1 space-y-3">
        {hotel.legalName && (
          <p className="text-lg font-medium tracking-tight">{hotel.legalName}</p>
        )}
        {hotel.description && (
          <p className="max-w-prose text-sm/relaxed text-[color:var(--color-text-primary)]/85">
            {hotel.description}
          </p>
        )}

        <div className="grid gap-2 text-xs text-[color:var(--color-text-secondary)] sm:grid-cols-2">
          {(hotel.address || hotel.city) && (
            <span className="inline-flex items-start gap-1.5">
              <MapPin size={12} strokeWidth={1.5} className="mt-0.5" />
              <span>
                {hotel.address}
                {hotel.address && hotel.city ? " · " : ""}
                {hotel.city}
              </span>
            </span>
          )}
          {hotel.phone && (
            <span className="inline-flex items-start gap-1.5">
              <Phone size={12} strokeWidth={1.5} className="mt-0.5" />
              <a
                href={`tel:${hotel.phone}`}
                className="hover:text-[color:var(--color-text-primary)]"
              >
                {hotel.phone}
              </a>
            </span>
          )}
          {hotel.email && (
            <span className="inline-flex items-start gap-1.5">
              <Mail size={12} strokeWidth={1.5} className="mt-0.5" />
              <a
                href={`mailto:${hotel.email}`}
                className="hover:text-[color:var(--color-text-primary)]"
              >
                {hotel.email}
              </a>
            </span>
          )}
          {hotel.website && (
            <span className="inline-flex items-start gap-1.5">
              <ExternalLink size={12} strokeWidth={1.5} className="mt-0.5" />
              <a
                href={
                  /^https?:\/\//i.test(hotel.website)
                    ? hotel.website
                    : `https://${hotel.website}`
                }
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-[color:var(--color-text-primary)]"
              >
                {hotel.website.replace(/^https?:\/\//, "")}
              </a>
            </span>
          )}
          {hotel.receptionHours && (
            <span className="inline-flex items-start gap-1.5">
              <Clock size={12} strokeWidth={1.5} className="mt-0.5" />
              {hotel.receptionHours}
            </span>
          )}
        </div>

        {hotel.generalPolicies && (
          <details className="group rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/45 p-3 text-xs text-[color:var(--color-text-secondary)]">
            <summary className="cursor-pointer list-none">
              <span className="inline-flex items-center gap-1.5 font-medium text-[color:var(--color-text-primary)]">
                <FileText size={12} strokeWidth={1.5} />
                Políticas generales
              </span>
            </summary>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">
              {hotel.generalPolicies}
            </p>
          </details>
        )}
      </div>
    </article>
  );
}
