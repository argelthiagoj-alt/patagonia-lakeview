import { MapPin, Clock, FileText } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { ContactButtons } from "@/components/cabins/HostCard";

type Hotel = {
  legalName: string | null;
  logo: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram?: string | null;
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
  // Mismo criterio que HostCard: siempre renderiza algo. Con el fallback
  // del repo (legalName ← cabin.title, city ← cabin.location) la tarjeta
  // institucional nunca queda vacía.
  if (!hotel) return null;

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
          {hotel.receptionHours && (
            <span className="inline-flex items-start gap-1.5">
              <Clock size={12} strokeWidth={1.5} className="mt-0.5" />
              {hotel.receptionHours}
            </span>
          )}
        </div>

        <ContactButtons
          phone={hotel.phone}
          email={hotel.email}
          instagram={hotel.instagram}
          link={hotel.website}
        />

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
