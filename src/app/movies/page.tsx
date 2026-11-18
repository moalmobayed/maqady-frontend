import type { Metadata } from "next";
import { MoviesPage } from "@/components/movies/movies-page";
import {
  getMovieCatalogWithFilters,
  getMovieGenres,
  getMoviePeople,
} from "@/lib/movies/service";
import type { MovieCatalogQuery, MovieShowDate } from "@/lib/movies/types";
import type { Movie } from "@/lib/home/types";

export const metadata: Metadata = {
  title: "Movies | Maqady",
  description:
    "Browse movies now showing and coming soon at Maqady cinemas.",
};

type MoviesSearchParams = {
  status?: string | string[];
  q?: string | string[];
  genres?: string | string[];
  showDate?: string | string[];
  cast?: string | string[];
};

type MoviesRouteProps = {
  searchParams: Promise<MoviesSearchParams>;
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function values(value: string | string[] | undefined): string[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

export default async function MoviesRoute({
  searchParams,
}: MoviesRouteProps) {
  const params = await searchParams;
  const requestedStatus = firstValue(params.status);
  const status: Movie["status"] =
    requestedStatus === "coming_soon" ? "coming_soon" : "now_showing";
  const query = firstValue(params.q).trim().slice(0, 100);
  const requestedShowDate = firstValue(params.showDate);
  const validShowDates: MovieShowDate[] = [
    "any",
    "today",
    "tomorrow",
    "weekend",
  ];
  const showDate: MovieShowDate = validShowDates.includes(
    requestedShowDate as MovieShowDate,
  )
    ? (requestedShowDate as MovieShowDate)
    : "any";
  const requestedCastId = firstValue(params.cast);
  const parsedCastId = /^\d+$/.test(requestedCastId)
    ? Number(requestedCastId)
    : null;

  const [genresResult, peopleResult, initialGenreSlugs] = await Promise.all([
    getMovieGenres(),
    getMoviePeople(),
    Promise.resolve(values(params.genres)),
  ]);
  const supportedGenres = genresResult.ok
    ? new Set(genresResult.data.map((genre) => genre.slug))
    : new Set<string>();
  const genres = [...new Set(initialGenreSlugs)].filter((slug) =>
    supportedGenres.has(slug),
  );
  const catalogQuery: MovieCatalogQuery = {
    status,
    query,
    genres,
  };
  const people = peopleResult.ok ? peopleResult.data : [];
  const selectedCastId =
    parsedCastId !== null &&
    people.some((person) => person.id === parsedCastId)
      ? parsedCastId
      : null;
  const invalidFilterError =
    (requestedShowDate && !validShowDates.includes(requestedShowDate as MovieShowDate)) ||
    (requestedCastId && selectedCastId === null)
      ? "The selected show date or cast member is unavailable."
      : null;
  const catalogResult = await getMovieCatalogWithFilters(
    catalogQuery,
    {
      showDate: showDate,
      castId: selectedCastId,
    },
  );
  const genresError = genresResult.ok ? null : genresResult.error.message;
  const catalogError = catalogResult.ok ? null : catalogResult.error.message;
  const error = invalidFilterError || genresError || catalogError;

  return (
    <MoviesPage
      status={status}
      query={query}
      genres={genresResult.ok ? genresResult.data : []}
      people={people}
      peopleError={peopleResult.ok ? null : peopleResult.error.message}
      selectedGenres={genres}
      selectedShowDate={showDate}
      selectedCastId={selectedCastId}
      catalog={catalogResult.ok ? catalogResult.data : null}
      error={error}
    />
  );
}
