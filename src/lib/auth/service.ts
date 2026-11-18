import "server-only";
import { isAuthSession, type AuthSession } from "./types";

const REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_API_BASE_URL = "https://maqady-backend.vercel.app/api/v1";

type AuthOperation = "registration" | "session";
type SignInInput = { email: string; password: string };
type RegistrationInput = SignInInput & { fullName: string };

export type AuthServiceResult =
  | { ok: true; session: AuthSession }
  | { ok: false; status: number; message: string };

function getEndpoint(operation: AuthOperation): URL | null {
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
      operation === "registration" ? "auth/registrations" : "auth/sessions",
      `${parsedBaseUrl.toString().replace(/\/+$/, "")}/`,
    );
  } catch {
    return null;
  }
}

function getUpstreamError(
  operation: AuthOperation,
  status: number,
): { status: number; message: string } {
  if (status === 401 && operation === "session") {
    return { status: 401, message: "The email or password is incorrect." };
  }
  if (status === 409 && operation === "registration") {
    return {
      status: 409,
      message: "An account with this email already exists.",
    };
  }
  if (status === 400 || status === 422) {
    return {
      status,
      message: "Please check your information and try again.",
    };
  }
  if (status === 429) {
    return {
      status: 429,
      message: "Too many attempts. Please wait a moment and try again.",
    };
  }
  if (status >= 500) {
    return {
      status: 502,
      message: "The authentication service is temporarily unavailable.",
    };
  }

  return {
    status: status >= 400 && status < 500 ? status : 502,
    message:
      operation === "session"
        ? "We couldn't sign you in. Please try again."
        : "We couldn't create your account. Please try again.",
  };
}

export async function requestAuthSession(
  operation: AuthOperation,
  input: SignInInput | RegistrationInput,
): Promise<AuthServiceResult> {
  const endpoint = getEndpoint(operation);
  if (!endpoint) {
    return {
      ok: false,
      status: 500,
      message: "The authentication service is not configured correctly.",
    };
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Authentication API request failed:", {
      operation,
      error,
    });
    return {
      ok: false,
      status: 502,
      message: "We couldn't reach the authentication service. Please try again.",
    };
  }

  if (!response.ok) {
    console.error("Authentication API returned an unsuccessful response:", {
      operation,
      status: response.status,
      requestId: response.headers.get("x-request-id"),
    });
    return {
      ok: false,
      ...getUpstreamError(operation, response.status),
    };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    console.error("Authentication API returned invalid JSON:", {
      operation,
      error,
    });
    return {
      ok: false,
      status: 502,
      message: "The authentication service returned an unexpected response.",
    };
  }

  if (
    !isAuthSession(payload) ||
    Date.parse(payload.accessTokenExpiresAt) <= Date.now() ||
    Date.parse(payload.refreshTokenExpiresAt) <= Date.now()
  ) {
    console.error("Authentication API response did not match its contract.", {
      operation,
    });
    return {
      ok: false,
      status: 502,
      message: "The authentication service returned an unexpected response.",
    };
  }

  return { ok: true, session: payload };
}
