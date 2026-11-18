import type { Genre, ImageAsset, Movie } from "@/lib/home/types";

export type MovieCatalogQuery = {
  status: Movie["status"];
  query: string;
  genres: string[];
  cursor?: string | null;
  pageSize?: number;
};

export type MovieCatalogPage = {
  items: Movie[];
  nextCursor: string | null;
  total: number;
  tabCounts: {
    nowShowing: number;
    comingSoon: number;
  };
};

export type MovieCatalogError = {
  kind: "configuration" | "network" | "http" | "invalid-response";
  message: string;
};

export type MovieCatalogResult =
  | { ok: true; data: MovieCatalogPage }
  | { ok: false; error: MovieCatalogError };

export type MovieGenresResult =
  | { ok: true; data: Genre[] }
  | { ok: false; error: MovieCatalogError };

export type MoviePerson = {
  id: number;
  fullName: string;
  photo: ImageAsset | null;
  roles: string[];
};

export type MoviePeopleResult =
  | { ok: true; data: MoviePerson[] }
  | { ok: false; error: MovieCatalogError };

export type MovieShowDate = "any" | "today" | "tomorrow" | "weekend";

export type MovieCredit = {
  id: number;
  role: string;
  characterName: string | null;
  position: number;
  person: {
    id: number;
    fullName: string;
    photo: ImageAsset | null;
  };
};

export type MovieVideo = {
  id: number;
  youtubeId: string;
  title: string;
  kind: string;
  durationSeconds: number | null;
  embedUrl: string;
  thumbnailUrl: string;
};

export type MoviePhoto = {
  id: number;
  kind: string;
  caption: string | null;
  image: ImageAsset;
};

export type MovieShowtimeSummary = {
  fromPrice?: MoviePrice | null;
  nextShowToday: {
    id: number;
    startsAt: string;
    cinemaDate: string;
    theater: {
      id: number;
      name: string;
      district: string;
      city: string;
    };
    fromPrice?: MoviePrice | null;
    hall: {
      id: number;
      name: string;
    };
  } | null;
  cinemaCount: number;
};

export type MoviePrice = {
  amount: number;
  currency: string;
};

export type MovieSimilarResult =
  | { ok: true; data: Movie[] }
  | { ok: false; error: MovieCatalogError };

export type MovieDetails = Movie & {
  synopsis: string;
  language: string | null;
  country: string | null;
  productionCompany: string | null;
  filmingLocations: string | null;
  backdrop: ImageAsset | null;
  heroVideo: MovieVideo | null;
  videos: MovieVideo[];
  photos: MoviePhoto[];
  credits: MovieCredit[];
  showtimeSummary: MovieShowtimeSummary | null;
};

export type MovieDetailsError = MovieCatalogError | {
  kind: "not-found";
  message: string;
};

export type MovieDetailsResult =
  | { ok: true; data: MovieDetails }
  | { ok: false; error: MovieDetailsError };

export type MovieShowtime = {
  id: number;
  startsAt: string;
  endsAt: string;
  cinemaDate: string;
  prices: {
    front: MoviePrice;
    middle: MoviePrice;
    back: MoviePrice;
  };
  fromPrice: MoviePrice;
  hall: {
    id: number;
    name: string;
  };
  hasStarted: boolean;
};

export type MovieShowtimeTheater = {
  id: number;
  name: string;
  district: string;
  city: string;
};

export type MovieShowtimesDay = {
  cinemaDate: string;
  showtimeCount: number;
  theaters: {
    theater: MovieShowtimeTheater;
    showtimes: MovieShowtime[];
  }[];
};

export type MovieShowtimes = {
  movieId: number;
  cinemaDate: string;
  theaters: (MovieShowtimeTheater & { showtimeCount: number })[];
  days: MovieShowtimesDay[];
};

export type MovieShowtimesResult =
  | { ok: true; data: MovieShowtimes }
  | { ok: false; error: MovieCatalogError };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isDateTime(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function isGenre(value: unknown): value is Genre {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    typeof value.name === "string" &&
    typeof value.slug === "string"
  );
}

function isImageAsset(
  value: unknown,
): value is ImageAsset | null | undefined {
  if (value === undefined || value === null) return true;
  if (!isRecord(value)) return false;
  if (value.alt !== null && typeof value.alt !== "string") return false;
  if (!Array.isArray(value.variants)) return false;

  return value.variants.every(
    (variant) =>
      isRecord(variant) &&
      typeof variant.name === "string" &&
      typeof variant.url === "string" &&
      isPositiveInteger(variant.width) &&
      isPositiveInteger(variant.height),
  );
}

function isMoviePerson(value: unknown): value is MoviePerson {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    typeof value.fullName === "string" &&
    value.photo !== undefined &&
    isImageAsset(value.photo) &&
    Array.isArray(value.roles) &&
    value.roles.every((role) => typeof role === "string")
  );
}

function isMovie(value: unknown): value is Movie {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    typeof value.title === "string" &&
    Array.isArray(value.genres) &&
    value.genres.every(isGenre) &&
    isPositiveInteger(value.runtimeMinutes) &&
    typeof value.ageRating === "string" &&
    isDateOnly(value.releaseDate) &&
    (value.status === "now_showing" || value.status === "coming_soon") &&
    isImageAsset(value.poster)
  );
}

export function isMovieCatalogPage(value: unknown): value is MovieCatalogPage {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isMovie) &&
    (typeof value.nextCursor === "string" || value.nextCursor === null) &&
    isNonNegativeInteger(value.total) &&
    isRecord(value.tabCounts) &&
    isNonNegativeInteger(value.tabCounts.nowShowing) &&
    isNonNegativeInteger(value.tabCounts.comingSoon)
  );
}

export function isMovieGenresResponse(
  value: unknown,
): value is { items: Genre[] } {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isGenre)
  );
}

export function isMoviePeopleResponse(
  value: unknown,
): value is { items: MoviePerson[]; nextCursor: string | null } {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isMoviePerson) &&
    (typeof value.nextCursor === "string" || value.nextCursor === null)
  );
}

export function isMovieCreditsResponse(
  value: unknown,
): value is {
  credits: { role: string; person: { id: number; fullName: string } }[];
} {
  return (
    isRecord(value) &&
    Array.isArray(value.credits) &&
    value.credits.every(
      (credit) =>
        isRecord(credit) &&
        typeof credit.role === "string" &&
        isRecord(credit.person) &&
        isPositiveInteger(credit.person.id) &&
        typeof credit.person.fullName === "string",
    )
  );
}

export function isMovieShowtimesResponse(
  value: unknown,
): value is {
  cinemaDate: string;
  days: { cinemaDate: string; showtimeCount: number }[];
} {
  return (
    isRecord(value) &&
    isDateOnly(value.cinemaDate) &&
    Array.isArray(value.days) &&
    value.days.every(
      (day) =>
        isRecord(day) &&
        isDateOnly(day.cinemaDate) &&
        isNonNegativeInteger(day.showtimeCount),
    )
  );
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isMoviePrice(value: unknown): value is MoviePrice {
  return (
    isRecord(value) &&
    isNonNegativeInteger(value.amount) &&
    typeof value.currency === "string" &&
    /^[A-Z]{3}$/.test(value.currency)
  );
}

function isMovieVideo(value: unknown): value is MovieVideo {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    typeof value.youtubeId === "string" &&
    /^[A-Za-z0-9_-]{11}$/.test(value.youtubeId) &&
    typeof value.title === "string" &&
    typeof value.kind === "string" &&
    (value.durationSeconds === null ||
      isNonNegativeInteger(value.durationSeconds)) &&
    typeof value.embedUrl === "string" &&
    typeof value.thumbnailUrl === "string"
  );
}

function isMoviePhoto(value: unknown): value is MoviePhoto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    typeof value.kind === "string" &&
    isNullableString(value.caption) &&
    value.image !== null &&
    value.image !== undefined &&
    isImageAsset(value.image)
  );
}

function isMovieCredit(value: unknown): value is MovieCredit {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    typeof value.role === "string" &&
    isNullableString(value.characterName) &&
    isNonNegativeInteger(value.position) &&
    isRecord(value.person) &&
    isPositiveInteger(value.person.id) &&
    typeof value.person.fullName === "string" &&
    value.person.photo !== undefined &&
    isImageAsset(value.person.photo)
  );
}

function isMovieTheater(value: unknown): value is MovieShowtimeTheater {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    typeof value.name === "string" &&
    typeof value.district === "string" &&
    typeof value.city === "string"
  );
}

function isMovieShowtimeTheaterSummary(
  value: unknown,
): value is MovieShowtimeTheater & { showtimeCount: number } {
  if (!isRecord(value)) return false;

  const showtimeCount = value["showtimeCount"];
  return (
    isMovieTheater(value) &&
    isNonNegativeInteger(showtimeCount)
  );
}

export function isMovieDetailsResponse(value: unknown): value is MovieDetails {
  if (
    !isRecord(value)
  ) {
    return false;
  }

  const details = value;
  if (
    !isMovie(value) ||
    typeof details.synopsis !== "string" ||
    !isNullableString(details.language) ||
    !isNullableString(details.country) ||
    !isNullableString(details.productionCompany) ||
    !isNullableString(details.filmingLocations) ||
    !("backdrop" in details) ||
    !isImageAsset(details.backdrop) ||
    !(details.heroVideo === null || isMovieVideo(details.heroVideo)) ||
    !Array.isArray(details.videos) ||
    !details.videos.every(isMovieVideo) ||
    !Array.isArray(details.photos) ||
    !details.photos.every(isMoviePhoto) ||
    !Array.isArray(details.credits) ||
    !details.credits.every(isMovieCredit)
  ) {
    return false;
  }

  const summary = details.showtimeSummary;
  if (summary === null) return true;
  if (
    !isRecord(summary) ||
    !isNonNegativeInteger(summary.cinemaCount) ||
    !("nextShowToday" in summary) ||
    (summary.fromPrice !== undefined &&
      summary.fromPrice !== null &&
      !isMoviePrice(summary.fromPrice))
  ) {
    return false;
  }

  const nextShow = summary.nextShowToday;
  if (nextShow === null) return true;
  return (
    isRecord(nextShow) &&
    isPositiveInteger(nextShow.id) &&
    isDateTime(nextShow.startsAt) &&
    isDateOnly(nextShow.cinemaDate) &&
    isMovieTheater(nextShow.theater) &&
    (nextShow.fromPrice === undefined ||
      nextShow.fromPrice === null ||
      isMoviePrice(nextShow.fromPrice)) &&
    isRecord(nextShow.hall) &&
    isPositiveInteger(nextShow.hall.id) &&
    typeof nextShow.hall.name === "string"
  );
}

export function isMovieSimilarResponse(
  value: unknown,
): value is { items: Movie[] } {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isMovie);
}

function isMovieShowtime(value: unknown): value is MovieShowtime {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    isDateTime(value.startsAt) &&
    isDateTime(value.endsAt) &&
    isDateOnly(value.cinemaDate) &&
    isRecord(value.prices) &&
    isMoviePrice(value.prices.front) &&
    isMoviePrice(value.prices.middle) &&
    isMoviePrice(value.prices.back) &&
    isMoviePrice(value.fromPrice) &&
    isRecord(value.hall) &&
    isPositiveInteger(value.hall.id) &&
    typeof value.hall.name === "string" &&
    typeof value.hasStarted === "boolean"
  );
}

export function isMovieShowtimesDetailResponse(
  value: unknown,
): value is MovieShowtimes {
  return (
    isRecord(value) &&
    isPositiveInteger(value.movieId) &&
    isDateOnly(value.cinemaDate) &&
    Array.isArray(value.theaters) &&
    value.theaters.every(isMovieShowtimeTheaterSummary) &&
    Array.isArray(value.days) &&
    value.days.every(
      (day) =>
        isRecord(day) &&
        isDateOnly(day.cinemaDate) &&
        isNonNegativeInteger(day.showtimeCount) &&
        Array.isArray(day.theaters) &&
        day.theaters.every(
          (entry) =>
            isRecord(entry) &&
            isMovieTheater(entry.theater) &&
            Array.isArray(entry.showtimes) &&
            entry.showtimes.every(isMovieShowtime),
        ),
    )
  );
}
