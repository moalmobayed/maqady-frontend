import "server-only";
import { cache } from "react";
import {
  isHomeData,
  type HomeDataResult,
  type HomeLoadError,
} from "./types";

const REQUEST_TIMEOUT_MS = 60_000;
const DEFAULT_API_BASE_URL = "https://maqady-backend.vercel.app/api/v1";

function failure(
  kind: HomeLoadError["kind"],
  message: string,
): HomeDataResult {
  return { ok: false, error: { kind, message } };
}

function getHomeEndpoint(): URL | HomeDataResult {
  const baseUrl =
    process.env.MAQADY_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

  try {
    const parsedBaseUrl = new URL(baseUrl);
    if (parsedBaseUrl.protocol !== "http:" && parsedBaseUrl.protocol !== "https:") {
      throw new Error("The API base URL must use HTTP or HTTPS.");
    }

    return new URL("home", `${parsedBaseUrl.toString().replace(/\/+$/, "")}/`);
  } catch {
    return failure(
      "configuration",
      "The Home data service URL is invalid. Check MAQADY_API_BASE_URL.",
    );
  }
}

async function fetchHomeData(): Promise<HomeDataResult> {
  const endpoint = getHomeEndpoint();
  if (!(endpoint instanceof URL)) return endpoint;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Home API request failed:", error);
    return failure(
      "network",
      "We couldn't reach the cinema service. It may be starting up; please try again shortly.",
    );
  }

  if (!response.ok) {
    console.error("Home API returned an unsuccessful response:", {
      status: response.status,
      requestId: response.headers.get("x-request-id"),
    });
    return failure(
      "http",
      response.status === 503
        ? "The cinema service is temporarily unavailable. Please try again shortly."
        : "We couldn't load the latest cinema information. Please try again.",
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    console.error("Home API returned invalid JSON:", error);
    return failure(
      "invalid-response",
      "The cinema service returned an unreadable response. Please try again.",
    );
  }

  if (!isHomeData(payload)) {
    console.error("Home API response did not match the expected contract.");
    return failure(
      "invalid-response",
      "The cinema service returned incomplete information. Please try again later.",
    );
  }

  return { ok: true, data: payload };
}

export const getHomeData = cache(fetchHomeData);
