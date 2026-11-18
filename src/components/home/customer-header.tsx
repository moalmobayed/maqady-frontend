"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { SignInLink } from "@/components/auth/sign-in-link";
import { MotionReveal } from "./motion-reveal";

const navigation = [
  { href: "/movies", label: "Movies" },
  { href: "/theaters", label: "Theaters" },
  { href: "/movies?status=coming_soon", label: "Coming Soon" },
];

function NavigationLinks({
  activeHref,
  onNavigate,
}: {
  activeHref: string | null;
  onNavigate: () => void;
}) {
  return navigation.map((item) => {
    const active = item.href === activeHref;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`relative inline-flex rounded-none px-3 py-2 text-xs font-semibold uppercase tracking-wider transition after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:bg-primary after:transition-transform md:px-0 md:after:inset-x-0 ${
          active
            ? "text-white after:scale-x-100"
            : "text-white/75 after:scale-x-0 after:origin-left hover:text-white hover:after:scale-x-100"
        }`}
      >
        {item.label}
      </Link>
    );
  });
}

function CurrentNavigationLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  const searchParams = useSearchParams();
  const activeHref =
    pathname === "/movies" || pathname.startsWith("/movies/")
      ? pathname === "/movies" &&
        searchParams.get("status") === "coming_soon"
        ? "/movies?status=coming_soon"
        : "/movies"
      : pathname === "/theaters" || pathname.startsWith("/theaters/")
        ? "/theaters"
        : null;

  return (
    <NavigationLinks activeHref={activeHref} onNavigate={onNavigate} />
  );
}

function AccountNavigationLink({
  isAuthenticated,
  pathname,
  onNavigate,
  className,
}: {
  isAuthenticated: boolean;
  pathname: string;
  onNavigate?: () => void;
  className: string;
}) {
  if (!isAuthenticated) {
    return <SignInLink onNavigate={onNavigate} className={className} />;
  }

  return (
    <Link
      href="/profile"
      onClick={onNavigate}
      aria-current={pathname === "/profile" ? "page" : undefined}
      className={className}
    >
      <UserRound aria-hidden="true" className="size-4" />
      <span>Profile</span>
    </Link>
  );
}

export function CustomerHeader({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const wasSearchOpen = useRef(false);
  const fallbackActiveHref =
    pathname === "/movies" || pathname.startsWith("/movies/")
      ? "/movies"
      : pathname === "/theaters" || pathname.startsWith("/theaters/")
        ? "/theaters"
        : null;

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
      wasSearchOpen.current = true;
    } else if (wasSearchOpen.current) {
      searchTriggerRef.current?.focus();
      wasSearchOpen.current = false;
    }
  }, [searchOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();
    if (!query) return;

    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/movies?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="absolute inset-x-0 top-0 z-30 border-b border-white/10 bg-gradient-to-b from-black/75 to-black/10 text-white backdrop-blur-[2px]">
      <MotionReveal className="mx-auto w-full max-w-[1800px]">
      <div className="flex min-h-18 items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-12">
        <Link
          href="/"
          aria-label="Maqady Cinema home"
          className="font-cinema-display shrink-0 text-2xl font-black uppercase tracking-[0.12em] text-white sm:text-3xl"
        >
          MAQADY<span className="text-primary">.</span>
        </Link>

        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-1 border-b border-white/10 bg-black/95 p-4 shadow-xl md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          <Suspense
            fallback={
              <NavigationLinks
                activeHref={fallbackActiveHref}
                onNavigate={() => setMenuOpen(false)}
              />
            }
          >
            <CurrentNavigationLinks
              pathname={pathname}
              onNavigate={() => setMenuOpen(false)}
            />
          </Suspense>
          <AccountNavigationLink
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            onNavigate={() => setMenuOpen(false)}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:text-white md:hidden"
          />
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            ref={searchTriggerRef}
            type="button"
            aria-expanded={searchOpen}
            aria-controls={searchOpen ? "site-search" : undefined}
            onClick={() => setSearchOpen((open) => !open)}
            className="rounded-md border border-white/20 bg-black/25 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/90 transition hover:border-white/50 hover:bg-black/50"
          >
            Search
          </button>
          <AccountNavigationLink
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            className="hidden items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-accent md:inline-flex"
          />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-white/25 text-sm font-semibold md:hidden"
          >
            {menuOpen ? (
              <span aria-hidden="true" className="text-2xl leading-none">
                ×
              </span>
            ) : (
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
        </MotionReveal>

      {searchOpen && (
        <form
          id="site-search"
          onSubmit={submitSearch}
          className="mx-auto flex w-full max-w-[1800px] gap-2 px-5 pb-4 sm:px-8 lg:px-12"
          role="search"
        >
          <label htmlFor="home-search" className="sr-only">
            Search movies
          </label>
          <input
            ref={searchInputRef}
            id="home-search"
            name="q"
            type="search"
            required
            placeholder="Search movies"
            onKeyDown={(event) => {
              if (event.key === "Escape") setSearchOpen(false);
            }}
            className="min-w-0 flex-1 rounded-md border border-white/20 bg-black/70 px-4 py-2 text-sm text-white placeholder:text-white/50"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-accent"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            Close
          </button>
        </form>
      )}
    </header>
  );
}
