"use client";

import { useMemo, useState } from "react";
import { EmptyState, ErrorState } from "@/components/ui";
import type { Theater, TheatersLoadError } from "@/lib/theaters/types";
import { MotionReveal } from "@/components/home/motion-reveal";
import { TheaterCard } from "./theater-card";
import { TheatersFilters, type TheaterFilter, getFilteredTheaters } from "./theaters-filters";
import { TheaterMap } from "./theater-map";

const EMPTY_THEATERS: Theater[] = [];
const EMPTY_THEATERS_DATA = { items: EMPTY_THEATERS, total: 0 };

type TheatersPageProps = {
  data: {
    items: Theater[];
    total: number;
    totalHalls?: number;
  } | null;
  error: TheatersLoadError | null;
};

export function TheatersPage({ data, error }: TheatersPageProps) {
  const [filter, setFilter] = useState<TheaterFilter>("all");
  const theaters = data?.items ?? EMPTY_THEATERS_DATA.items;
  const hallCount =
    data?.totalHalls ??
    theaters.reduce((total, theater) => total + theater.hallCount, 0);
  const filteredTheaters = useMemo(
    () => getFilteredTheaters(theaters, filter),
    [filter, theaters],
  );

  return (
    <main className="mx-auto w-full max-w-[1800px] flex-1 px-5 pb-16 pt-32 sm:px-8 lg:px-12">
      <section aria-labelledby="theaters-heading">
        <MotionReveal className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Cairo & Giza · {hallCount} halls
          </p>
          <h1
            id="theaters-heading"
            className="mt-3 font-cinema-display text-6xl font-black uppercase leading-[0.86] tracking-tight sm:text-8xl"
          >
            Theaters
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
            Find a Maqady cinema near you, check opening hours and facilities,
            and continue to the latest showtimes.
          </p>
        </MotionReveal>

        {error ? (
          <div className="mt-10 max-w-2xl">
            <ErrorState
              title="Theaters are unavailable"
              message={error.message}
              action={
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  Try again
                </button>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-white/10 py-3">
              <TheatersFilters
                theaters={theaters}
                selected={filter}
                onChange={setFilter}
              />
              <p className="text-xs uppercase tracking-[0.12em] text-white/45">
                Showing {filteredTheaters.length} of {data?.total ?? 0}
              </p>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
              <div>
                {theaters.length === 0 ? (
                  <EmptyState
                    title="No theaters available"
                    description="There are no cinemas in the directory right now. Please check again shortly."
                  />
                ) : filteredTheaters.length === 0 ? (
                  <EmptyState
                    title="No theaters match this filter"
                    description="Try another view to see more Maqady cinemas."
                    action={
                      <button
                        type="button"
                        onClick={() => setFilter("all")}
                        className="border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                      >
                        Clear filters
                      </button>
                    }
                  />
                ) : (
                  <ul className="space-y-3">
                    {filteredTheaters.map((theater, index) => (
                      <li key={theater.id}>
                        <MotionReveal delay={Math.min(index * 0.05, 0.3)}>
                          <TheaterCard theater={theater} />
                        </MotionReveal>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {theaters.length > 0 && <TheaterMap theaters={theaters} />}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
