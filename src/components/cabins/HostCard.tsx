import { MapPin, Calendar, Mail, ExternalLink, MessageCircle, Instagram } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  toWhatsAppHref,
  toInstagramHref,
  instagramHandle,
} from "@/shared/contact-links";

type Host = {
  name: string | null;
  bio: string | null;
  photo: string | null;
  city: string | null;
  hostingSince: Date | null;
  phone?: string | null;
  email?: string | null;
  link?: string | null;
  instagram?: string | null;
};

/**
 * Card sobria para el anfitrión de una CABIN. Para hoteles no se usa
 * (ver `HotelCard`).
 *
 * Datos sensibles (teléfono/email/link) sólo se renderizan si el admin
 * los cargó voluntariamente — defaultean a null.
 */
export function HostCard({ host }: { host: Host }) {
  // Siempre renderiza algo: si no hay nada cargado, mostramos al menos
  // el nombre con avatar inicial — un huésped nunca debería ver una
  // ficha sin "quién es el anfitrión".
  if (!host) return null;

  const years = host.hostingSince
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - host.hostingSince.getTime()) /
            (1000 * 60 * 60 * 24 * 365)
        )
      )
    : null;

  return (
    <article className="surface-paper flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)] sm:h-24 sm:w-24">
        {host.photo ? (
          <SafeImage
            src={host.photo}
            alt={host.name ?? "Anfitrión"}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-medium text-[color:var(--color-text-muted)]">
            {(host.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 space-y-3">
        {host.name && (
          <p className="text-lg font-medium tracking-tight">{host.name}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[color:var(--color-text-secondary)]">
          {host.city && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} strokeWidth={1.5} />
              {host.city}
            </span>
          )}
          {years !== null && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={12} strokeWidth={1.5} />
              {years === 0
                ? "Anfitrión nuevo"
                : `Hace ${years} ${years === 1 ? "año" : "años"}`}
            </span>
          )}
        </div>
        {host.bio && (
          <p className="max-w-prose text-sm/relaxed text-[color:var(--color-text-primary)]/85">
            {host.bio}
          </p>
        )}
        <ContactButtons
          phone={host.phone}
          email={host.email}
          instagram={host.instagram}
          link={host.link}
        />
      </div>
    </article>
  );
}

/* CTA buttons compartidos por HostCard y HotelCard. Cada uno se renderiza
   sólo si el campo correspondiente tiene valor. */
export function ContactButtons({
  phone,
  email,
  instagram,
  link,
}: {
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  link?: string | null;
}) {
  const wa = toWhatsAppHref(phone);
  const ig = toInstagramHref(instagram);
  const handle = instagramHandle(instagram);
  if (!wa && !email && !ig && !link) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-success)]/15 px-3.5 py-1.5 text-xs font-medium text-[color:var(--color-success)] transition hover:bg-[color:var(--color-success)]/25"
        >
          <MessageCircle size={13} strokeWidth={1.75} />
          WhatsApp
        </a>
      )}
      {ig && (
        <a
          href={ig}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-accent)]/15 px-3.5 py-1.5 text-xs font-medium text-[color:var(--color-accent)] transition hover:bg-[color:var(--color-accent)]/25"
        >
          <Instagram size={13} strokeWidth={1.75} />
          {handle ?? "Instagram"}
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white/60 px-3.5 py-1.5 text-xs font-medium text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-primary)]"
        >
          <Mail size={13} strokeWidth={1.75} />
          Email
        </a>
      )}
      {link && (
        <a
          href={/^https?:\/\//i.test(link) ? link : `https://${link}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white/60 px-3.5 py-1.5 text-xs font-medium text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-primary)]"
        >
          <ExternalLink size={13} strokeWidth={1.75} />
          Más info
        </a>
      )}
    </div>
  );
}

