import "server-only";
import { cookies } from "next/headers";
import type { AuthSession } from "./types";

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthSessionCookies(
  session: AuthSession,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("maqady_access_token", session.accessToken, {
    ...SESSION_COOKIE_OPTIONS,
    expires: new Date(session.accessTokenExpiresAt),
  });
  cookieStore.set("maqady_refresh_token", session.refreshToken, {
    ...SESSION_COOKIE_OPTIONS,
    expires: new Date(session.refreshTokenExpiresAt),
  });
}

export async function clearAuthSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  const options = { ...SESSION_COOKIE_OPTIONS, maxAge: 0 };
  cookieStore.set("maqady_access_token", "", options);
  cookieStore.set("maqady_refresh_token", "", options);
}
