import type { ImageAsset, Movie } from "@/lib/home/types";

export type Theater = {
  id: number; name: string; district: string; city: string; address: string;
  postalCode?: string | null;
  cover: ImageAsset | null;
  openState: { isOpen: boolean; closesAt: string | null; nextOpensAt: string | null };
  mainPhone: { label: string; number: string } | null;
  hallCount: number; facilities: string[];
  latitude: number | null; longitude: number | null;
  today: { cinemaDate: string; closed: boolean; opens: string | null; closes: string | null; closesNextDay: boolean; specialDateLabel: string | null } | null;
  weeklyHours?: WeeklyHour[];
};
export type TheatersData = { items: Theater[]; total: number; totalHalls?: number; nextCursor: string | null };
export type TheaterHall = { id: number; name: string; seatCount: number; wheelchairCount: number };
export type TheaterPhoto = { id: number; kind: string; caption: string | null; image: ImageAsset };
export type WeeklyHour = { weekday: number; closed: boolean; opens: string | null; closes: string | null; closesNextDay: boolean };
export type SpecialDate = WeeklyHour & { cinemaDate: string; specialDateLabel: string | null };
export type TheaterDetails = Theater & {
  transitInfo: string | null; parkingInfo: string | null; email: string | null;
  phones: { label: string; number: string }[]; photos: TheaterPhoto[];
  weeklyHours: WeeklyHour[]; specialDates: SpecialDate[]; halls: TheaterHall[];
};
export type TheaterMoney = { amount: number; currency: string };
export type TheaterShowtime = {
  id: number; startsAt: string; endsAt: string; cinemaDate: string;
  hall: { id: number; name: string };
  prices: { front: TheaterMoney; middle: TheaterMoney; back: TheaterMoney };
  fromPrice: TheaterMoney; hasStarted: boolean;
};
export type TheaterShowtimeDay = { cinemaDate: string; movies: { movie: Movie; showtimes: TheaterShowtime[] }[] };
export type TheaterShowtimes = { theaterId: number; cinemaDate: string; days: TheaterShowtimeDay[] };
export type TheatersLoadError = { kind: "configuration" | "network" | "http" | "invalid-response"; message: string };
export type TheaterDetailsError = TheatersLoadError | { kind: "not-found"; message: string };
export type TheatersResult = { ok: true; data: TheatersData } | { ok: false; error: TheatersLoadError };
export type TheaterDetailsResult = { ok: true; data: TheaterDetails } | { ok: false; error: TheaterDetailsError };
export type TheaterShowtimesResult = { ok: true; data: TheaterShowtimes } | { ok: false; error: TheatersLoadError };

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function isString(value: unknown): value is string { return typeof value === "string"; }
function isNullableString(value: unknown): value is string | null { return value === null || isString(value); }
function isPositiveInteger(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value > 0; }
function isNonNegativeInteger(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 0; }
function isDateTime(value: unknown): value is string { return isString(value) && /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) && Number.isFinite(Date.parse(value)); }
function isImageAsset(value: unknown): value is ImageAsset | null {
  return value === null || (isRecord(value) && isNullableString(value.alt) && Array.isArray(value.variants) &&
    value.variants.every((variant) => isRecord(variant) && isString(variant.name) && isString(variant.url) && isPositiveInteger(variant.width) && isPositiveInteger(variant.height)));
}
function isOpenState(value: unknown): boolean {
  return isRecord(value) && typeof value.isOpen === "boolean" &&
    (value.closesAt === null || isDateTime(value.closesAt)) && (value.nextOpensAt === null || isDateTime(value.nextOpensAt));
}
function isToday(value: unknown): boolean {
  return value === null || (isRecord(value) && isString(value.cinemaDate) && typeof value.closed === "boolean" &&
    isNullableString(value.opens) && isNullableString(value.closes) && typeof value.closesNextDay === "boolean" && isNullableString(value.specialDateLabel));
}
function isTheater(value: unknown): value is Theater {
  return isRecord(value) && isPositiveInteger(value.id) && isString(value.name) && isString(value.district) &&
    isString(value.city) && isString(value.address) && isImageAsset(value.cover) && isOpenState(value.openState) &&
    (value.postalCode === undefined || isNullableString(value.postalCode)) &&
    (value.mainPhone === null || (isRecord(value.mainPhone) && isString(value.mainPhone.label) && isString(value.mainPhone.number))) &&
    isNonNegativeInteger(value.hallCount) && Array.isArray(value.facilities) && value.facilities.every(isString) &&
    (value.latitude === null || typeof value.latitude === "number") && (value.longitude === null || typeof value.longitude === "number") &&
    isToday(value.today) &&
    (value.weeklyHours === undefined ||
      (Array.isArray(value.weeklyHours) && value.weeklyHours.every(isWeeklyHour)));
}
function isWeeklyHour(value: unknown): value is WeeklyHour {
  return isRecord(value) && isNonNegativeInteger(value.weekday) && typeof value.closed === "boolean" &&
    isNullableString(value.opens) && isNullableString(value.closes) && typeof value.closesNextDay === "boolean";
}
function isSpecialDate(value: unknown): value is SpecialDate {
  if (!isRecord(value)) return false;
  const record = value as Record<string, unknown>;
  return isWeeklyHour(value) && isString(record.cinemaDate) && isNullableString(record.specialDateLabel);
}
function isTheaterHall(value: unknown): value is TheaterHall {
  return isRecord(value) && isPositiveInteger(value.id) && isString(value.name) && isNonNegativeInteger(value.seatCount) && isNonNegativeInteger(value.wheelchairCount);
}
function isTheaterPhoto(value: unknown): value is TheaterPhoto {
  return isRecord(value) && isPositiveInteger(value.id) && isString(value.kind) && isNullableString(value.caption) && isImageAsset(value.image) && value.image !== null;
}
export function isTheaterDetails(value: unknown): value is TheaterDetails {
  if (!isRecord(value) || !isTheater({ ...value, mainPhone: Array.isArray(value.phones) && isRecord(value.phones[0]) ? value.phones[0] : null })) return false;
  return isNullableString(value.transitInfo) && isNullableString(value.parkingInfo) && isNullableString(value.email) &&
    Array.isArray(value.phones) && value.phones.every((phone) => isRecord(phone) && isString(phone.label) && isString(phone.number)) &&
    Array.isArray(value.photos) && value.photos.every(isTheaterPhoto) && Array.isArray(value.weeklyHours) && value.weeklyHours.every(isWeeklyHour) &&
    Array.isArray(value.specialDates) && value.specialDates.every(isSpecialDate) && Array.isArray(value.halls) && value.halls.every(isTheaterHall);
}
function isMoney(value: unknown): value is TheaterMoney { return isRecord(value) && isNonNegativeInteger(value.amount) && isString(value.currency); }
function isShowtime(value: unknown): value is TheaterShowtime {
  return isRecord(value) && isPositiveInteger(value.id) && isDateTime(value.startsAt) && isDateTime(value.endsAt) && isString(value.cinemaDate) &&
    isRecord(value.hall) && isPositiveInteger(value.hall.id) && isString(value.hall.name) && isRecord(value.prices) &&
    isMoney(value.prices.front) && isMoney(value.prices.middle) && isMoney(value.prices.back) && isMoney(value.fromPrice) && typeof value.hasStarted === "boolean";
}
export function isTheaterShowtimes(value: unknown): value is TheaterShowtimes {
  return isRecord(value) && isPositiveInteger(value.theaterId) && isString(value.cinemaDate) && Array.isArray(value.days) &&
    value.days.every((day) => isRecord(day) && isString(day.cinemaDate) && Array.isArray(day.movies) && day.movies.every((entry) =>
      isRecord(entry) && isRecord(entry.movie) && isPositiveInteger(entry.movie.id) && isString(entry.movie.title) &&
      isImageAsset(entry.movie.poster) && Array.isArray(entry.movie.genres) && entry.movie.genres.every((genre) => isRecord(genre) &&
      isPositiveInteger(genre.id) && isString(genre.name) && isString(genre.slug)) && isPositiveInteger(entry.movie.runtimeMinutes) &&
      isString(entry.movie.ageRating) && isString(entry.movie.releaseDate) && (entry.movie.status === "now_showing" || entry.movie.status === "coming_soon") &&
      Array.isArray(entry.showtimes) && entry.showtimes.every(isShowtime)));
}
export function isTheatersData(value: unknown): value is TheatersData {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isTheater) &&
    isNonNegativeInteger(value.total) &&
    (value.totalHalls === undefined || isNonNegativeInteger(value.totalHalls)) &&
    (value.nextCursor === null || isString(value.nextCursor));
}
