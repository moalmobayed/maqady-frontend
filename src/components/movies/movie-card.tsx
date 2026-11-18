import Link from "next/link";
import { MediaImage } from "@/components/home/media-image";
import type { Movie } from "@/lib/home/types";
import { formatReleaseDate, formatRuntime } from "./movies-utils";

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  const metadata = [
    movie.genres.slice(0, 3).map((genre) => genre.name).join(", "),
    formatRuntime(movie.runtimeMinutes),
    movie.ageRating,
  ].filter(Boolean);
  const releaseLabel =
    movie.status === "now_showing" ? "RELEASED" : "IN CINEMAS FROM";

  return (
    <article className="group min-w-0">
      <Link
        href={`/movies/${movie.id}`}
        aria-label={`${movie.title}, ${metadata.join(", ")}, ${releaseLabel.toLowerCase()} ${formatReleaseDate(movie.releaseDate)}`}
        className="block rounded-sm focus-visible:outline-offset-4"
      >
        <div className="relative overflow-hidden bg-surface-elevated">
          <MediaImage
            image={movie.poster}
            alt={movie.poster?.alt || `${movie.title} poster`}
            className="aspect-[2/3] w-full transition duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
            preferredVariant="medium"
            fallbackLabel="Poster unavailable"
          />
        </div>
        <div className="pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-white transition-colors group-hover:text-primary sm:text-base">
              {movie.title}
            </h2>
            {movie.ageRating && (
              <span className="shrink-0 rounded-sm border border-white/25 px-1.5 py-0.5 text-[10px] font-semibold text-white/75">
                {movie.ageRating}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-1 text-[11px] text-white/55">
            {[
              movie.genres.slice(0, 3).map((genre) => genre.name).join(", "),
              formatRuntime(movie.runtimeMinutes),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-primary">
            {releaseLabel} {formatReleaseDate(movie.releaseDate)}
          </p>
        </div>
      </Link>
    </article>
  );
}
