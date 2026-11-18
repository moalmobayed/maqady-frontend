import Link from "next/link";
import type { Movie } from "@/lib/home/types";
import { MediaImage } from "./media-image";
import { MotionReveal } from "./motion-reveal";

type MovieCardProps = {
  movie: Movie;
  position: number;
};

export function MovieCard({ movie, position }: MovieCardProps) {
  const firstGenre = movie.genres[0]?.name;
  const runtime = movie.runtimeMinutes
    ? `${Math.floor(movie.runtimeMinutes / 60)}h ${movie.runtimeMinutes % 60}m`
    : null;

  return (
    <article className="group min-w-0 transition-transform duration-300 hover:scale-[1.025] focus-within:scale-[1.025] active:scale-[1.035] motion-reduce:transition-none">
      <Link
        href={`/movies/${movie.id}`}
        className="block rounded-sm focus-visible:outline-offset-4"
      >
        <div className="relative block overflow-hidden">
          <MediaImage
            image={movie.poster}
            alt={movie.poster?.alt || `${movie.title} poster`}
            className="aspect-[2/3] w-full transition duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
            preferredVariant="medium"
            fallbackLabel="Poster unavailable"
          />
          <span className="absolute left-2 top-2 bg-black/80 px-1.5 py-1 font-mono text-[10px] text-white">
            {String(position).padStart(2, "0")}
          </span>
        </div>
        <MotionReveal className="block space-y-1.5 pt-3" delay={position * 0.07}>
          <span className="flex items-baseline justify-between gap-2">
            <span className="line-clamp-1 origin-left text-sm font-medium uppercase leading-tight tracking-wide text-white transition-transform duration-300 group-hover:scale-[1.04] group-focus-within:scale-[1.04] group-active:scale-[1.06] sm:text-base motion-reduce:transition-none">
              {movie.title}
            </span>
            <span className="shrink-0 text-[10px] font-semibold text-white/75">
              {movie.ageRating}
            </span>
          </span>
          <span className="block truncate text-[10px] uppercase tracking-wide text-muted-foreground">
            {[
              firstGenre,
              runtime,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </MotionReveal>
      </Link>
    </article>
  );
}
