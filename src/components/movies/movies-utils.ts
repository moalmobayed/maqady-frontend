import type { MovieStatus } from "@/lib/home/types";
import type { MovieShowDate } from "@/lib/movies/types";

export type MovieQueryState = {
  status: MovieStatus;
  query: string;
  genres: string[];
  showDate: MovieShowDate;
  castId: number | null;
};

export const showDateOptions: { value: MovieShowDate; label: string }[] = [
  { value: "any", label: "Any day" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "This weekend" },
];

export function listingHref(state: MovieQueryState): string {
  const params = new URLSearchParams();
  if (state.status !== "now_showing") params.set("status", state.status);
  if (state.query) params.set("q", state.query);
  for (const genre of state.genres) params.append("genres", genre);
  if (state.showDate !== "any") params.set("showDate", state.showDate);
  if (state.castId !== null) params.set("cast", String(state.castId));

  const search = params.toString();
  return search ? `/movies?${search}` : "/movies";
}

export function formatReleaseDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(parsed)
    .toUpperCase();
}

export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes}m`;
  if (!remainingMinutes) return `${hours}h`;
  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
