import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { SignInLink } from "@/components/auth/sign-in-link";
import { SignOutButton } from "@/components/profile/sign-out-button";
import type { ProfileResult } from "@/lib/profile/service";

type ProfilePageProps = {
  result: ProfileResult;
};

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? "")
    .join("")
    .toLocaleUpperCase();
}

function ProfileUnavailable({ result }: { result: Extract<ProfileResult, { ok: false }> }) {
  const isUnauthenticated = result.kind === "unauthenticated";

  return (
    <main className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-[1080px] flex-1 items-center px-5 py-12 pt-28 sm:px-8">
      <section
        aria-labelledby="profile-unavailable-heading"
        className="mx-auto w-full max-w-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8"
      >
        <h1
          id="profile-unavailable-heading"
          className="font-cinema-display text-3xl font-bold uppercase text-white sm:text-4xl"
        >
          {isUnauthenticated ? "Your profile" : "Profile unavailable"}
        </h1>
        <p className="mt-4 leading-7 text-white/65">{result.message}</p>
        {isUnauthenticated ? (
          <SignInLink className="mt-6 inline-flex min-h-11 items-center justify-center bg-primary px-5 font-semibold text-primary-foreground transition hover:bg-accent" />
        ) : (
          <Link
            href="/profile"
            className="mt-6 inline-flex min-h-11 items-center justify-center border border-white/20 px-5 font-semibold text-white transition hover:bg-white/5"
          >
            Try again
          </Link>
        )}
      </section>
    </main>
  );
}

export function ProfilePage({ result }: ProfilePageProps) {
  if (!result.ok) return <ProfileUnavailable result={result} />;

  const { customer } = result;
  const memberSince = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(customer.memberSince));
  const fieldClassName =
    "h-12 w-full border border-white/15 bg-[#14110f] px-4 text-sm text-white/75";
  const sectionHeadingClassName =
    "font-cinema-display border-b border-white/10 pb-3 text-2xl font-bold uppercase tracking-wide text-white";

  return (
    <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 pb-16 pt-28 sm:px-8 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
        <aside className="w-full lg:w-64">
          <nav aria-label="Account" className="flex flex-col gap-2">
            <Link
              href="/profile"
              aria-current="page"
              className="flex min-h-14 items-center justify-between gap-3 whitespace-nowrap border-l-2 border-[#FF5500] bg-[#FF5500]/10 px-3 text-sm font-semibold text-white"
            >
              <span className="flex items-center gap-3 whitespace-nowrap">
                <UserRound aria-hidden="true" className="size-4 shrink-0" />
                <span>Profile</span>
              </span>
            </Link>
            <div
              aria-disabled="true"
              className="flex min-h-14 items-center justify-between gap-3 whitespace-nowrap border-l-2 border-transparent px-3 text-sm text-white/40"
            >
              <span className="flex items-center gap-3 whitespace-nowrap">
                <CalendarDays
                  aria-hidden="true"
                  className="size-4 shrink-0"
                />
                <span>My bookings</span>
              </span>
            </div>
            <SignOutButton />
          </nav>
        </aside>

        <div className="min-w-0 space-y-12">
          <header className="flex flex-wrap items-center gap-5">
            <div
              aria-hidden="true"
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground sm:size-20 sm:text-2xl"
            >
              <span dir="auto">{getInitials(customer.fullName)}</span>
            </div>
            <div className="min-w-0">
              <h1
                dir="auto"
                className="font-cinema-display break-words text-3xl font-bold uppercase text-white sm:text-5xl"
              >
                {customer.fullName}
              </h1>
              <p className="mt-1 text-sm text-white/50">
                Member since {memberSince}
              </p>
            </div>
          </header>

          <section aria-labelledby="profile-details-heading">
            <h2 id="profile-details-heading" className={sectionHeadingClassName}>
              Your details
            </h2>
            <p
              id="profile-readonly-note"
              className="mt-4 text-sm leading-6 text-white/50"
            >
              Profile editing is not available yet. These details come from your
              account service.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-xs font-semibold text-white/75">
                <span>Full name</span>
                <input
                  type="text"
                  value={customer.fullName}
                  readOnly
                  aria-describedby="profile-readonly-note"
                  className={fieldClassName}
                />
              </label>
              <label className="space-y-2 text-xs font-semibold text-white/75">
                <span>Phone</span>
                <input
                  type="text"
                  value={customer.phone ?? "Not provided"}
                  readOnly
                  aria-describedby="profile-readonly-note"
                  className={fieldClassName}
                />
              </label>
              <label className="space-y-2 text-xs font-semibold text-white/75 sm:col-span-2">
                <span>Email</span>
                <span className="relative block">
                  <input
                    type="email"
                    value={customer.email}
                    readOnly
                    aria-describedby="profile-readonly-note"
                    className={`${fieldClassName} pr-28`}
                  />
                  <span
                    className={`absolute inset-y-0 right-3 inline-flex items-center gap-1.5 text-xs ${
                      customer.emailVerified
                        ? "text-emerald-400"
                        : "text-white/45"
                    }`}
                  >
                    <ShieldCheck aria-hidden="true" className="size-4" />
                    {customer.emailVerified ? "Verified" : "Not verified"}
                  </span>
                </span>
              </label>
            </div>
            <button
              type="button"
              disabled
              className="mt-5 min-h-11 cursor-not-allowed bg-white/10 px-5 text-sm font-semibold text-white/40"
            >
              Save changes
            </button>
          </section>

          <section aria-labelledby="saved-cards-heading">
            <h2 id="saved-cards-heading" className={sectionHeadingClassName}>
              Saved cards
            </h2>
            <div className="mt-5 flex items-start gap-4 border border-white/10 bg-white/[0.02] p-4 sm:p-5">
              <CreditCard
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-primary"
              />
              <div>
                <p className="font-semibold text-white">
                  Saved payment methods are unavailable
                </p>
                <p className="mt-1 text-sm leading-6 text-white/50">
                  Card management will appear here when a secure payment
                  provider integration is connected. No card data is stored by
                  this page.
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="change-password-heading">
            <h2 id="change-password-heading" className={sectionHeadingClassName}>
              Change password
            </h2>
            <div className="mt-5 flex items-start gap-4 border border-white/10 bg-white/[0.02] p-4 sm:p-5">
              <LockKeyhole
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-white/45"
              />
              <p className="text-sm leading-6 text-white/55">
                Password changes are unavailable until the account service
                provides a password-update endpoint.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
