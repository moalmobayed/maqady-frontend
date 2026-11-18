const RETURN_TO_BASE_URL = "https://maqady.invalid";
const MAX_RETURN_TO_LENGTH = 2048;

export function getSafeReturnTo(value: string | null): string | null {
  if (
    !value ||
    value.length > MAX_RETURN_TO_LENGTH ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return null;
  }

  try {
    const url = new URL(value, RETURN_TO_BASE_URL);
    if (
      url.origin !== RETURN_TO_BASE_URL ||
      url.pathname === "/login" ||
      url.pathname === "/register" ||
      url.pathname === "/api" ||
      url.pathname.startsWith("/api/")
    ) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function getCurrentPageReturnTo(): string | null {
  if (typeof window === "undefined") return null;

  return getSafeReturnTo(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  );
}

export function getBrowserReturnTo(): string | null {
  if (typeof window === "undefined") return null;

  const returnTo = getSafeReturnTo(
    new URLSearchParams(window.location.search).get("returnTo"),
  );
  if (returnTo) return returnTo;
  if (!document.referrer) return null;

  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin !== window.location.origin) return null;

    return getSafeReturnTo(
      `${referrer.pathname}${referrer.search}${referrer.hash}`,
    );
  } catch {
    return null;
  }
}
