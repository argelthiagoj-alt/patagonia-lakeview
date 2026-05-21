import { MapPin, Calendar } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

type Host = {
  name: string | null;
  bio: string | null;
  photo: string | null;
  city: string | null;
  hostingSince: Date | null;
};

/**
 * Card sobria para el anfitrión de una CABIN. Para hoteles no se usa
 * (la propia descripción institucional alcanza).
 */
export function HostCard({ host }: { host: Host }) {
  if (!host || (!host.name && !host.bio && !host.photo)) return null;

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
    <article className="surface-paper flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
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
      <div className="flex-1 space-y-2">
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
              {years === 0 ? "Anfitrión nuevo" : `Hace ${years} ${years === 1 ? "año" : "años"}`}
            </span>
          )}
        </div>
        {host.bio && (
          <p className="max-w-prose text-sm/relaxed text-[color:var(--color-text-primary)]/85">
            {host.bio}
          </p>
        )}
      </div>
    </article>
  );
}
