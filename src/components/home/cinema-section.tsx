"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui";
import { formatCinemaTime } from "@/lib/home/cinema-time";
import type { Cinema } from "@/lib/home/types";
import { MediaImage } from "./media-image";
import { MotionReveal } from "./motion-reveal";

const facilityLabels: Record<string, string> = {
  wheelchair_access: "Wheelchair access",
  free_parking: "Free parking",
  valet_parking: "Valet parking",
  street_parking: "Street parking",
  cafe_bar: "Cafe",
  food_court: "Food court",
  kids_room: "Kids room",
};

function getOpenStateLabel(cinema: Cinema): string {
  if (cinema.openState.isOpen) {
    const closesAt = cinema.openState.closesAt
      ? formatCinemaTime(cinema.openState.closesAt)
      : "";
    return closesAt ? `Open now · until ${closesAt}` : "Open now";
  }

  const nextOpensAt = cinema.openState.nextOpensAt
    ? formatCinemaTime(cinema.openState.nextOpensAt)
    : "";
  return nextOpensAt ? `Closed · opens ${nextOpensAt}` : "Closed now";
}

type CinemaSectionProps = {
  cinemas: Cinema[];
};

export function CinemaSection({ cinemas }: CinemaSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleCinemas = showAll ? cinemas : cinemas.slice(0, 6);

  return (
    <section aria-labelledby="our-cinemas-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-3">
        <MotionReveal className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Find us near you
          </p>
          <h2
            id="our-cinemas-heading"
            className="font-cinema-display text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl"
          >
            Our cinemas
          </h2>
        </MotionReveal>
        <MotionReveal delay={0.12}>
          <Link
            href="/theaters"
            className="rounded-md px-2 py-2 text-[10px] font-semibold text-primary transition hover:bg-white/5 sm:text-xs"
          >
            Map & hours <span aria-hidden="true">→</span>
          </Link>
        </MotionReveal>
      </div>

      {cinemas.length > 0 ? (
        <>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCinemas.map((cinema, index) => {
            const facilities = (cinema.facilities ?? [])
              .map((facility) => facilityLabels[facility])
              .filter((label): label is string => Boolean(label))

            return (
              <li key={cinema.id} className="min-w-0">
                <article className="group h-full overflow-hidden border border-white/10 bg-[#151312] transition duration-300 hover:scale-[1.02] hover:border-white/25 hover:shadow-xl hover:shadow-black/30 focus-within:scale-[1.02] active:scale-[1.025] motion-reduce:transition-none">
                  <Link
                    href={`/theaters/${cinema.id}`}
                    className="block focus-visible:outline-offset-[-3px]"
                  >
                    <MediaImage
                      image={cinema.cover}
                      alt={cinema.cover?.alt || `${cinema.name} cinema`}
                      className="aspect-[16/9] w-full transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                      preferredVariant="medium"
                      fallbackLabel="Cinema image unavailable"
                    />
                  </Link>
                  <MotionReveal className="space-y-3 p-4 sm:p-5" delay={index * 0.08}>
                    <div>
                      <h3 className="font-cinema-display origin-left text-2xl font-normal uppercase leading-tight text-[#e8e1d9] transition-transform duration-300 group-hover:scale-[1.03] group-focus-within:scale-[1.03] sm:text-3xl motion-reduce:transition-none">
                        {cinema.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {cinema.district}, {cinema.city}
                      </p>
                    </div>

                    <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="mt-0.5 size-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                      <span>{cinema.address}</span>
                    </p>

                    <p className="flex items-center gap-2 text-sm">
                      <span
                        aria-hidden="true"
                        className={`size-2.5 shrink-0 rounded-full ${
                          cinema.openState.isOpen ? "bg-emerald-400" : "bg-white/35"
                        }`}
                      />
                      <span className="text-foreground">
                        {getOpenStateLabel(cinema)}
                      </span>
                    </p>

                    {cinema.mainPhone && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="size-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        >
                          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1Z" />
                        </svg>
                        <a
                          href={`tel:${cinema.mainPhone.number}`}
                          className="font-mono text-foreground underline-offset-2 hover:underline"
                        >
                          {cinema.mainPhone.number}
                        </a>
                      </p>
                    )}

                    {(cinema.hallCount > 0 || facilities.length > 0) && (
                      <div className="border-t border-white/10 pt-3 text-sm text-muted-foreground">
                        <ul className="flex flex-wrap gap-x-1.5 gap-y-1">
                          {cinema.hallCount > 0 && (
                            <li>
                              {cinema.hallCount}{" "}
                              {cinema.hallCount === 1 ? "hall" : "halls"}
                            </li>
                          )}
                          {facilities.map((facility) => (
                            <li key={facility} className="before:content-['·'] before:mr-1.5">
                              {facility}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </MotionReveal>
                </article>
              </li>
            );
            })}
          </ul>
          {cinemas.length > 6 && !showAll && (
            <div className="flex flex-col items-center gap-4 pt-1">
              <p className="text-sm text-muted-foreground">
                Showing {visibleCinemas.length} of {cinemas.length}
              </p>
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex min-w-44 items-center justify-center gap-4 rounded-md border border-white/20 px-6 py-4 text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Load more
                <span aria-hidden="true" className="text-xl leading-none">
                  ›
                </span>
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No cinemas available"
          description="Cinema locations will appear here when they are available."
        />
      )}
    </section>
  );
}
