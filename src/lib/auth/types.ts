export type AuthCustomer = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  memberSince: string;
};

export type AuthSession = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  customer: AuthCustomer;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDateString(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export function isAuthCustomer(value: unknown): value is AuthCustomer {
  if (!isRecord(value)) return false;

  return (
    Number.isSafeInteger(value.id) &&
    typeof value.fullName === "string" &&
    value.fullName.trim().length > 0 &&
    typeof value.email === "string" &&
    value.email.trim().length > 0 &&
    (typeof value.phone === "string" || value.phone === null) &&
    typeof value.emailVerified === "boolean" &&
    (value.emailVerifiedAt === null || isDateString(value.emailVerifiedAt)) &&
    isDateString(value.memberSince)
  );
}

export function isAuthSession(value: unknown): value is AuthSession {
  if (!isRecord(value)) return false;

  return (
    typeof value.accessToken === "string" &&
    value.accessToken.length > 0 &&
    isDateString(value.accessTokenExpiresAt) &&
    typeof value.refreshToken === "string" &&
    value.refreshToken.length > 0 &&
    isDateString(value.refreshTokenExpiresAt) &&
    isAuthCustomer(value.customer)
  );
}
