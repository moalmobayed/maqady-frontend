import "server-only";
import { cookies } from "next/headers";
import { isAuthCustomer, type AuthCustomer } from "@/lib/auth/types";

const REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_API_BASE_URL = "https://maqady-backend.vercel.app/api/v1";

export type ProfileResult =
  | { ok: true; customer: AuthCustomer }
  | {
      ok: false;
      kind: "unauthenticated" | "unavailable";
      message: string;
    };

function getProfileEndpoint(): URL | null {
  const baseUrl =
    process.env.MAQADY_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

  try {
    const parsedBaseUrl = new URL(baseUrl);
    const allowsHttpForLocalDevelopment =
      process.env.NODE_ENV !== "production" && parsedBaseUrl.protocol === "http:";
    if (parsedBaseUrl.protocol !== "https:" && !allowsHttpForLocalDevelopment) {
      return null;
    }

    return new URL(
      "me",
      `${parsedBaseUrl.toString().replace(/\/+$/, "")}/`,
    );
  } catch {
    return null;
  }
}

export async function getCurrentProfile(): Promise<ProfileResult> {
  const accessToken = (await cookies()).get("maqady_access_token")?.value;
  if (!accessToken) {
    return {
      ok: false,
      kind: "unauthenticated",
      message: "Sign in to view your profile.",
    };
  }

  const endpoint = getProfileEndpoint();
  if (!endpoint) {
    return {
      ok: false,
      kind: "unavailable",
      message: "The profile service is not configured correctly.",
    };
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Profile API request failed:", error);
    return {
      ok: false,
      kind: "unavailable",
      message: "We couldn't reach the profile service. Please try again.",
    };
  }

  if (response.status === 401) {
    return {
      ok: false,
      kind: "unauthenticated",
      message: "Your session has expired. Sign in again to view your profile.",
    };
  }

  if (!response.ok) {
    console.error("Profile API returned an unsuccessful response:", {
      status: response.status,
      requestId: response.headers.get("x-request-id"),
    });
    return {
      ok: false,
      kind: "unavailable",
      message: "We couldn't load your profile. Please try again.",
    };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    console.error("Profile API returned invalid JSON:", error);
    return {
      ok: false,
      kind: "unavailable",
      message: "The profile service returned an unexpected response.",
    };
  }

  if (!isAuthCustomer(payload)) {
    console.error("Profile API response did not match its contract.");
    return {
      ok: false,
      kind: "unavailable",
      message: "The profile service returned incomplete profile information.",
    };
  }

  return { ok: true, customer: payload };
}
