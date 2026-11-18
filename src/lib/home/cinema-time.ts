import type { HomeData, TickerItem } from "./types";

const CINEMA_TIME_ZONE = "Africa/Cairo";

export function formatCinemaTime(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-EG", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: CINEMA_TIME_ZONE,
  }).format(date);
}

export function formatReleaseDate(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatReleaseDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  })
    .format(date)
    .replace(",", "")
    .toUpperCase();
}

export function getCurrentTickerItems(data: HomeData): TickerItem[] {
  const serverTime = Date.parse(data.serverTime);
  if (!Number.isFinite(serverTime)) return [];
  const currentTime = Math.max(serverTime, Date.now());

  return data.ticker
    .filter((item) => {
      const startsAt = Date.parse(item.nextShowtime.startsAt);
      return (
        item.nextShowtime.cinemaDate === data.cinemaDate &&
        Number.isFinite(startsAt) &&
        startsAt > currentTime
      );
    })
    .sort(
      (first, second) =>
        Date.parse(first.nextShowtime.startsAt) -
        Date.parse(second.nextShowtime.startsAt),
    );
}
