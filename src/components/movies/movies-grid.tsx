import { ChevronRight, LoaderCircle } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/ui";
import type { Movie, MovieStatus } from "@/lib/home/types";
import type { MovieCatalogPage } from "@/lib/movies/types";
import { MovieCard } from "./movie-card";

type MoviesGridProps = {
  status: MovieStatus;
  catalog: MovieCatalogPage | null;
  items: Movie[];
  error: string | null;
  hasAppliedCriteria: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreError: string | null;
  onLoadMore: () => void;
  onRetry: () => void;
  onClearSearchAndFilters: () => void;
};

export function MoviesGrid({
  status,
  catalog,
  items,
  error,
  hasAppliedCriteria,
  hasMore,
  loadingMore,
  loadMoreError,
  onLoadMore,
  onRetry,
  onClearSearchAndFilters,
}: MoviesGridProps) {
  return (
    <section
      aria-labelledby="movie-results-heading"
      className="mt-8 min-w-0 min-[1200px]:mt-0"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="movie-results-heading" className="text-lg font-semibold">
            {status === "now_showing" ? "Now showing" : "Coming soon"}
          </h2>
          <p
            role="status"
            aria-live="polite"
            className="mt-1 text-xs text-white/45"
          >
            {catalog === null
              ? "Browse the Maqady movie catalog"
              : `${catalog.total} ${catalog.total === 1 ? "movie" : "movies"} found`}
          </p>
        </div>
      </div>

      {error ? (
        <ErrorState
          title="We couldn't load the movies"
          message={error}
          action={
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent"
            >
              Try again
            </button>
          }
        />
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-6 min-[1200px]:grid-cols-4 min-[1500px]:grid-cols-5">
            {items.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center gap-3">
            <p className="text-xs text-white/50">
              Showing {items.length} of {catalog?.total ?? 0}
            </p>
            {hasMore ? (
              <>
                {loadMoreError && (
                  <p role="alert" className="text-sm text-destructive">
                    {loadMoreError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 px-6 text-sm font-semibold text-white transition hover:border-primary hover:text-primary disabled:cursor-wait disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-4 animate-spin"
                      />
                      Loading movies
                    </>
                  ) : (
                    <>
                      Load more
                      <ChevronRight aria-hidden="true" className="size-4" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <p className="text-xs text-white/40">
                You&apos;ve reached the end of the list.
              </p>
            )}
          </div>
        </>
      ) : (
        <EmptyState
          title={
            hasAppliedCriteria
              ? "No movies match those filters"
              : status === "now_showing"
                ? "No movies are showing right now"
                : "No upcoming movies yet"
          }
          description={
            hasAppliedCriteria
              ? "Try a different title or remove one or more filters."
              : "Please check back soon for updates to the movie schedule."
          }
          action={
            hasAppliedCriteria ? (
              <button
                type="button"
                onClick={onClearSearchAndFilters}
                className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent"
              >
                Clear search and filters
              </button>
            ) : undefined
          }
        />
      )}
    </section>
  );
}
