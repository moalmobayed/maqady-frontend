"use client";

import { useState } from "react";
import type { ImageAsset } from "@/lib/home/types";

type MediaImageProps = {
  image: ImageAsset | null | undefined;
  alt: string;
  className: string;
  preferredVariant?: string;
  fallbackLabel?: string;
  decorative?: boolean;
  fit?: "cover" | "contain";
};

function getImageSource(
  image: ImageAsset | null | undefined,
  preferredVariant: string,
): string | null {
  if (!image) return null;

  const variant =
    image.variants.find((item) => item.name === preferredVariant) ??
    image.variants[image.variants.length - 1];
  if (!variant) return null;

  try {
    const url = new URL(variant.url);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function MediaImage({
  image,
  alt,
  className,
  preferredVariant = "medium",
  fallbackLabel = "Image unavailable",
  decorative = false,
  fit = "cover",
}: MediaImageProps) {
  const source = getImageSource(image, preferredVariant);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative isolate overflow-hidden bg-surface-elevated ${className}`}
    >
      {source && !failed ? (
        <>
          {/* The API image CDN is not yet fixed, so remotePatterns cannot be narrowly configured. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={source}
            alt={decorative ? "" : alt}
            aria-hidden={decorative}
            className={`absolute inset-0 h-full w-full object-${fit}`}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        </>
      ) : (
        <div
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : alt || fallbackLabel}
          aria-hidden={decorative}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-elevated via-muted to-background px-4 text-center text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
        >
          {!decorative && fallbackLabel}
        </div>
      )}
    </div>
  );
}
