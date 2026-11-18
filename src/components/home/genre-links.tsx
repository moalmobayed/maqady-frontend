import Link from "next/link";
import type { HomeData } from "@/lib/home/types";
import { MotionReveal } from "./motion-reveal";

type GenreLinksProps = {
  genres: HomeData["genres"];
};

export function GenreLinks({ genres }: GenreLinksProps) {
  const availableGenres = genres.filter(
    (genre) => genre.movieCount > 0 && genre.slug.trim().length > 0,
  );
  if (availableGenres.length === 0) return null;

  return (
    <section aria-labelledby="browse-genres-heading" className="space-y-3">
      <MotionReveal>
        <h2
          id="browse-genres-heading"
          className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
        >
          Browse by genre
        </h2>
      </MotionReveal>
      <MotionReveal delay={0.12}>
      <ul className="flex flex-wrap items-center gap-x-3 gap-y-0 sm:gap-x-4">
        {availableGenres.map((genre, index) => (
          <li key={genre.id} className="flex items-center gap-3 sm:gap-4">
            <Link
              href={`/movies?genres=${encodeURIComponent(genre.slug)}`}
              className="font-cinema-display text-4xl font-normal uppercase leading-[1.08] text-[#e8e1d9] transition-colors hover:text-primary sm:text-5xl lg:text-[clamp(3.25rem,4.2vw,4.5rem)]"
            >
              {genre.name}
            </Link>
            {index < availableGenres.length - 1 && (
              <span
                aria-hidden="true"
                className="font-cinema-display text-4xl leading-none text-[#3a332f] sm:text-5xl lg:text-[clamp(3.25rem,4.2vw,4.5rem)]"
              >
                /
              </span>
            )}
          </li>
        ))}
      </ul>
      </MotionReveal>
    </section>
  );
}
