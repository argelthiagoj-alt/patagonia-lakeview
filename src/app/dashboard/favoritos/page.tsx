import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import { listFavoriteCabins } from "@/modules/favorites/repo";
import { SafeImage } from "@/components/ui/SafeImage";
import { blurDataURL } from "@/lib/images";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/dashboard/favoritos");

  const favorites = await listFavoriteCabins(me.id).catch(() => []);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-eyebrow flex items-center gap-1.5">
          <Heart size={12} strokeWidth={2} />
          Tu lista
        </p>
        <h1 className="heading-section">Favoritos</h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
          Las publicaciones que guardaste para volver a ver. Tocá el corazón en
          cualquier cabaña u hotel para sumarla a esta lista.
        </p>
      </header>

      {favorites.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-white/40 p-10 text-center text-sm text-[color:var(--color-text-secondary)]">
          Aún no guardaste ninguna publicación.{" "}
          <Link href="/cabins" className="underline">
            Explorá el catálogo
          </Link>
          .
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f) => {
            const cover = f.cabin.images[0]?.url;
            return (
              <li key={f.cabinId}>
                <Link
                  href={`/cabins/${f.cabin.slug}`}
                  className="group block overflow-hidden rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] transition hover:border-[color:var(--color-primary)]"
                >
                  <div className="relative aspect-[5/4] w-full">
                    {cover ? (
                      <SafeImage
                        src={cover}
                        alt={f.cabin.title}
                        fill
                        placeholder="blur"
                        blurDataURL={blurDataURL}
                        sizes="(min-width: 1024px) 30vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="h-full w-full bg-[color:var(--color-surface-muted)]" />
                    )}
                  </div>
                  <div className="space-y-1.5 p-4">
                    <p className="text-base font-medium tracking-tight">
                      {f.cabin.title}
                    </p>
                    <p className="inline-flex items-center gap-1 text-xs text-[color:var(--color-text-secondary)]">
                      <MapPin size={11} strokeWidth={1.5} />
                      {f.cabin.location}
                    </p>
                    <p className="text-xs text-[color:var(--color-text-secondary)]">
                      Desde {formatCurrency(f.cabin.pricePerNight)} / noche
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
