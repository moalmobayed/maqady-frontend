import Link from "next/link";
import { ErrorState, EmptyState } from "@/components/ui";
import type { HomeData, HomeLoadError } from "@/lib/home/types";
import { CinemaSection } from "./cinema-section";
import { FeaturedHero } from "./featured-hero";
import { GenreLinks } from "./genre-links";
import { MovieSection } from "./movie-section";
import { RetryHomeButton } from "./retry-home-button";
import { ShowtimeTicker } from "./showtime-ticker";

type HomeContentProps = {
  data: HomeData | null;
  error: HomeLoadError | null;
};

export function HomeContent({ data, error }: HomeContentProps) {
  const hasAnyMovies =
    !!data &&
    (data.featured.length > 0 ||
      data.nowShowing.items.length > 0 ||
      data.comingSoon.items.length > 0);

  return (
    <div className="flex flex-1 flex-col">
      {error ? (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-12 pt-28 sm:px-8">
          <section aria-labelledby="home-heading" className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                Maqady Cinema
              </p>
              <h1 id="home-heading" className="text-4xl font-black tracking-tight">
                Discover movies and cinemas
              </h1>
            </div>
            <ErrorState
              title={
                error.kind === "configuration"
                  ? "Home data is not connected"
                  : "We couldn't load the Home page"
              }
              message={error.message}
              action={<RetryHomeButton />}
            />
            <p className="text-sm text-muted-foreground">
              You can still browse{" "}
              <Link href="/movies" className="text-foreground underline">
                movies
              </Link>{" "}
              or{" "}
              <Link href="/theaters" className="text-foreground underline">
                cinemas
              </Link>
              .
            </p>
          </section>
        </main>
      ) : data ? (
        <>
          <FeaturedHero featured={data.featured} />
          <ShowtimeTicker data={data} />
          <main className="mx-auto flex w-full max-w-[1800px] flex-1 flex-col gap-14 px-5 py-10 sm:gap-16 sm:px-8 sm:py-14">
            {!hasAnyMovies && (
              <EmptyState
                title="No movies are currently available"
                description="Please check back soon for movies and upcoming releases."
                action={
                  <Link
                    href="/movies"
                    className="inline-flex rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent"
                  >
                    Browse movies
                  </Link>
                }
              />
            )}
            <GenreLinks genres={data.genres} />
            <MovieSection
              title="Now showing"
              description="On the big screen"
              movies={data.nowShowing.items.filter(
                (movie) => movie.status === "now_showing",
              )}
              total={data.nowShowing.total}
              href="/movies"
            />
            <MovieSection
              title="Coming soon"
              description="Upcoming releases"
              movies={data.comingSoon.items.filter(
                (movie) => movie.status === "coming_soon",
              )}
              total={data.comingSoon.total}
              href="/movies?status=coming_soon"
              comingSoon
            />
            <CinemaSection cinemas={data.cinemas} />
          </main>
        </>
      ) : (
        <main className="flex-1" />
      )}
    </div>
  );
}
