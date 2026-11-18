export type ImageVariant = {
  name: string;
  url: string;
  width: number;
  height: number;
};

export type ImageAsset = {
  alt: string | null;
  variants: ImageVariant[];
};

export type Genre = {
  id: number;
  name: string;
  slug: string;
};

export type MovieStatus = "now_showing" | "coming_soon";

export type Movie = {
  id: number;
  title: string;
  genres: Genre[];
  runtimeMinutes: number;
  ageRating: string;
  releaseDate: string;
  status: MovieStatus;
  poster?: ImageAsset | null;
};

export type FeaturedMovie = {
  position: number;
  movie: Movie & { synopsis: string };
  heroVideo?: {
    youtubeId: string;
    title: string;
    embedUrl: string;
  } | null;
  backdrop?: ImageAsset | null;
};

export type TickerItem = {
  movie: Pick<Movie, "id" | "title">;
  nextShowtime: {
    id: number;
    startsAt: string;
    cinemaDate: string;
    theater: {
      id: number;
      name: string;
    };
  };
};

export type MovieList = {
  items: Movie[];
  total: number;
};

export type Cinema = {
  id: number;
  name: string;
  district: string;
  city: string;
  address: string;
  cover?: ImageAsset | null;
  openState: {
    isOpen: boolean;
    closesAt: string | null;
    nextOpensAt: string | null;
  };
  mainPhone?: {
    label: string;
    number: string;
  } | null;
  hallCount: number;
  facilities?: string[];
};

export type HomeData = {
  serverTime: string;
  cinemaDate: string;
  featured: FeaturedMovie[];
  ticker: TickerItem[];
  genres: (Genre & { movieCount: number })[];
  nowShowing: MovieList;
  comingSoon: MovieList;
  cinemas: Cinema[];
};

export type HomeLoadError = {
  kind: "configuration" | "network" | "http" | "invalid-response";
  message: string;
};

export type HomeDataResult =
  | { ok: true; data: HomeData }
  | { ok: false; error: HomeLoadError };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value > 0;
}

function isDateTime(value: unknown): value is string {
  return (
    isString(value) &&
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function isNullableDateTime(value: unknown): value is string | null {
  return value === null || isDateTime(value);
}

function isDateOnly(value: unknown): value is string {
  if (!isString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isGenre(value: unknown): value is Genre {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    isString(value.name) &&
    isString(value.slug)
  );
}

function isGenreWithCount(
  value: unknown,
): value is Genre & { movieCount: number } {
  if (!isRecord(value)) return false;

  const movieCount = value["movieCount"];
  return isNonNegativeInteger(movieCount) && isGenre(value);
}

function isImageAsset(
  value: unknown,
): value is ImageAsset | null | undefined {
  if (value === undefined) return true;
  if (value === null) return true;
  if (!isRecord(value) || !isNullableString(value.alt)) return false;
  if (!Array.isArray(value.variants)) return false;

  return value.variants.every(
    (variant) =>
      isRecord(variant) &&
      isString(variant.name) &&
      isString(variant.url) &&
      isPositiveInteger(variant.width) &&
      isPositiveInteger(variant.height),
  );
}

function isMovie(value: unknown): value is Movie {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    isString(value.title) &&
    Array.isArray(value.genres) &&
    value.genres.every(isGenre) &&
    isPositiveInteger(value.runtimeMinutes) &&
    isString(value.ageRating) &&
    isDateOnly(value.releaseDate) &&
    (value.status === "now_showing" || value.status === "coming_soon") &&
    isImageAsset(value.poster)
  );
}

function isFeaturedMovie(value: unknown): value is FeaturedMovie {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.position) ||
    value.position > 5
  ) {
    return false;
  }
  if (!isRecord(value.movie) || !isMovie({ ...value.movie, poster: null })) {
    return false;
  }
  if (!isString(value.movie.synopsis)) return false;
  if (!isImageAsset(value.backdrop)) return false;

  if (value.heroVideo === undefined || value.heroVideo === null) return true;
  return (
    isRecord(value.heroVideo) &&
    isString(value.heroVideo.youtubeId) &&
    /^[A-Za-z0-9_-]{11}$/.test(value.heroVideo.youtubeId) &&
    isString(value.heroVideo.title) &&
    isString(value.heroVideo.embedUrl)
  );
}

function isTickerItem(value: unknown): value is TickerItem {
  return (
    isRecord(value) &&
    isRecord(value.movie) &&
    isPositiveInteger(value.movie.id) &&
    isString(value.movie.title) &&
    isRecord(value.nextShowtime) &&
    isPositiveInteger(value.nextShowtime.id) &&
    isDateTime(value.nextShowtime.startsAt) &&
    isString(value.nextShowtime.cinemaDate) &&
    isRecord(value.nextShowtime.theater) &&
    isPositiveInteger(value.nextShowtime.theater.id) &&
    isString(value.nextShowtime.theater.name)
  );
}

function isMovieList(value: unknown): value is MovieList {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isMovie) &&
    isNonNegativeInteger(value.total)
  );
}

function isCinema(value: unknown): value is Cinema {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    isString(value.name) &&
    isString(value.district) &&
    isString(value.city) &&
    isString(value.address) &&
    isImageAsset(value.cover) &&
    isRecord(value.openState) &&
    typeof value.openState.isOpen === "boolean" &&
    isNullableDateTime(value.openState.closesAt) &&
    isNullableDateTime(value.openState.nextOpensAt) &&
    (value.mainPhone === undefined ||
      value.mainPhone === null ||
      (isRecord(value.mainPhone) &&
        isString(value.mainPhone.label) &&
        isString(value.mainPhone.number))) &&
    isNonNegativeInteger(value.hallCount) &&
    (value.facilities === undefined ||
      (Array.isArray(value.facilities) && value.facilities.every(isString)))
  );
}

export function isHomeData(value: unknown): value is HomeData {
  return (
    isRecord(value) &&
    isDateTime(value.serverTime) &&
    isDateOnly(value.cinemaDate) &&
    Array.isArray(value.featured) &&
    value.featured.length <= 5 &&
    value.featured.every(isFeaturedMovie) &&
    new Set(value.featured.map((item) => item.position)).size ===
      value.featured.length &&
    Array.isArray(value.ticker) &&
    value.ticker.every(isTickerItem) &&
    Array.isArray(value.genres) &&
    value.genres.every(isGenreWithCount) &&
    isMovieList(value.nowShowing) &&
    isMovieList(value.comingSoon) &&
    Array.isArray(value.cinemas) &&
    value.cinemas.every(isCinema)
  );
}
