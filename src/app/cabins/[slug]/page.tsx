import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Star, Users, BedDouble, Bath } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CabinGallery } from "@/components/cabins/CabinGallery";
import { CabinAmenities } from "@/components/cabins/CabinAmenities";
import { BookingForm } from "@/components/booking/BookingForm";
import { CabinCard } from "@/components/cabins/CabinCard";
import { getCabinBySlug, listCabins } from "@/modules/cabins/repo";
import { listReviewsForCabin } from "@/modules/reviews/repo";
import { getCurrentUser } from "@/modules/auth/session";
import { ReviewList, type ReviewItem } from "@/components/reviews/ReviewList";
import { CabinMap } from "@/components/cabins/CabinMap";
import { HostCard } from "@/components/cabins/HostCard";
import { HotelCard } from "@/components/cabins/HotelCard";
import { FavoriteButton } from "@/components/cabins/FavoriteButton";
import { ShareButton } from "@/components/cabins/ShareButton";
import { isFavorited } from "@/modules/favorites/repo";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cabin = await getCabinBySlug(slug);
  if (!cabin) return { title: "Cabaña no encontrada" };
  return {
    title: cabin.title,
    description: cabin.shortDescription,
    openGraph: {
      title: cabin.title,
      description: cabin.shortDescription,
      images: [cabin.images[0]?.url].filter(Boolean) as string[],
    },
  };
}

export default async function CabinDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const cabin = await getCabinBySlug(slug);
  if (!cabin) notFound();

  // Paralelizamos las 3 lecturas independientes (catálogo relacionado,
  // reviews y usuario actual). Antes corrían en serie generando un
  // waterfall de ~3 round-trips innecesario.
  const [allCabins, reviewRows, viewer] = await Promise.all([
    listCabins(),
    listReviewsForCabin(cabin.id).catch(() => []),
    getCurrentUser(),
  ]);
  const related = allCabins.filter((c) => c.id !== cabin.id).slice(0, 3);
  const reviews: ReviewItem[] = reviewRows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    author: r.user.name ?? r.user.email,
    hasPendingAppeal: r.appeals.length > 0,
    canAppeal: Boolean(
      viewer &&
        (viewer.role === "ADMIN" || viewer.role === "SUPER_ADMIN") &&
        (viewer.role === "SUPER_ADMIN" || r.cabin.ownerId === viewer.id)
    ),
    canDelete: viewer?.role === "SUPER_ADMIN",
    breakdown: {
      cleanliness: r.ratingCleanliness,
      accuracy: r.ratingAccuracy,
      checkin: r.ratingCheckin,
      communication: r.ratingCommunication,
      location: r.ratingLocation,
      value: r.ratingValue,
    },
  }));

  // Pre-fill the booking form with the logged user's profile (if any)
  const me = viewer;
  let userDefaults:
    | {
        loggedIn: true;
        email: string;
        name: string;
        documentId?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        hasSavedProfile: boolean;
      }
    | undefined = undefined;
  if (me) {
    const { findProfile } = await import("@/modules/users/repo");
    const u = await findProfile(me.id).catch(() => null);
    if (u) {
      const hasSavedProfile = Boolean(u.documentId && u.phone && u.address);
      userDefaults = {
        loggedIn: true,
        email: u.email,
        name: u.name ?? "",
        documentId: u.documentId ?? undefined,
        phone: u.phone ?? undefined,
        address: u.address ?? undefined,
        city: u.city ?? undefined,
        state: u.state ?? undefined,
        country: u.country ?? undefined,
        hasSavedProfile,
      };
    }
  }

  const checkIn = typeof search.checkIn === "string" ? search.checkIn : undefined;
  const checkOut =
    typeof search.checkOut === "string" ? search.checkOut : undefined;
  const guests =
    typeof search.guests === "string" ? Number(search.guests) : undefined;

  return (
    <article className="pt-28 md:pt-32">
      <div className="container-page mb-6">
        <Link
          href="/cabins"
          className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Volver al catálogo
        </Link>
      </div>

      <header className="container-page mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {cabin.lakeView && <Badge tone="moss">Vista al lago</Badge>}
            <Badge tone="stone">{cabin.location.split(",")[0]}</Badge>
            {cabin.propertyType === "HOTEL" && (
              <Badge tone="warning">Hotel</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ShareButton title={cabin.title} text={cabin.shortDescription} />
            <FavoriteButton
              cabinId={cabin.id}
              initialFavored={
                viewer ? Boolean(await isFavorited(viewer.id, cabin.id)) : false
              }
              loggedIn={Boolean(viewer)}
            />
          </div>
        </div>
        <h1 className="heading-display text-balance max-w-3xl">{cabin.title}</h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[color:var(--color-text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <Star size={14} className="fill-current text-[color:var(--color-accent)]" />
            <strong className="text-[color:var(--color-text-primary)]">
              {cabin.rating.toFixed(2)}
            </strong>
            · {cabin.reviewCount} reseñas
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} strokeWidth={1.5} />
            {cabin.location}
          </span>
        </div>
      </header>

      <div className="container-page">
        <CabinGallery images={cabin.images} />
      </div>

      <div className="container-page mt-16 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-[color:var(--color-border)] py-5">
              <Stat icon={<Users size={16} strokeWidth={1.5} />} label="Huéspedes" value={`${cabin.maxGuests}`} />
              <Stat icon={<BedDouble size={16} strokeWidth={1.5} />} label="Habitaciones" value={`${cabin.bedrooms}`} />
              <Stat icon={<Bath size={16} strokeWidth={1.5} />} label="Baños" value={`${cabin.bathrooms}`} />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Sobre esta cabaña</h2>
              <p className="text-base/relaxed text-[color:var(--color-text-secondary)] md:text-lg/relaxed">
                {cabin.description}
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {cabin.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-3 rounded-2xl border border-[color:var(--color-border)] bg-white/60 p-4 text-sm text-[color:var(--color-text-primary)]"
                >
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--color-accent)]" />
                  {h}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight">Lo que incluye</h2>
            <CabinAmenities amenities={cabin.amenities} />
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium tracking-tight">Ubicación</h2>
            <CabinMap
              latitude={cabin.latitude}
              longitude={cabin.longitude}
              location={cabin.location}
              title={cabin.title}
            />
          </section>

          {cabin.propertyType !== "HOTEL" && cabin.hostInfo && (
            <section className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Tu anfitrión</h2>
              <HostCard host={cabin.hostInfo} />
            </section>
          )}

          {cabin.propertyType === "HOTEL" && cabin.hotelInfo && (
            <section className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Sobre el hotel</h2>
              <HotelCard hotel={cabin.hotelInfo} />
            </section>
          )}

          {cabin.beds.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Camas</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {cabin.beds.map((b) => (
                  <li
                    key={b.type}
                    className="flex items-center justify-between rounded-2xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm"
                  >
                    <span className="text-[color:var(--color-text-primary)]">
                      {(
                        {
                          TWIN: "Individual",
                          DOUBLE: "Matrimonial",
                          QUEEN: "Queen",
                          KING: "King",
                          SOFA_BED: "Sofá cama",
                          BUNK: "Litera",
                        } as const
                      )[b.type]}
                    </span>
                    <strong className="text-[color:var(--color-text-primary)]">
                      ×{b.quantity}
                    </strong>
                  </li>
                ))}
              </ul>
              {cabin.totalUnits > 1 && (
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  Esta publicación representa {cabin.totalUnits} unidades equivalentes.
                </p>
              )}
            </section>
          )}

          <section className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight">Política de cancelación</h2>
            <p className="text-base/relaxed text-[color:var(--color-text-secondary)]">
              Cancelación gratuita hasta 7 días antes del check-in. Entre 7 y 3
              días, reembolso del 50%. Dentro de las 72 horas previas, sin
              reembolso. Llegada 15:00 · Salida 11:00.
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <BookingForm
            cabin={cabin}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
            initialGuests={guests}
            userDefaults={userDefaults}
          />
        </aside>
      </div>

      <section className="container-page mt-24">
        <div className="mb-8 max-w-xl space-y-2">
          <p className="text-eyebrow">Reseñas</p>
          <h2 className="heading-section">
            {cabin.rating.toFixed(2)} ★ · {cabin.reviewCount}{" "}
            {cabin.reviewCount === 1 ? "reseña" : "reseñas"}
          </h2>
        </div>
        <ReviewList reviews={reviews} cabinTitle={cabin.title} />
      </section>

      <section className="container-page mt-32">
        <div className="mb-10 flex items-end justify-between">
          <div className="max-w-xl space-y-2">
            <p className="text-eyebrow">También podría gustarte</p>
            <h2 className="heading-section">Otras cabañas elegidas</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {related.map((c) => (
            <CabinCard key={c.id} cabin={c} />
          ))}
        </div>
      </section>
    </article>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-[color:var(--color-text-secondary)]">
      <span className="text-[color:var(--color-text-primary)]">{icon}</span>
      <strong className="text-[color:var(--color-text-primary)]">{value}</strong>
      {label}
    </div>
  );
}
