import { MapPin, ExternalLink } from "lucide-react";

/**
 * Mapa liviano para la página de detalle de una publicación.
 *
 * Estrategia:
 *   - Si tenemos latitud/longitud → iframe a OpenStreetMap (sin API key).
 *   - Si no → caja con la ubicación textual + link a Google Maps que
 *     hace búsqueda por el campo `location`.
 *   - Si el iframe falla a cargar, queda visible el botón de "Abrir en
 *     OSM" como fallback explícito.
 *
 * Sin React Leaflet, sin Mapbox, sin nada que rompa SSR ni cliente
 * mobile.
 */
export function CabinMap({
  latitude,
  longitude,
  location,
  title,
}: {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  location: string;
  title: string;
}) {
  const hasCoords =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  if (!hasCoords) {
    const q = encodeURIComponent(`${title} ${location}`);
    return (
      <div className="surface-paper flex items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <MapPin
            size={18}
            strokeWidth={1.5}
            className="mt-0.5 text-[color:var(--color-text-secondary)]"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium">{location}</p>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Coordenadas no disponibles — abrí el link para ver en mapas.
            </p>
          </div>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${q}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-medium transition hover:border-[color:var(--color-primary)]"
        >
          Ver en mapa
          <ExternalLink size={12} strokeWidth={1.5} />
        </a>
      </div>
    );
  }

  // Bounding box muy chico alrededor del punto para que OSM zoom-in.
  const d = 0.005;
  const bbox = `${longitude! - d},${latitude! - d},${longitude! + d},${
    latitude! + d
  }`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
  const osmLink = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
  const gLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="surface-paper overflow-hidden p-0">
      <div className="relative aspect-[16/9] w-full bg-[color:var(--color-surface-muted)]">
        {/* iframe con title accesible. loading="lazy" para no degradar LCP. */}
        <iframe
          src={src}
          title={`Mapa de ${title} en ${location}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-[color:var(--color-text-secondary)]">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={12} strokeWidth={1.5} />
          {location}
        </span>
        <span className="flex flex-wrap items-center gap-3">
          <a
            href={osmLink}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-[color:var(--color-text-primary)]"
          >
            OpenStreetMap ↗
          </a>
          <a
            href={gLink}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-[color:var(--color-text-primary)]"
          >
            Google Maps ↗
          </a>
        </span>
      </div>
    </div>
  );
}
