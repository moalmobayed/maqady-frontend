import { authJson } from "@/lib/auth/http";
import { clearAuthSessionCookies } from "@/lib/auth/session-cookies";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return authJson(
      { message: "This request could not be verified. Please try again." },
      403,
    );
  }

  await clearAuthSessionCookies();
  return authJson({ message: "Signed out." });
}
