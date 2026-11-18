import Link from "next/link";
import { Phone } from "lucide-react";
import { SignInLink } from "@/components/auth/sign-in-link";
import type { Cinema } from "@/lib/home/types";
import { MotionReveal } from "./motion-reveal";

type CustomerFooterProps = {
  cinemas: Cinema[];
};

const linkClass =
  "text-sm text-white/75 transition-colors hover:text-white focus-visible:text-white";
const headingClass =
  "mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45";

export function CustomerFooter({ cinemas }: CustomerFooterProps) {
  const cities = [...new Set(cinemas.map((cinema) => cinema.city))];
  const cityDescription =
    cities.length > 1
      ? `${cities.slice(0, -1).join(", ")} and ${cities.at(-1)}`
      : cities[0] || "Egypt";
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0b0a09]">
      <MotionReveal className="mx-auto w-full max-w-[1800px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-x-8 gap-y-10 py-10 sm:grid-cols-2 sm:py-12 lg:grid-cols-[minmax(19rem,1.8fr)_minmax(7rem,0.65fr)_minmax(7rem,0.7fr)_minmax(13rem,1.35fr)] lg:gap-x-10 lg:py-16">
          <div className="max-w-md sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label="Maqady Cinema home"
              className="font-cinema-display inline-block text-4xl font-black uppercase leading-none tracking-[0.16em] text-white"
            >
              MAQADY
            </Link>
            <p className="mt-5 max-w-sm text-base leading-[1.65] text-white/65">
              {cinemas.length > 0
                ? `${cinemas.length} ${cinemas.length === 1 ? "cinema" : "cinemas"} across ${cityDescription}. Browse movies and find your next showtime.`
                : `Browse movies and explore Maqady cinemas across ${cityDescription}.`}
            </p>
          </div>

          <nav aria-labelledby="footer-explore-heading">
            <h2 id="footer-explore-heading" className={headingClass}>
              Explore
            </h2>
            <ul className="space-y-2.5">
              <li>
                <Link href="/movies" className={linkClass}>
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/theaters" className={linkClass}>
                  Theaters
                </Link>
              </li>
              <li>
                <Link href="/movies?status=coming_soon" className={linkClass}>
                  Coming soon
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-account-heading">
            <h2 id="footer-account-heading" className={headingClass}>
              Account
            </h2>
            <ul className="space-y-2.5">
              <li>
                <SignInLink className={linkClass} />
              </li>
            </ul>
          </nav>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-5 sm:col-span-2 sm:gap-x-8 lg:col-span-1">
            <nav aria-labelledby="footer-cinemas-heading">
              <h2 id="footer-cinemas-heading" className={headingClass}>
                Cinemas
              </h2>
              {cinemas.length > 0 ? (
                <ul className="space-y-2.5">
                  {cinemas.map((cinema) => (
                    <li key={cinema.id} className="min-h-6">
                      <Link
                        href={`/theaters/${cinema.id}`}
                        className={linkClass}
                      >
                        {cinema.district}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <Link href="/theaters" className={linkClass}>
                  All theaters
                </Link>
              )}
            </nav>

            <address className="not-italic">
              <h2 className={headingClass}>Contact</h2>
              {cinemas.length > 0 ? (
                <ul className="space-y-2.5">
                  {cinemas.map((cinema) => (
                    <li
                      key={cinema.id}
                      className="flex min-h-6 items-center justify-end"
                    >
                      {cinema.mainPhone?.number.trim() ? (
                        <a
                          href={`tel:${cinema.mainPhone.number}`}
                          className="inline-flex items-center gap-2 text-xs text-white/65 transition-colors hover:text-white"
                          aria-label={`Call ${cinema.name}: ${cinema.mainPhone.number}`}
                        >
                          <Phone
                            aria-hidden="true"
                            className="size-3.5 shrink-0"
                          />
                          <span className="whitespace-nowrap font-mono">
                            {cinema.mainPhone.number}
                          </span>
                        </a>
                      ) : (
                        <span className="text-xs text-white/40">
                          Phone unavailable
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <Link href="/theaters" className={linkClass}>
                  Find a cinema
                </Link>
              )}
            </address>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:py-6">
          <p>© {new Date().getFullYear()} Maqady Cinemas. All rights reserved.</p>
          <Link href="/theaters" className={linkClass}>
            Explore all cinemas
          </Link>
        </div>
      </MotionReveal>
    </footer>
  );
}
