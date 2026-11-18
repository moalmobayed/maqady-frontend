import {
  getCatalogErrorStatus,
  getMovieCatalogWithFilters,
} from "@/lib/movies/service";
import type { MovieCatalogQuery, MovieShowDate } from "@/lib/movies/types";
import type { Movie } from "@/lib/home/types";

const GENRE_SLUG_PATTERN = /^[a-z0-9-]+$/;
const SHOW_DATES = new Set<MovieShowDate>([
  "any",
  "today",
  "tomorrow",
  "weekend",
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedStatus = searchParams.get("status") ?? "now_showing";
  if (
    requestedStatus !== "now_showing" &&
    requestedStatus !== "coming_soon"
  ) {
    return Response.json({ error: "Unsupported movie status." }, { status: 400 });
  }

  const query = (searchParams.get("q") ?? "").trim();
  if (query.length > 100) {
    return Response.json(
      { error: "Movie searches must be 100 characters or fewer." },
      { status: 400 },
    );
  }

  const genres = [...new Set(searchParams.getAll("genres"))];
  if (genres.some((genre) => !GENRE_SLUG_PATTERN.test(genre))) {
    return Response.json({ error: "Unsupported movie genre." }, { status: 400 });
  }

  const cursor = searchParams.get("cursor");
  if (cursor && cursor.length > 2048) {
    return Response.json({ error: "Invalid movie page cursor." }, { status: 400 });
  }
  const showDateValue = searchParams.get("showDate") ?? "any";
  if (!SHOW_DATES.has(showDateValue as MovieShowDate)) {
    return Response.json({ error: "Unsupported movie show date." }, { status: 400 });
  }

  const castValue = searchParams.get("cast");
  const castId =
    castValue && /^\d+$/.test(castValue) ? Number(castValue) : null;
  if (castValue && (!castId || !Number.isSafeInteger(castId))) {
    return Response.json({ error: "Unsupported movie cast member." }, { status: 400 });
  }
  if (cursor && (showDateValue !== "any" || castId !== null)) {
    const filteredCursor = /^filtered:(\d+)$/.exec(cursor);
    if (
      !filteredCursor ||
      !Number.isSafeInteger(Number(filteredCursor[1]))
    ) {
      return Response.json(
        { error: "Invalid filtered movie page cursor." },
        { status: 400 },
      );
    }
  }

  const catalogQuery: MovieCatalogQuery = {
    status: requestedStatus as Movie["status"],
    query,
    genres,
    cursor,
    pageSize: 6,
  };
  const result = await getMovieCatalogWithFilters(
    catalogQuery,
    {
      showDate: showDateValue as MovieShowDate,
      castId,
    },
    cursor,
  );

  if (!result.ok) {
    return Response.json(
      { error: result.error.message },
      { status: getCatalogErrorStatus(result.error) },
    );
  }

  return Response.json(result.data);
}
