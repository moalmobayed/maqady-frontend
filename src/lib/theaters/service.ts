import "server-only";
import { cache } from "react";
import {
  isTheaterDetails,
  isTheaterShowtimes,
  isTheatersData,
  type TheaterDetailsResult,
  type TheaterShowtimesResult,
  type TheatersLoadError,
  type TheatersResult,
} from "./types";

const REQUEST_TIMEOUT_MS = 60_000;
const DEFAULT_API_BASE_URL = "https://maqady-backend.vercel.app/api/v1";

function failure(kind: TheatersLoadError["kind"], message: string): TheatersResult {
  return { ok: false, error: { kind, message } };
}

function endpoint(path: string) {
  const baseUrl = process.env.MAQADY_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
  try {
    const parsed = new URL(baseUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    return new URL(path, `${parsed.toString().replace(/\/+$/, "")}/`);
  } catch {
    return null;
  }
}

async function requestJson(path: string, label: string) {
  const url = endpoint(path);
  if (!url) return { ok: false as const, error: { kind: "configuration" as const, message: "The theater service URL is invalid." } };
  try {
    const response = await fetch(url, { cache: "no-store", headers: { accept: "application/json" }, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) {
      if (response.status === 404) return { ok: false as const, error: { kind: "not-found" as const, message: "Theater not found." } };
      console.error(`${label} returned an unsuccessful response:`, response.status);
      return { ok: false as const, error: { kind: "http" as const, message: "We couldn't load the theater information. Please try again." } };
    }
    return { ok: true as const, data: await response.json() as unknown };
  } catch (error) {
    console.error(`${label} request failed:`, error);
    return { ok: false as const, error: { kind: "network" as const, message: "We couldn't reach the theater service. Please try again shortly." } };
  }
}

export const getTheaterDetails = cache(async (id: number): Promise<TheaterDetailsResult> => {
  const result = await requestJson(`theaters/${id}`, "Theater details");
  if (!result.ok) return result.error.kind === "not-found" ? result : { ok: false, error: result.error };
  if (!isTheaterDetails(result.data)) {
    console.error(`Theater ${id} detail response did not match the expected contract.`);
    return { ok: false, error: { kind: "invalid-response", message: "The theater service returned incomplete details." } };
  }
  return { ok: true, data: result.data };
});

export const getTheaterShowtimes = cache(async (id: number): Promise<TheaterShowtimesResult> => {
  const result = await requestJson(`theaters/${id}/showtimes`, "Theater showtimes");
  if (!result.ok) return { ok: false, error: result.error.kind === "not-found" ? { kind: "http", message: "The theater showtimes are unavailable." } : result.error };
  if (!isTheaterShowtimes(result.data) || result.data.theaterId !== id) {
    console.error(`Theater ${id} showtime response did not match the expected contract.`);
    return { ok: false, error: { kind: "invalid-response", message: "The theater service returned incomplete showtimes." } };
  }
  return { ok: true, data: result.data };
});

async function fetchTheaters(): Promise<TheatersResult> {
  const result = await requestJson("theaters", "Theaters");
  if (!result.ok) return { ok: false, error: result.error.kind === "not-found" ? { kind: "http", message: "The theaters directory is unavailable." } : result.error };
  if (!isTheatersData(result.data)) return failure("invalid-response", "The theater service returned incomplete information.");
  return { ok: true, data: result.data };
}

export const getTheaters = cache(fetchTheaters);
