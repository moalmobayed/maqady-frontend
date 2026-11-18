"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui";
import { formatReleaseDateLabel } from "@/lib/home/cinema-time";
import type { Movie } from "@/lib/home/types";
import { MediaImage } from "./media-image";
import { MovieCard } from "./movie-card";
import { MotionReveal } from "./motion-reveal";

type MovieSectionProps = {
  title: string;
  description: string;
  movies: Movie[];
  total: number;
  href: string;
  comingSoon?: boolean;
};

export function MovieSection({
  title,
  description,
  movies,
  total,
  href,
  comingSoon = false,
}: MovieSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleMovies =
    !comingSoon && !showAll ? movies.slice(0, 6) : movies;

  return (
    <section
      aria-labelledby={`${comingSoon ? "coming-soon" : "now-showing"}-heading`}
      className={`space-y-5 ${
        comingSoon ? "w-full" : ""
      }`}
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-3">
        <MotionReveal className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            {description}
          </p>
          <h2
            id={`${comingSoon ? "coming-soon" : "now-showing"}-heading`}
            className="font-cinema-display text-4xl font-normal uppercase leading-[1.08] text-[#e8e1d9] sm:text-5xl lg:text-[clamp(3.25rem,4.2vw,4.5rem)]"
          >
            {title}
          </h2>
        </MotionReveal>
        {total > 0 && (
          <MotionReveal delay={0.12}>
            <Link
              href={href}
              className="rounded-md px-2 py-2 text-[10px] font-semibold text-primary transition hover:bg-white/5 sm:text-xs"
            >
              {comingSoon ? "All upcoming" : "All movies"}{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </MotionReveal>
        )}
      </div>

      {movies.length > 0 && !comingSoon ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
            {visibleMovies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} position={index + 1} />
            ))}
          </div>
          {movies.length > 6 && !showAll && (
            <div className="flex flex-col items-center gap-4 pt-1">
              <p className="text-sm text-muted-foreground">
                Showing {visibleMovies.length} of {total}
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
      ) : movies.length > 0 ? (
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {movies.map((movie, index) => (
            <li key={movie.id}>
              <MotionReveal delay={index * 0.08}>
              <Link
                href={`/movies/${movie.id}`}
                className="group grid grid-cols-[5.5rem_3.5rem_minmax(0,1fr)] items-center gap-3 py-4 transition duration-300 hover:scale-[1.01] hover:bg-white/[0.035] focus-within:scale-[1.01] active:scale-[1.02] sm:grid-cols-[8rem_4rem_minmax(0,1fr)_8rem_auto] sm:gap-5 sm:py-5 motion-reduce:transition-none"
              >
                <time
                  dateTime={movie.releaseDate}
                  className="font-cinema-display origin-left text-xl font-normal uppercase leading-none text-[#e8e1d9] transition-transform duration-300 group-hover:scale-105 group-focus-within:scale-105 group-active:scale-110 sm:text-3xl motion-reduce:transition-none"
                >
                  {formatReleaseDateLabel(movie.releaseDate)}
                </time>
                <span className="block w-14 overflow-hidden sm:w-16">
                  <MediaImage
                    image={movie.poster}
                    alt={movie.poster?.alt || `${movie.title} poster`}
                    className="aspect-[2/3] w-full"
                    preferredVariant="small"
                    fallbackLabel="Poster unavailable"
                    decorative
                  />
                </span>
                <span className="min-w-0">
                  <span className="font-cinema-display block origin-left truncate text-lg font-normal uppercase leading-tight text-white transition-transform duration-300 group-hover:scale-[1.04] group-focus-within:scale-[1.04] group-active:scale-[1.08] sm:text-2xl motion-reduce:transition-none">
                    {movie.title}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground sm:hidden">
                    {movie.genres[0]?.name ?? "Coming soon"}
                  </span>
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {movie.genres[0]?.name ?? "Coming soon"}
                </span>
                <span className="hidden text-xs font-semibold uppercase text-white/80 transition group-hover:text-primary sm:block">
                  Details <span aria-hidden="true">→</span>
                </span>
              </Link>
              </MotionReveal>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={comingSoon ? "No upcoming movies listed" : "Nothing showing right now"}
          description={
            comingSoon
              ? "New releases will appear here when they are announced."
              : "There are no movies available to browse at the moment."
          }
        />
      )}
    </section>
  );
}
