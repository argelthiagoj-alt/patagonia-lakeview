"use client";

import { useState } from "react";
import { Expand, X, ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { blurDataURL, type ImageAsset } from "@/lib/images";
import { cn } from "@/lib/utils";

type Props = {
  images: ImageAsset[];
};

export function CabinGallery({ images }: Props) {
  const [active, setActive] = useState<number | null>(null);

  const main = images[0];
  const rest = images.slice(1, 5);

  return (
    <>
      <div className="grid h-[60vh] min-h-[420px] grid-cols-1 gap-2 overflow-hidden rounded-[2rem] md:grid-cols-4 md:grid-rows-2">
        <button
          type="button"
          onClick={() => setActive(0)}
          className="relative col-span-1 row-span-1 overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 md:rounded-l-[2rem] md:rounded-r-none"
        >
          <SafeImage
            src={main.url}
            alt={main.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            placeholder="blur"
            blurDataURL={blurDataURL}
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
        </button>

        {rest.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => setActive(i + 1)}
            className={cn(
              "relative hidden overflow-hidden rounded-2xl md:block",
              i === 1 && "md:rounded-tr-[2rem]",
              i === 3 && "md:rounded-br-[2rem]"
            )}
          >
            <SafeImage
              src={img.url}
              alt={img.alt}
              fill
              sizes="25vw"
              placeholder="blur"
              blurDataURL={blurDataURL}
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </button>
        ))}

        <button
          type="button"
          onClick={() => setActive(0)}
          className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur transition hover:bg-black"
        >
          <Expand size={14} strokeWidth={1.5} />
          Ver todas ({images.length})
        </button>
      </div>

      {active !== null && (
        <Lightbox
          images={images}
          index={active}
          onClose={() => setActive(null)}
          onIndexChange={setActive}
        />
      )}
    </>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: ImageAsset[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const current = images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <X size={18} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIndexChange((index - 1 + images.length) % images.length);
        }}
        aria-label="Anterior"
        className="absolute left-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        className="relative aspect-[3/2] w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <SafeImage
          src={current.url}
          alt={current.alt}
          fill
          sizes="100vw"
          className="object-contain"
        />
        <p className="absolute inset-x-0 bottom-[-2.5rem] text-center text-xs text-white/70">
          {index + 1} / {images.length}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIndexChange((index + 1) % images.length);
        }}
        aria-label="Siguiente"
        className="absolute right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
