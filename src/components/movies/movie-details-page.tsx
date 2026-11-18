"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  CreditCard,
  Images,
  MapPin,
  Play,
  Ticket,
} from "lucide-react";
import { MediaImage } from "@/components/home/media-image";
import { ErrorState } from "@/components/ui";
import { MovieCard } from "@/components/movies/movie-card";
import type { ImageAsset, Movie } from "@/lib/home/types";
import type {
  MovieCredit,
  MovieDetails,
  MoviePhoto,
  MoviePrice,
  MovieShowtimes,
  MovieVideo,
} from "@/lib/movies/types";

type GalleryItem = {
  key: string;
  label: string;
  image: ImageAsset | null;
  video: MovieVideo | null;
  photo: MoviePhoto | null;
};

type MovieDetailsPageProps = {
  movie: MovieDetails;
  showtimes: MovieShowtimes | null;
  showtimesError: string | null;
  similarMovies: Movie[];
};

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function formatLocalTime(value: string) {
  const time = /T(\d{2}:\d{2})/.exec(value)?.[1];
  return time ?? "Time unavailable";
}

function runtimeLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${remainingMinutes}m`;
}

function formatMoviePrice(price: MoviePrice) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price.amount / 100);
}

function showtimeUnavailable(showtime: {
  startsAt: string;
  hasStarted: boolean;
}) {
  return showtime.hasStarted || Date.parse(showtime.startsAt) <= Date.now();
}

function videoThumbnailUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "i.ytimg.com"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

function movieGalleryItems(movie: MovieDetails): GalleryItem[] {
  const items: GalleryItem[] = [];
  const videos = movie.heroVideo
    ? [movie.heroVideo, ...movie.videos.filter((video) => video.id !== movie.heroVideo?.id)]
    : movie.videos;
  for (const video of videos) {
    items.push({
      key: `video-${video.id}`,
      label: video.title,
      image: movie.backdrop,
      video,
      photo: null,
    });
  }

  for (const photo of movie.photos) {
    items.push({
      key: `photo-${photo.id}`,
      label: photo.caption || photo.image.alt || `${movie.title} photo`,
      image: photo.image,
      video: null,
      photo,
    });
  }

  if (items.length === 0 && movie.backdrop) {
    items.push({
      key: "backdrop",
      label: movie.backdrop.alt || `${movie.title} still`,
      image: movie.backdrop,
      video: null,
      photo: null,
    });
  }

  return items;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function CreditRows({ credits }: { credits: MovieCredit[] }) {
  const directors = credits.filter((credit) => credit.role === "director");
  const writers = credits.filter((credit) => credit.role === "writer");
  const producers = credits.filter((credit) => credit.role === "producer");
  const stars = credits
    .filter((credit) => credit.role === "actor")
    .slice(0, 3);
  const rows = [
    { label: "Director", credits: directors },
    { label: "Writers", credits: writers },
    { label: "Producer", credits: producers },
    { label: "Stars", credits: stars },
  ].filter((row) => row.credits.length > 0);

  if (rows.length === 0) return null;

  return (
    <dl className="divide-y divide-white/15 border-y border-white/15">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[6.25rem_minmax(0,1fr)] gap-2 py-4 text-sm sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-14"
        >
          <dt className="font-semibold text-white">
            {row.label}
          </dt>
          <dd className="flex min-w-0 flex-wrap gap-x-5 gap-y-2 text-primary">
            {row.credits.map((credit) => (
              <span key={credit.id}>{credit.person.fullName}</span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type GalleryFilter = "all" | "videos" | "photos";

function MovieGalleryLightbox({
  items,
  initialKey,
  movieTitle,
  onClose,
}: {
  items: GalleryItem[];
  initialKey: string;
  movieTitle: string;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [selectedKey, setSelectedKey] = useState(initialKey);
  const filteredItems = items.filter((item) => {
    if (filter === "videos") return item.video !== null;
    if (filter === "photos") return item.photo !== null;
    return true;
  });
  const selectedIndex = Math.max(
    0,
    filteredItems.findIndex((item) => item.key === selectedKey),
  );
  const selectedItem = filteredItems[selectedIndex] ?? filteredItems[0] ?? null;

  function move(direction: -1 | 1) {
    if (filteredItems.length < 2) return;
    const nextIndex =
      (selectedIndex + direction + filteredItems.length) % filteredItems.length;
    setSelectedKey(filteredItems[nextIndex].key);
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  function selectFilter(nextFilter: GalleryFilter) {
    setFilter(nextFilter);
    const nextItems = items.filter((item) => {
      if (nextFilter === "videos") return item.video !== null;
      if (nextFilter === "photos") return item.photo !== null;
      return true;
    });
    if (!nextItems.some((item) => item.key === selectedKey)) {
      setSelectedKey(nextItems[0]?.key ?? "");
    }
  }

  if (!selectedItem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${movieTitle} media gallery`}
      className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
        <p className="font-mono text-sm font-bold">
          {selectedIndex + 1} / {filteredItems.length}
        </p>
        <div className="flex items-center gap-1">
          {(
            [
              ["all", "All", items.length],
              ["videos", "Videos", items.filter((item) => item.video).length],
              ["photos", "Photos", items.filter((item) => item.photo).length],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              onClick={() => selectFilter(value)}
              className={`border px-3 py-2 text-xs font-semibold transition ${
                filter === value
                  ? "border-white bg-white text-black"
                  : "border-white/20 text-white/70 hover:border-white/50 hover:text-white"
              }`}
            >
              {label} {count}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close media gallery"
          className="flex size-10 items-center justify-center border border-white/20 text-2xl text-white/80 transition hover:border-white/60 hover:text-white"
        >
          ×
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-16 py-6 sm:px-24">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Previous media"
          className="absolute left-4 z-10 flex size-12 items-center justify-center border border-white/20 text-3xl text-white/80 transition hover:border-white/60 hover:text-white sm:left-8"
        >
          ‹
        </button>
        <div className="flex size-full max-h-full max-w-[1100px] items-center justify-center overflow-hidden bg-black">
          {selectedItem.video ? (
            <iframe
              key={selectedItem.video.id}
              src={`https://www.youtube-nocookie.com/embed/${selectedItem.video.youtubeId}?autoplay=1`}
              title={selectedItem.video.title}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <div className="relative aspect-video w-full">
              <MediaImage
                image={selectedItem.photo?.image ?? selectedItem.image}
                alt={selectedItem.label}
                className="size-full"
                preferredVariant="large"
                fit="contain"
              />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Next media"
          className="absolute right-4 z-10 flex size-12 items-center justify-center border border-white/20 text-3xl text-white/80 transition hover:border-white/60 hover:text-white sm:right-8"
        >
          ›
        </button>
      </div>

      <div className="border-t border-white/10 px-5 pb-5 pt-3 sm:px-8">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {selectedItem.video ? "Video" : "Still"}
            </p>
            <p className="truncate text-sm font-semibold">{selectedItem.label}</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filteredItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedKey(item.key)}
              aria-label={`Show ${item.label}`}
              className={`relative size-16 shrink-0 overflow-hidden border-2 sm:size-20 ${
                item.key === selectedItem.key
                  ? "border-primary"
                  : "border-transparent"
              }`}
            >
              {item.video && videoThumbnailUrl(item.video.thumbnailUrl) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={videoThumbnailUrl(item.video.thumbnailUrl) ?? undefined}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <MediaImage
                  image={item.photo?.image ?? item.image}
                  alt=""
                  decorative
                  className="size-full"
                  preferredVariant="small"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShowtimesSection({
  showtimes,
  error,
  onRetry,
}: {
  showtimes: MovieShowtimes | null;
  error: string | null;
  onRetry: () => void;
}) {
  const router = useRouter();
  const initialDay =
    showtimes?.days.find((day) => day.cinemaDate === showtimes.cinemaDate) ??
    showtimes?.days.find((day) => day.showtimeCount > 0) ??
    null;
  const [selectedDate, setSelectedDate] = useState(
    initialDay?.cinemaDate ?? null,
  );
  const [selectedTheaterId, setSelectedTheaterId] = useState(
    initialDay?.theaters.find((item) => item.showtimes.length > 0)?.theater.id ??
      null,
  );
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(
    null,
  );

  const activeDay =
    showtimes?.days.find((day) => day.cinemaDate === selectedDate) ?? null;
  const availableTheaters =
    activeDay?.theaters.filter((item) => item.showtimes.length > 0) ?? [];
  const activeTheater =
    availableTheaters.find(
      (item) => item.theater.id === selectedTheaterId,
    ) ?? availableTheaters[0] ?? null;
  const selectedShowtime =
    activeTheater?.showtimes.find(
      (showtime) =>
        showtime.id === selectedShowtimeId && !showtimeUnavailable(showtime),
    ) ?? null;

  function chooseDate(date: string) {
    const nextDay = showtimes?.days.find((day) => day.cinemaDate === date);
    setSelectedDate(date);
    setSelectedShowtimeId(null);
    setSelectedTheaterId(
      nextDay?.theaters.find((item) => item.showtimes.length > 0)?.theater.id ??
        null,
    );
  }

  function chooseTheater(theaterId: number) {
    setSelectedTheaterId(theaterId);
    setSelectedShowtimeId(null);
  }

  return (
    <section
      id="showtimes"
      tabIndex={-1}
      aria-labelledby="showtimes-heading"
      className="scroll-mt-8 rounded-sm border border-white/10 bg-[#11100f] p-4 outline-none sm:p-6 lg:p-8"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Find your screening
          </p>
          <h2
            id="showtimes-heading"
            className="font-cinema-display text-4xl uppercase leading-none tracking-wide text-white sm:text-5xl"
          >
            Showtimes
          </h2>
        </div>
        <p className="text-xs text-white/50">Times are shown in local cinema time</p>
      </div>

      {error ? (
        <ErrorState
          title="Showtimes are unavailable"
          message={error}
          action={
            <button
              type="button"
              onClick={onRetry}
              className="rounded-sm bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-accent"
            >
              Try again
            </button>
          }
        />
      ) : !showtimes || showtimes.days.every((day) => day.showtimeCount === 0) ? (
        <p className="border border-white/10 bg-black/20 p-5 text-sm text-white/65">
          There are no upcoming showtimes for this movie.
        </p>
      ) : (
        <>
          <div
            aria-label="Choose a date"
            className="mb-5 grid grid-cols-4 gap-2 overflow-x-auto pb-2 sm:grid-cols-7"
          >
            {showtimes.days.map((day) => {
              const active = day.cinemaDate === selectedDate;
              return (
                <button
                  key={day.cinemaDate}
                  type="button"
                  disabled={day.showtimeCount === 0}
                  aria-pressed={active}
                  onClick={() => chooseDate(day.cinemaDate)}
                  className={`min-w-0 border px-2 py-3 text-center transition disabled:cursor-not-allowed disabled:opacity-35 ${
                    active
                      ? "border-primary bg-primary/10 text-white"
                      : "border-white/10 bg-black/20 text-white/70 hover:border-white/35"
                  }`}
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-wider">
                    {formatDate(day.cinemaDate, { weekday: "short" })}
                  </span>
                  <span className="my-1 block font-cinema-display text-2xl leading-none">
                    {formatDate(day.cinemaDate, { day: "2-digit" })}
                  </span>
                  <span className="block text-[10px] text-white/45">
                    {day.showtimeCount} {day.showtimeCount === 1 ? "show" : "shows"}
                  </span>
                </button>
              );
            })}
          </div>

          {availableTheaters.length === 0 ? (
            <p className="border border-white/10 bg-black/20 p-5 text-sm text-white/65">
              No showtimes are listed for this date. Choose another date.
            </p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(12rem,0.65fr)_minmax(0,1.8fr)]">
              <div
                role="group"
                aria-label="Choose a cinema"
                className="space-y-2"
              >
                {availableTheaters.map(({ theater, showtimes: theaterShows }) => {
                  const active = theater.id === activeTheater?.theater.id;
                  return (
                    <button
                      key={theater.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => chooseTheater(theater.id)}
                      className={`block w-full border-l-2 px-4 py-3 text-left transition ${
                        active
                          ? "border-primary bg-white/[0.06] text-white"
                          : "border-transparent text-white/65 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span className="block font-cinema-display text-xl uppercase tracking-wide">
                        {theater.name}
                      </span>
                      <span className="mt-1 block text-xs text-white/45">
                        {theater.district}, {theater.city} · {theaterShows.length}{" "}
                        {theaterShows.length === 1 ? "showtime" : "showtimes"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2 text-xs text-white/50">
                  <MapPin aria-hidden="true" className="size-3.5 text-primary" />
                  <span>
                    {activeTheater?.theater.name}
                    {activeTheater
                      ? ` · ${activeTheater.theater.district}, ${activeTheater.theater.city}`
                      : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  {activeTheater?.showtimes.map((showtime) => {
                    const selected = showtime.id === selectedShowtimeId;
                    return (
                      <button
                        key={showtime.id}
                        type="button"
                        disabled={showtimeUnavailable(showtime)}
                        aria-pressed={selected}
                        onClick={() => setSelectedShowtimeId(showtime.id)}
                        className={`min-h-20 border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-white/15 bg-black/20 hover:border-white/45"
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-cinema-display text-2xl leading-none text-white">
                            {formatLocalTime(showtime.startsAt)}
                          </span>
                          <span className="text-[10px] text-white/45">
                            Ends {formatLocalTime(showtime.endsAt)}
                          </span>
                        </div>
                        <span className="mt-2 block text-[11px] text-white/50">
                          {showtime.hall.name}
                        </span>
                        <span className="mt-2 block text-[10px] font-semibold text-primary">
                          From {formatMoviePrice(showtime.fromPrice)}
                        </span>
                        <dl className="mt-2 space-y-1 border-t border-white/10 pt-2 text-[10px] text-white/55">
                          {(
                            [
                              ["Front", showtime.prices.front],
                              ["Middle", showtime.prices.middle],
                              ["Back", showtime.prices.back],
                            ] as const
                          ).map(([zone, price]) => (
                            <div
                              key={zone}
                              className="flex justify-between gap-2"
                            >
                              <dt>{zone}</dt>
                              <dd className="text-right text-white/75">
                                {formatMoviePrice(price)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                        {showtimeUnavailable(showtime) ? (
                          <span className="mt-1 block text-[10px] uppercase tracking-wider text-white/45">
                            Started
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-white/45">
                  {activeTheater?.showtimes.length
                    ? "Showtime and seat availability are confirmed again before booking."
                    : "No showtimes are listed for this cinema on the selected date."}
                </p>
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/55" aria-live="polite">
              {selectedShowtime
                ? `${activeTheater?.theater.name} · ${formatLocalTime(selectedShowtime.startsAt)} · ${selectedShowtime.hall.name}`
                : "Choose a showtime to continue."}
            </p>
            {selectedShowtime ? (
              <button
                type="button"
                onClick={() => {
                  if (showtimeUnavailable(selectedShowtime)) {
                    setSelectedShowtimeId(null);
                    return;
                  }
                  router.push(`/showtimes/${selectedShowtime.id}/seats`);
                }}
                className="inline-flex min-h-12 items-center justify-center gap-3 bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.13em] text-primary-foreground transition hover:bg-accent"
              >
                Choose seats
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-3 bg-white/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.13em] text-white/40"
              >
                Choose seats
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>
          <p className="sr-only" aria-live="polite">
            {selectedShowtime
              ? `Selected ${formatLocalTime(selectedShowtime.startsAt)} at ${activeTheater?.theater.name}.`
              : "No showtime selected."}
          </p>
        </>
      )}
    </section>
  );
}

export function MovieDetailsPage({
  movie,
  showtimes,
  showtimesError,
  similarMovies,
}: MovieDetailsPageProps) {
  const router = useRouter();
  const movieDate = formatDate(movie.releaseDate, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const galleryItems = useMemo(() => movieGalleryItems(movie), [movie]);
  const [selectedGalleryKey, setSelectedGalleryKey] = useState(
    movie.heroVideo
      ? `video-${movie.heroVideo.id}`
      : galleryItems[0]?.key ?? "",
  );
  const [playingGalleryVideoId, setPlayingGalleryVideoId] = useState<number | null>(
    null,
  );
  const [lightboxKey, setLightboxKey] = useState<string | null>(null);
  const activeGalleryIndex = Math.max(
    0,
    galleryItems.findIndex((item) => item.key === selectedGalleryKey),
  );
  const activeGalleryItem = galleryItems[activeGalleryIndex] ?? null;
  const activeGalleryVideo = activeGalleryItem?.video ?? null;
  const activeCredits = [...movie.credits].sort(
    (first, second) => first.position - second.position,
  );
  const actors = activeCredits.filter((credit) => credit.role === "actor");
  const groupedCredits = activeCredits.filter(
    (credit) => credit.role !== "actor",
  );
  const nextShow = movie.showtimeSummary?.nextShowToday ?? null;
  const heroVideo = movie.heroVideo ?? movie.videos[0] ?? null;
  const fromPrice =
    movie.showtimeSummary?.fromPrice ??
    movie.showtimeSummary?.nextShowToday?.fromPrice ??
    null;

  function moveGallery(direction: -1 | 1) {
    if (galleryItems.length < 2) return;
    const nextIndex =
      (activeGalleryIndex + direction + galleryItems.length) %
      galleryItems.length;
    setPlayingGalleryVideoId(null);
    setSelectedGalleryKey(galleryItems[nextIndex].key);
  }

  function openGalleryItem(item: GalleryItem | null) {
    if (item) setLightboxKey(item.key);
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] flex-1 px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-12">
      <nav aria-label="Breadcrumb" className="mb-5 text-xs text-white/50">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/movies" className="transition hover:text-white">
              Movies
            </Link>
          </li>
          {movie.genres[0] ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/movies?genres=${encodeURIComponent(movie.genres[0].slug)}`}
                  className="transition hover:text-white"
                >
                  {movie.genres[0].name}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden="true">/</li>
          <li className="text-white/75" aria-current="page">
            {movie.title}
          </li>
        </ol>
      </nav>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
            {movie.status === "now_showing" ? "Now showing" : "Coming soon"}
          </p>
          <h1 className="font-cinema-display break-words text-5xl uppercase leading-[0.9] tracking-wide text-white sm:text-6xl lg:text-7xl">
            {movie.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/65 sm:text-sm">
            <span>{movie.genres.map((genre) => genre.name).join(", ")}</span>
            <span aria-hidden="true" className="text-primary">•</span>
            <span>{runtimeLabel(movie.runtimeMinutes)}</span>
            <span aria-hidden="true" className="text-primary">•</span>
            <span>{movie.ageRating}</span>
            <span aria-hidden="true" className="text-primary">•</span>
            <span>{movie.status === "now_showing" ? "Released" : "Releases"} {movieDate}</span>
            {movie.language ? (
              <>
                <span aria-hidden="true" className="text-primary">•</span>
                <span>{movie.language}</span>
              </>
            ) : null}
          </div>
        </div>
        {movie.showtimeSummary && movie.showtimeSummary.cinemaCount > 0 ? (
          <div className="flex items-center gap-2 pb-1 text-right text-xs uppercase tracking-wider text-white/55">
            <MapPin aria-hidden="true" className="size-4 text-primary" />
            <span>
              Showing at{" "}
              <strong className="text-white">
                {movie.showtimeSummary.cinemaCount}
              </strong>{" "}
              {movie.showtimeSummary.cinemaCount === 1 ? "cinema" : "cinemas"}
            </span>
          </div>
        ) : null}
      </header>

      <section
        aria-label={`${movie.title} media gallery`}
        className="relative left-1/2 mb-10 grid w-[calc(100vw-2.5rem)] -translate-x-1/2 gap-3 sm:w-[calc(100vw-4rem)] sm:grid-cols-[minmax(9rem,0.32fr)_minmax(0,1fr)] lg:w-[calc(100vw-6rem)] xl:grid-cols-[minmax(17rem,0.35fr)_minmax(0,1fr)_minmax(12rem,0.25fr)]"
      >
        <button
          type="button"
          onClick={() =>
            setLightboxKey(
              galleryItems.find((item) => item.photo)?.key ??
                galleryItems[0]?.key ??
                null,
            )
          }
          aria-label={`Open ${movie.title} media gallery`}
          className="relative mx-auto block aspect-[2/3] w-full max-w-xs overflow-hidden bg-surface-elevated text-left sm:mx-0 sm:max-w-none"
        >
          <MediaImage
            image={movie.poster}
            alt={`${movie.title} poster`}
            className="size-full"
            preferredVariant="large"
          />
          <span className="absolute left-3 top-3 bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground">
            {movie.status === "now_showing" ? "Now showing" : "Coming soon"}
          </span>
        </button>

        <div className="min-w-0">
          <div className="relative min-w-0">
            {activeGalleryVideo ? (
              playingGalleryVideoId === activeGalleryVideo.id ? (
                <div className="aspect-video w-full overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeGalleryVideo.youtubeId}?autoplay=1&rel=0`}
                    title={activeGalleryVideo.title}
                    className="size-full"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setPlayingGalleryVideoId(activeGalleryVideo.id)
                  }
                  aria-label={`Play ${activeGalleryVideo.title}`}
                  className="group relative block aspect-video w-full overflow-hidden bg-black text-left"
                >
                  {videoThumbnailUrl(activeGalleryVideo.thumbnailUrl) ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={videoThumbnailUrl(activeGalleryVideo.thumbnailUrl) ?? undefined}
                        alt=""
                        className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                    </>
                  ) : (
                    <MediaImage
                      image={activeGalleryItem.image ?? movie.poster}
                      alt={`${movie.title} media`}
                      className="absolute inset-0 size-full"
                      preferredVariant="large"
                    />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/40">
                    <span className="flex size-16 items-center justify-center rounded-full border border-white/70 bg-black/55 text-white transition group-hover:scale-105">
                      <Play aria-hidden="true" className="ml-1 size-6 fill-current" />
                    </span>
                  </span>
                </button>
              )
            ) : activeGalleryItem?.photo ? (
              <button
                type="button"
                onClick={() => openGalleryItem(activeGalleryItem)}
                aria-label={`View ${activeGalleryItem.label}`}
                className="relative block aspect-video w-full overflow-hidden text-left"
              >
                <MediaImage
                  image={activeGalleryItem.image}
                  alt={activeGalleryItem.label}
                  className="absolute inset-0 size-full"
                  preferredVariant="large"
                />
              </button>
            ) : (
              <MediaImage
                image={activeGalleryItem?.image ?? movie.backdrop ?? movie.poster}
                alt={activeGalleryItem?.label ?? `${movie.title} artwork`}
                className="aspect-video w-full"
                preferredVariant="large"
              />
            )}
            {galleryItems.length > 1 ? (
              <div className="pointer-events-none absolute inset-y-0 flex w-full items-center justify-between px-3">
                <button
                  type="button"
                  aria-label="Previous gallery item"
                  onClick={() => moveGallery(-1)}
                  className="pointer-events-auto flex size-9 items-center justify-center border border-white/25 bg-black/55 text-white transition hover:bg-black/80"
                >
                  <ChevronLeft aria-hidden="true" className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next gallery item"
                  onClick={() => moveGallery(1)}
                  className="pointer-events-auto flex size-9 items-center justify-center border border-white/25 bg-black/55 text-white transition hover:bg-black/80"
                >
                  <ChevronRight aria-hidden="true" className="size-5" />
                </button>
              </div>
            ) : null}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-3 pt-12">
              <div className="min-w-0">
                {activeGalleryItem?.video ? (
                  <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary sm:text-[10px]">
                    {activeGalleryItem.video.kind.replaceAll("_", " ")}
                    {activeGalleryItem.video.durationSeconds !== null
                      ? ` · ${Math.floor(activeGalleryItem.video.durationSeconds / 60)}:${String(activeGalleryItem.video.durationSeconds % 60).padStart(2, "0")}`
                      : ""}
                    {" · YouTube"}
                  </p>
                ) : null}
                <p className="max-w-full truncate text-[10px] font-bold uppercase tracking-[0.14em] text-white sm:text-xs">
                  {activeGalleryItem?.video
                    ? activeGalleryItem.video.title
                    : activeGalleryItem?.label ?? "Movie artwork"}
                </p>
              </div>
              <span className="shrink-0 bg-black/70 px-2 py-1 font-mono text-[10px] text-white/80">
                {galleryItems.length > 0
                  ? `${activeGalleryIndex + 1} / ${galleryItems.length}`
                  : "Artwork"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 content-start gap-3 sm:col-span-2 xl:col-span-1 xl:h-full xl:grid-cols-1 xl:grid-rows-2 xl:content-stretch">
          <button
            type="button"
            onClick={() =>
              openGalleryItem(
                galleryItems.find((item) => item.video) ?? null,
              )
            }
            aria-label={`Open ${movie.title} videos`}
            className="group relative flex aspect-video items-center justify-center overflow-hidden bg-surface-elevated text-left xl:aspect-auto xl:min-h-0"
          >
            {movie.videos[0] && videoThumbnailUrl(movie.videos[0].thumbnailUrl) ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={videoThumbnailUrl(movie.videos[0].thumbnailUrl) ?? undefined}
                  alt=""
                  className="absolute inset-0 size-full object-cover opacity-55 transition duration-500 group-hover:scale-105"
                />
              </>
            ) : (
              <MediaImage
                image={movie.backdrop ?? movie.poster}
                alt=""
                decorative
                className="absolute inset-0 size-full"
              />
            )}
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-t from-black/75 via-black/15 to-black/10 text-center text-white">
              <Clapperboard aria-hidden="true" className="size-5" />
              <span className="font-mono text-sm font-bold">{movie.videos.length}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Videos</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() =>
              openGalleryItem(
                galleryItems.find((item) => item.photo) ?? null,
              )
            }
            aria-label={`Open ${movie.title} photos`}
            className="group relative flex aspect-video items-center justify-center overflow-hidden bg-surface-elevated text-left xl:aspect-auto xl:min-h-0"
          >
            {movie.photos[0] ? (
              <MediaImage
                image={movie.photos[0].image}
                alt=""
                decorative
                className="absolute inset-0 size-full transition group-hover:scale-105"
                preferredVariant="medium"
              />
            ) : (
              <MediaImage
                image={movie.backdrop ?? movie.poster}
                alt=""
                decorative
                className="absolute inset-0 size-full"
              />
            )}
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-t from-black/75 via-black/15 to-black/10 text-center text-white">
              <Images aria-hidden="true" className="size-5" />
              <span className="font-mono text-sm font-bold">{movie.photos.length}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Photos</span>
            </span>
          </button>
        </div>
      </section>

      {galleryItems.length > 0 ? (
        <div
          aria-label="Select gallery item"
          className="relative left-1/2 mb-12 w-[calc(100vw-2.5rem)] -translate-x-1/2 overflow-x-auto pb-2 sm:w-[calc(100vw-4rem)] lg:w-[calc(100vw-6rem)]"
        >
          <div className="flex w-max gap-3">
            {galleryItems.map((item, index) => (
              <button
                key={item.key}
                type="button"
                aria-label={`Show ${item.label}`}
                aria-pressed={item.key === selectedGalleryKey}
                onClick={() => {
                  setPlayingGalleryVideoId(null);
                  setSelectedGalleryKey(item.key);
                }}
                className={`group relative aspect-video w-40 shrink-0 overflow-hidden border-2 bg-surface-elevated text-left transition-colors sm:w-44 lg:w-48 ${
                  item.key === selectedGalleryKey
                    ? "border-primary"
                    : "border-transparent hover:border-white/40"
                }`}
              >
                {item.video && videoThumbnailUrl(item.video.thumbnailUrl) ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={videoThumbnailUrl(item.video.thumbnailUrl) ?? undefined}
                      alt=""
                      className="absolute inset-[2px] size-[calc(100%-4px)] object-cover transition duration-300 group-hover:scale-105"
                    />
                  </>
                ) : (
                  <MediaImage
                    image={item.image}
                    alt=""
                    decorative
                    className="absolute inset-[2px] size-[calc(100%-4px)] transition duration-300 group-hover:scale-105"
                    preferredVariant="medium"
                  />
                )}
                {item.video ? (
                  <>
                    <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-sm bg-red-600 text-white">
                      <Play aria-hidden="true" className="size-2.5 fill-current" />
                    </span>
                    {item.video.durationSeconds !== null ? (
                      <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                        <Play aria-hidden="true" className="size-2.5 fill-current" />
                        {Math.floor(item.video.durationSeconds / 60)}:
                        {String(item.video.durationSeconds % 60).padStart(2, "0")}
                      </span>
                    ) : null}
                  </>
                ) : null}
                <span className="sr-only">
                  Item {index + 1} of {galleryItems.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2.15fr)_minmax(19rem,1fr)] lg:gap-16">
        <section className="min-w-0 space-y-6">
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <Link
                key={genre.id}
                href={`/movies?genres=${encodeURIComponent(genre.slug)}`}
                className="border border-white/25 px-4 py-2 text-sm text-white transition hover:border-primary hover:text-primary"
              >
                {genre.name}
              </Link>
            ))}
          </div>
          {movie.synopsis ? (
            <p className="max-w-5xl text-base leading-8 text-white/90 sm:text-lg lg:text-[22px] lg:leading-[1.75]">
              {movie.synopsis}
            </p>
          ) : null}
          <CreditRows credits={activeCredits} />
        </section>

        <aside className="flex flex-col gap-4 lg:self-start">
          <a
            href="#showtimes"
            className="inline-flex min-h-16 items-center justify-center gap-3 bg-primary px-5 py-4 text-base font-bold text-primary-foreground transition hover:bg-accent"
          >
            <Ticket aria-hidden="true" className="size-4" />
            Book tickets
          </a>
          {heroVideo ? (
            <button
              type="button"
              onClick={() =>
                setLightboxKey(
                  galleryItems.find((item) => item.video?.id === heroVideo.id)
                    ?.key ?? null,
                )
              }
              className="inline-flex min-h-16 items-center justify-center gap-3 border border-white/30 px-5 py-4 text-base font-bold text-white transition hover:border-white/60"
            >
              <Play aria-hidden="true" className="size-4 fill-current" />
              Watch trailer
            </button>
          ) : null}
          <div className="mt-1 space-y-4 border border-white/15 p-5 text-sm text-white/85 sm:text-base">
            {nextShow ? (
              <p className="flex items-start gap-3">
                <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-white/70" />
                <span>
                  Next show today at{" "}
                  <strong className="mx-1 text-white">
                    {formatLocalTime(nextShow.startsAt)}
                  </strong>
                  , {nextShow.theater.name}
                </span>
              </p>
            ) : null}
            {movie.showtimeSummary && movie.showtimeSummary.cinemaCount > 0 ? (
              <p className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-white/70" />
                <span>
                  Showing at {movie.showtimeSummary.cinemaCount}{" "}
                  {movie.showtimeSummary.cinemaCount === 1 ? "cinema" : "cinemas"}
                </span>
              </p>
            ) : null}
            {movie.language ? (
              <p className="flex items-start gap-3">
                <Clapperboard aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-white/70" />
                <span>{movie.language}{movie.language.toLowerCase() === "arabic" ? " audio" : ""}</span>
              </p>
            ) : null}
            {fromPrice ? (
              <p className="flex items-start gap-3">
                <CreditCard aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-white/70" />
                <span>From {formatMoviePrice(fromPrice)} · pay online</span>
              </p>
            ) : null}
          </div>
        </aside>
      </div>

      <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-20">
        <ShowtimesSection
          showtimes={showtimes}
          error={showtimesError}
          onRetry={() => router.refresh()}
        />

        {actors.length > 0 || groupedCredits.length > 0 ? (
          <section aria-labelledby="cast-heading">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-5">
              <h2
                id="cast-heading"
                className="font-cinema-display text-5xl uppercase leading-none tracking-wide text-white sm:text-6xl lg:text-7xl"
              >
                Cast &amp; Crew
              </h2>
              <span className="border border-primary px-3 py-1.5 text-xs font-semibold text-primary">
                All {activeCredits.length} cast &amp; crew
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-8 lg:gap-x-5">
              {activeCredits.map((credit) => (
                <article
                  key={credit.id}
                  className="min-w-0 text-center"
                >
                  <div className="mx-auto mb-3 size-20 overflow-hidden rounded-full border border-white/10 bg-surface-elevated sm:size-24">
                    {credit.person.photo ? (
                      <MediaImage
                        image={credit.person.photo}
                        alt={credit.person.fullName}
                        className="size-full"
                        preferredVariant="small"
                        fallbackLabel={initials(credit.person.fullName)}
                      />
                    ) : (
                      <div
                        aria-label={credit.person.fullName}
                        role="img"
                        className="flex size-full items-center justify-center font-cinema-display text-2xl text-white/80"
                      >
                        {initials(credit.person.fullName)}
                      </div>
                    )}
                  </div>
                  <h3 className="break-words text-xs font-semibold leading-5 text-white">
                    {credit.person.fullName}
                  </h3>
                  <p className="mt-1 break-words text-[10px] leading-4 text-white/45">
                    {credit.characterName || credit.role}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {movie.videos.length > 0 ? (
          <section id="videos" aria-labelledby="videos-heading">
            <div className="mb-6 flex items-end justify-between gap-3">
              <h2
                id="videos-heading"
                className="font-cinema-display text-4xl uppercase leading-none tracking-wide text-white sm:text-5xl"
              >
                Videos <span className="text-primary">{movie.videos.length}</span>
              </h2>
              <span className="text-xs text-white/45">Official movie videos</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {movie.videos.map((video) => (
                <article key={video.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() =>
                      openGalleryItem(
                        galleryItems.find((item) => item.video?.id === video.id) ??
                          null,
                      )
                    }
                    aria-label={`Play ${video.title}`}
                    className="group relative block aspect-video w-full overflow-hidden bg-surface-elevated text-left"
                  >
                    {videoThumbnailUrl(video.thumbnailUrl) ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={videoThumbnailUrl(video.thumbnailUrl) ?? undefined}
                          alt=""
                          className="size-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </>
                    ) : (
                      <MediaImage
                        image={movie.backdrop ?? movie.poster}
                        alt=""
                        decorative
                        className="size-full"
                      />
                    )}
                    <span className="absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Play aria-hidden="true" className="ml-0.5 size-4 fill-current" />
                    </span>
                    {video.durationSeconds ? (
                      <span className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 font-mono text-[10px] text-white">
                        {Math.floor(video.durationSeconds / 60)}:
                        {String(video.durationSeconds % 60).padStart(2, "0")}
                      </span>
                    ) : null}
                  </button>
                  <h3 className="mt-3 text-sm font-bold uppercase text-white">
                    {video.title}
                  </h3>
                  <p className="mt-1 text-xs capitalize text-white/45">
                    {video.kind.replaceAll("_", " ")}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {movie.photos.length > 0 ? (
          <section id="photos" aria-labelledby="photos-heading">
            <div className="mb-6 flex items-end justify-between gap-3">
              <h2
                id="photos-heading"
                className="font-cinema-display text-4xl uppercase leading-none tracking-wide text-white sm:text-5xl"
              >
                Photos <span className="text-primary">{movie.photos.length}</span>
              </h2>
              <span className="text-xs text-white/45">Gallery stills</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {movie.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() =>
                    openGalleryItem(
                      galleryItems.find((item) => item.photo?.id === photo.id) ??
                        null,
                    )
                  }
                  aria-label={`View ${photo.caption || photo.image.alt || `photo ${index + 1}`}`}
                  className={`group relative overflow-hidden text-left ${
                    index === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <MediaImage
                    image={photo.image}
                    alt={photo.caption || photo.image.alt || `${movie.title} photo`}
                    className={`w-full transition duration-500 group-hover:scale-[1.02] ${
                      index === 0 ? "aspect-[4/3]" : "aspect-video"
                    }`}
                    preferredVariant="medium"
                  />
                  {photo.caption ? (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 text-left text-xs text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                      {photo.caption}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {similarMovies.length > 0 ? (
          <section aria-labelledby="similar-heading">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2
                id="similar-heading"
                className="font-cinema-display text-4xl uppercase leading-none tracking-wide text-white sm:text-5xl"
              >
                More Like This
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {similarMovies
                .filter((similarMovie) => similarMovie.id !== movie.id)
                .map((similarMovie) => (
                  <MovieCard key={similarMovie.id} movie={similarMovie} />
                ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="details-heading">
          <h2
            id="details-heading"
            className="mb-5 font-cinema-display text-4xl uppercase leading-none tracking-wide text-white sm:text-5xl"
          >
            Details
          </h2>
          <dl className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-3 lg:grid-cols-4">
            {[
              ["Release date", movieDate],
              ["Runtime", runtimeLabel(movie.runtimeMinutes)],
              ["Age rating", movie.ageRating],
              ["Language", movie.language],
              ["Country of origin", movie.country],
              ["Production company", movie.productionCompany],
              ["Filming locations", movie.filmingLocations],
            ]
              .filter((entry): entry is [string, string] => Boolean(entry[1]))
              .map(([label, value]) => (
                <div
                  key={label}
                  className="border-b border-white/10 py-4 pr-4 sm:py-5"
                >
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
                    {label}
                  </dt>
                  <dd className="mt-2 text-sm text-white/85">{value}</dd>
                </div>
              ))}
          </dl>
        </section>
      </div>

      {lightboxKey ? (
        <MovieGalleryLightbox
          items={galleryItems}
          initialKey={lightboxKey}
          movieTitle={movie.title}
          onClose={() => setLightboxKey(null)}
        />
      ) : null}
    </main>
  );
}

export function RetryMovieDetailsButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="rounded-sm bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-accent"
    >
      Try again
    </button>
  );
}

export function MovieDetailsLoadError({ message }: { message: string }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-5 py-16 pt-32 sm:px-8">
      <h1 className="font-cinema-display text-4xl uppercase tracking-wide text-white sm:text-5xl">
        Movie details
      </h1>
      <ErrorState
        title="We couldn't load this movie"
        message={message}
        action={<RetryMovieDetailsButton />}
      />
      <Link
        href="/movies"
        className="self-center text-sm font-semibold text-white/70 underline underline-offset-4 transition hover:text-white"
      >
        Back to movies
      </Link>
    </main>
  );
}
