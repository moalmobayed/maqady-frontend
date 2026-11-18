import "server-only";
import {
  isMovieCreditsResponse,
  isMovieCatalogPage,
  isMovieDetailsResponse,
  isMovieGenresResponse,
  isMoviePeopleResponse,
  isMovieSimilarResponse,
  isMovieShowtimesDetailResponse,
  isMovieShowtimesResponse,
  type MovieCatalogPage,
  type MovieCatalogError,
  type MovieCatalogQuery,
  type MovieCatalogResult,
  type MovieDetailsResult,
  type MovieGenresResult,
  type MoviePeopleResult,
  type MoviePerson,
  type MovieSimilarResult,
  type MovieShowDate,
  type MovieShowtimesResult,
} from "./types";
import type { Movie } from "@/lib/home/types";

const REQUEST_TIMEOUT_MS = 60_000;
const DEFAULT_CATALOG_PAGE_SIZE = 6;
const FILTERED_CATALOG_PAGE_SIZE = 50;
const DEFAULT_API_BASE_URL = "https://maqady-backend.vercel.app/api/v1";
const FILTER_CURSOR_PREFIX = "filtered:";

type JsonResult =
  | { ok: true; data: unknown }
  | { ok: false; error: MovieCatalogError & { status?: number } };

type MovieFilterOptions = {
  showDate: MovieShowDate;
  castId: number | null;
};

function failure(
  kind: MovieCatalogError["kind"],
  message: string,
): MovieCatalogResult {
  return { ok: false, error: { kind, message } };
}

function getApiEndpoint(path: string): URL | MovieCatalogError {
  const baseUrl =
    process.env.MAQADY_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

  try {
    const parsedBaseUrl = new URL(baseUrl);
    if (parsedBaseUrl.protocol !== "http:" && parsedBaseUrl.protocol !== "https:") {
      throw new Error("The API base URL must use HTTP or HTTPS.");
    }

    return new URL(path, `${parsedBaseUrl.toString().replace(/\/+$/, "")}/`);
  } catch {
    return {
      kind: "configuration",
      message: "The movie service URL is invalid. Check MAQADY_API_BASE_URL.",
    };
  }
}

async function requestJson(
  path: string | URL,
  label: string,
): Promise<JsonResult> {
  const endpoint = path instanceof URL ? path : getApiEndpoint(path);
  if (!(endpoint instanceof URL)) {
    return { ok: false, error: endpoint };
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error(`${label} request failed:`, error);
    return {
      ok: false,
      error: {
        kind: "network",
        message: `We couldn't reach the ${label.toLowerCase()} service. Please try again shortly.`,
      },
    };
  }

  if (!response.ok) {
    console.error(`${label} API returned an unsuccessful response:`, {
      status: response.status,
      requestId: response.headers.get("x-request-id"),
    });
    return {
      ok: false,
      error: {
        kind: "http",
        message: `We couldn't load ${label.toLowerCase()}. Please try again.`,
        status: response.status,
      },
    };
  }

  try {
    return { ok: true, data: await response.json() };
  } catch (error) {
    console.error(`${label} API returned invalid JSON:`, error);
    return {
      ok: false,
      error: {
        kind: "invalid-response",
        message: `The ${label.toLowerCase()} service returned unreadable data.`,
      },
    };
  }
}

function buildCatalogUrl(
  query: MovieCatalogQuery,
  cursor: string | null | undefined,
): URL | MovieCatalogError {
  const endpoint = getApiEndpoint("movies");
  if (!(endpoint instanceof URL)) return endpoint;

  endpoint.searchParams.set("status", query.status);
  endpoint.searchParams.set(
    "limit",
    String(query.pageSize ?? DEFAULT_CATALOG_PAGE_SIZE),
  );

  if (query.query) endpoint.searchParams.set("q", query.query);
  for (const genre of query.genres) {
    endpoint.searchParams.append("genres", genre);
  }
  if (cursor) endpoint.searchParams.set("cursor", cursor);

  return endpoint;
}

async function requestCatalog(
  query: MovieCatalogQuery,
  cursor: string | null | undefined = query.cursor,
): Promise<MovieCatalogResult> {
  const endpoint = buildCatalogUrl(query, cursor);
  if (!(endpoint instanceof URL)) {
    return failure(endpoint.kind, endpoint.message);
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Movie catalog request failed:", error);
    return failure(
      "network",
      "We couldn't reach the movie service. Please try again shortly.",
    );
  }

  if (!response.ok) {
    console.error("Movie catalog API returned an unsuccessful response:", {
      status: response.status,
      requestId: response.headers.get("x-request-id"),
    });
    return failure(
      "http",
      "We couldn't load the movie catalog. Please try again.",
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    console.error("Movie catalog API returned invalid JSON:", error);
    return failure(
      "invalid-response",
      "The movie service returned an unreadable response. Please try again.",
    );
  }

  if (!isMovieCatalogPage(payload)) {
    console.error("Movie catalog response did not match the expected contract.");
    return failure(
      "invalid-response",
      "The movie service returned incomplete information. Please try again.",
    );
  }

  return { ok: true, data: payload };
}

export async function getMovieCatalog(
  query: MovieCatalogQuery,
): Promise<MovieCatalogResult> {
  return requestCatalog(query);
}

export async function getMovieGenres(): Promise<MovieGenresResult> {
  const endpoint = getApiEndpoint("genres");
  if (!(endpoint instanceof URL)) {
    return { ok: false, error: endpoint };
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Movie genres request failed:", error);
    return {
      ok: false,
      error: {
        kind: "network",
        message: "We couldn't load movie filters. Please try again shortly.",
      },
    };
  }

  if (!response.ok) {
    console.error("Movie genres API returned an unsuccessful response:", {
      status: response.status,
      requestId: response.headers.get("x-request-id"),
    });
    return {
      ok: false,
      error: {
        kind: "http",
        message: "We couldn't load movie filters. Please try again.",
      },
    };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    console.error("Movie genres API returned invalid JSON:", error);
    return {
      ok: false,
      error: {
        kind: "invalid-response",
        message: "The movie service returned unreadable filter data.",
      },
    };
  }

  if (!isMovieGenresResponse(payload)) {
    console.error("Movie genres response did not match the expected contract.");
    return {
      ok: false,
      error: {
        kind: "invalid-response",
        message: "The movie service returned incomplete filter data.",
      },
    };
  }

  return { ok: true, data: payload.items };
}

export async function getMoviePeople(): Promise<MoviePeopleResult> {
  const people: MoviePerson[] = [];
  const personIds = new Set<number>();
  const cursors = new Set<string>();
  let cursor: string | null = null;

  do {
    const endpoint = getApiEndpoint("people");
    if (!(endpoint instanceof URL)) {
      return { ok: false, error: endpoint };
    }
    endpoint.searchParams.set("limit", "100");
    if (cursor) endpoint.searchParams.set("cursor", cursor);

    const result = await requestJson(endpoint, "Movie cast");
    if (!result.ok) return result;
    if (!isMoviePeopleResponse(result.data)) {
      console.error("Movie cast response did not match the expected contract.");
      return {
        ok: false,
        error: {
          kind: "invalid-response",
          message: "The movie service returned incomplete cast data.",
        },
      };
    }

    for (const person of result.data.items) {
      if (
        person.roles.includes("actor") &&
        !personIds.has(person.id)
      ) {
        personIds.add(person.id);
        people.push(person);
      }
    }

    cursor = result.data.nextCursor;
    if (cursor && cursors.has(cursor)) {
      console.error("Movie cast pagination returned a repeated cursor.");
      return {
        ok: false,
        error: {
          kind: "invalid-response",
          message: "The movie service returned an invalid cast page sequence.",
        },
      };
    }
    if (cursor) cursors.add(cursor);
  } while (cursor);

  return { ok: true, data: people };
}

export async function getMovieDetails(
  movieId: number,
): Promise<MovieDetailsResult> {
  const result = await requestJson(`movies/${movieId}`, "Movie details");
  if (!result.ok) {
    if (result.error.status === 404) {
      return {
        ok: false,
        error: {
          kind: "not-found",
          message: "This movie is no longer available.",
        },
      };
    }
    return result;
  }

  if (!isMovieDetailsResponse(result.data) || result.data.id !== movieId) {
    console.error(`Movie ${movieId} response did not match the expected detail contract.`);
    return {
      ok: false,
      error: {
        kind: "invalid-response",
        message: "The movie service returned incomplete movie details.",
      },
    };
  }

  return { ok: true, data: result.data };
}

export async function getSimilarMovies(
  movieId: number,
): Promise<MovieSimilarResult> {
  const result = await requestJson(
    `movies/${movieId}/similar`,
    "Similar movies",
  );
  if (!result.ok) return result;

  if (!isMovieSimilarResponse(result.data)) {
    console.error(`Movie ${movieId} similar response did not match the expected contract.`);
    return {
      ok: false,
      error: {
        kind: "invalid-response",
        message: "The movie service returned incomplete similar-movie information.",
      },
    };
  }

  return { ok: true, data: result.data.items.filter((movie) => movie.id !== movieId) };
}

export async function getMovieShowtimes(
  movieId: number,
): Promise<MovieShowtimesResult> {
  const result = await requestJson(
    `movies/${movieId}/showtimes`,
    "Movie showtimes",
  );
  if (!result.ok) return result;

  if (
    !isMovieShowtimesDetailResponse(result.data) ||
    result.data.movieId !== movieId
  ) {
    console.error(`Movie ${movieId} showtimes did not match the expected contract.`);
    return {
      ok: false,
      error: {
        kind: "invalid-response",
        message: "The movie service returned incomplete showtime information.",
      },
    };
  }

  return { ok: true, data: result.data };
}

async function getAllMovies(
  query: Omit<MovieCatalogQuery, "cursor">,
): Promise<
  | {
      ok: true;
      items: Movie[];
      tabCounts: MovieCatalogPage["tabCounts"];
    }
  | { ok: false; error: MovieCatalogError }
> {
  const items: Movie[] = [];
  const movieIds = new Set<number>();
  const cursors = new Set<string>();
  let cursor: string | null = null;
  let tabCounts: { nowShowing: number; comingSoon: number } | null = null;

  do {
    const result = await requestCatalog(
      { ...query, pageSize: FILTERED_CATALOG_PAGE_SIZE },
      cursor,
    );
    if (!result.ok) return result;

    tabCounts ??= result.data.tabCounts;
    for (const movie of result.data.items) {
      if (movieIds.has(movie.id)) continue;
      movieIds.add(movie.id);
      items.push(movie);
    }

    cursor = result.data.nextCursor;
    if (cursor && cursors.has(cursor)) {
      console.error("Movie catalog pagination returned a repeated cursor.");
      return {
        ok: false,
        error: {
          kind: "invalid-response",
          message: "The movie service returned an invalid page sequence.",
        },
      };
    }
    if (cursor) cursors.add(cursor);
  } while (cursor);

  return {
    ok: true,
    items,
    tabCounts: tabCounts ?? { nowShowing: 0, comingSoon: 0 },
  };
}

function dateAfter(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function matchesShowDate(
  days: { cinemaDate: string; showtimeCount: number }[],
  cinemaDate: string,
  showDate: MovieShowDate,
): boolean {
  if (showDate === "any") return true;

  if (showDate === "today" || showDate === "tomorrow") {
    const targetDate =
      showDate === "today" ? cinemaDate : dateAfter(cinemaDate, 1);
    return days.some(
      (day) => day.cinemaDate === targetDate && day.showtimeCount > 0,
    );
  }

  return days.some((day) => {
    if (day.cinemaDate < cinemaDate || day.showtimeCount === 0) return false;
    const weekday = new Date(`${day.cinemaDate}T00:00:00.000Z`).getUTCDay();
    return weekday === 5 || weekday === 6;
  });
}

async function matchesMovieFilters(
  movie: Movie,
  filters: MovieFilterOptions,
): Promise<{ ok: true; matches: boolean } | { ok: false; error: MovieCatalogError }> {
  let matches = true;

  if (filters.castId !== null) {
    const result = await requestJson(`movies/${movie.id}`, "Movie cast credits");
    if (!result.ok) return result;
    if (!isMovieCreditsResponse(result.data)) {
      console.error(`Movie ${movie.id} credits did not match the expected contract.`);
      return {
        ok: false,
        error: {
          kind: "invalid-response",
          message: "The movie service returned incomplete movie cast data.",
        },
      };
    }
    matches =
      matches &&
      result.data.credits.some(
        (credit) =>
          credit.role === "actor" && credit.person.id === filters.castId,
      );
  }

  if (matches && filters.showDate !== "any") {
    const result = await requestJson(
      `movies/${movie.id}/showtimes`,
      "Movie showtimes",
    );
    if (!result.ok) return result;
    if (!isMovieShowtimesResponse(result.data)) {
      console.error(`Movie ${movie.id} showtimes did not match the expected contract.`);
      return {
        ok: false,
        error: {
          kind: "invalid-response",
          message: "The movie service returned incomplete showtime data.",
        },
      };
    }
    matches =
      matches &&
      matchesShowDate(
        result.data.days,
        result.data.cinemaDate,
        filters.showDate,
      );
  }

  return { ok: true, matches };
}

export async function getMovieCatalogWithFilters(
  query: Omit<MovieCatalogQuery, "cursor">,
  filters: MovieFilterOptions,
  cursor: string | null = null,
): Promise<MovieCatalogResult> {
  if (filters.showDate === "any" && filters.castId === null) {
    return requestCatalog(query, cursor);
  }

  let offset = 0;
  if (cursor) {
    const match = new RegExp(`^${FILTER_CURSOR_PREFIX}(\\d+)$`).exec(cursor);
    if (!match) {
      return failure("invalid-response", "The movie page cursor is invalid.");
    }
    offset = Number(match[1]);
    if (!Number.isSafeInteger(offset)) {
      return failure("invalid-response", "The movie page cursor is invalid.");
    }
  }

  const catalogResult = await getAllMovies(query);
  if (!catalogResult.ok) {
    return failure(catalogResult.error.kind, catalogResult.error.message);
  }

  const matchingMovies: Movie[] = [];
  const concurrency = 5;
  for (let start = 0; start < catalogResult.items.length; start += concurrency) {
    const batch = catalogResult.items.slice(start, start + concurrency);
    const results = await Promise.all(
      batch.map((movie) => matchesMovieFilters(movie, filters)),
    );
    const failed = results.find((result) => !result.ok);
    if (failed && !failed.ok) {
      return failure(failed.error.kind, failed.error.message);
    }
    results.forEach((result, index) => {
      if (result.ok && result.matches) matchingMovies.push(batch[index]);
    });
  }

  const pageSize = query.pageSize ?? DEFAULT_CATALOG_PAGE_SIZE;
  const items = matchingMovies.slice(offset, offset + pageSize);
  const nextOffset = offset + items.length;

  return {
    ok: true,
    data: {
      items,
      total: matchingMovies.length,
      nextCursor:
        nextOffset < matchingMovies.length
          ? `${FILTER_CURSOR_PREFIX}${nextOffset}`
          : null,
      tabCounts: catalogResult.tabCounts,
    },
  };
}

export function getCatalogErrorStatus(error: MovieCatalogError): number {
  return error.kind === "http" ? 502 : 500;
}
