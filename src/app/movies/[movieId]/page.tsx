import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  MovieDetailsLoadError,
  MovieDetailsPage,
} from "@/components/movies/movie-details-page";
import {
  getMovieDetails,
  getMovieShowtimes,
  getSimilarMovies,
} from "@/lib/movies/service";

export const metadata: Metadata = {
  title: "Movie Details | Maqady",
  description:
    "Explore movie details, cast, videos, photos, and upcoming Maqady showtimes.",
};

type MovieDetailsRouteProps = {
  params: Promise<{ movieId: string }>;
};

export default async function MovieDetailsRoute({
  params,
}: MovieDetailsRouteProps) {
  const { movieId: rawMovieId } = await params;
  if (!/^[1-9]\d*$/.test(rawMovieId)) notFound();

  const movieId = Number(rawMovieId);
  if (!Number.isSafeInteger(movieId)) notFound();

  const movieResult = await getMovieDetails(movieId);
  if (!movieResult.ok) {
    if (movieResult.error.kind === "not-found") notFound();
    return <MovieDetailsLoadError message={movieResult.error.message} />;
  }

  const [showtimesResult, similarMoviesResult] = await Promise.all([
    getMovieShowtimes(movieId),
    getSimilarMovies(movieId),
  ]);

  return (
    <MovieDetailsPage
      key={movieId}
      movie={movieResult.data}
      showtimes={showtimesResult.ok ? showtimesResult.data : null}
      similarMovies={
        similarMoviesResult.ok ? similarMoviesResult.data : []
      }
      showtimesError={
        showtimesResult.ok ? null : showtimesResult.error.message
      }
    />
  );
}
