export type AuthRequestBodyResult =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; response: Response };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function authJson(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function readAuthRequestBody(
  request: Request,
): Promise<AuthRequestBodyResult> {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return {
      ok: false,
      response: authJson(
        { message: "This request could not be verified. Please try again." },
        403,
      ),
    };
  }

  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  ) {
    return {
      ok: false,
      response: authJson({ message: "A JSON request body is required." }, 415),
    };
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 8192) {
    return {
      ok: false,
      response: authJson({ message: "The request is too large." }, 413),
    };
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return {
      ok: false,
      response: authJson({ message: "The request body is invalid." }, 400),
    };
  }

  if (!isRecord(payload)) {
    return {
      ok: false,
      response: authJson({ message: "The request body is invalid." }, 400),
    };
  }

  return { ok: true, body: payload };
}

export function isValidEmail(email: string): boolean {
  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}
