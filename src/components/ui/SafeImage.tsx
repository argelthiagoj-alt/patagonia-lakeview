"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { fallbackImage } from "@/lib/images";
import { cn } from "@/lib/utils";

type SafeImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

/**
 * Image wrapper that swaps in a fallback URL if the remote image errors.
 * Use this anywhere we render a remote/Unsplash image so the layout doesn't break.
 */
export function SafeImage({
  src,
  alt,
  fallbackSrc = fallbackImage.url,
  className,
  unoptimized,
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [errored, setErrored] = useState(false);

  // Skip the Next.js image optimizer for inline data URLs:
  // they'd otherwise be sent through /_next/image as a giant query param.
  const isDataUrl = currentSrc.startsWith("data:");

  return (
    <Image
      src={currentSrc}
      alt={alt}
      unoptimized={unoptimized ?? isDataUrl}
      className={cn(
        "object-cover transition-opacity duration-700",
        className
      )}
      onError={() => {
        if (!errored) {
          setErrored(true);
          setCurrentSrc(fallbackSrc);
        }
      }}
      {...props}
    />
  );
}
