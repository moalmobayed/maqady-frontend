"use client";

import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState, type FormEventHandler } from "react";
import type { Genre, MovieStatus } from "@/lib/home/types";
import type {
  MovieCatalogPage,
  MoviePerson,
  MovieShowDate,
} from "@/lib/movies/types";
import { MoviesFiltersSidebar } from "./movies-filters-sidebar";
import { MoviesGrid } from "./movies-grid";
import {
  listingHref,
  showDateOptions,
  type MovieQueryState,
} from "./movies-utils";

type MoviesContentProps = {
  status: MovieStatus;
  query: string;
  genres: Genre[];
  people: MoviePerson[];
  peopleError: string | null;
  selectedGenres: string[];
  selectedShowDate: MovieShowDate;
  selectedCastId: number | null;
  catalog: MovieCatalogPage | null;
  error: string | null;
  searchValue: string;
  items: MovieCatalogPage["items"];
  hasMore: boolean;
  hasAppliedCriteria: boolean;
  loadingMore: boolean;
  filterPending: boolean;
  loadMoreError: string | null;
  onSearchValueChange: (value: string) => void;
  onSubmitSearch: FormEventHandler<HTMLFormElement>;
  onNavigate: (next: Partial<MovieQueryState>) => void;
  onClearAllFilters: () => void;
  onClearQuery: () => void;
  onClearSearchAndFilters: () => void;
  onLoadMore: () => void;
  onRetry: () => void;
};

export function MoviesContent({
  status,
  query,
  genres,
  people,
  peopleError,
  selectedGenres,
  selectedShowDate,
  selectedCastId,
  catalog,
  error,
  searchValue,
  items,
  hasMore,
  hasAppliedCriteria,
  loadingMore,
  filterPending,
  loadMoreError,
  onSearchValueChange,
  onSubmitSearch,
  onNavigate,
  onClearAllFilters,
  onClearQuery,
  onClearSearchAndFilters,
  onLoadMore,
  onRetry,
}: MoviesContentProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const selectedGenreNames = selectedGenres
    .map((slug) => genres.find((genre) => genre.slug === slug))
    .filter((genre): genre is Genre => Boolean(genre));
  const selectedCast = people.find((person) => person.id === selectedCastId);
  const activeFilters =
    selectedGenres.length +
    Number(selectedCastId !== null) +
    Number(selectedShowDate !== "any");
  const currentState: MovieQueryState = {
    status,
    query,
    genres: selectedGenres,
    showDate: selectedShowDate,
    castId: selectedCastId,
  };

  function toggleGenre(slug: string) {
    const nextGenres = selectedGenres.includes(slug)
      ? selectedGenres.filter((genre) => genre !== slug)
      : [...selectedGenres, slug];
    onNavigate({ genres: nextGenres });
  }

  function selectCast(castId: number) {
    onNavigate({ castId: selectedCastId === castId ? null : castId });
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <main className="mx-auto w-full max-w-[1800px] flex-1 px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-6 lg:pt-[175px]">
        <header className="mb-10 sm:mb-12 lg:mb-[54px]">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            Maqady cinema
          </p>
          <div className="mt-1 flex items-end justify-between gap-6">
            <h1 className="font-cinema-display text-6xl font-bold uppercase leading-[0.9] tracking-[0.02em] text-white sm:text-7xl lg:text-[8rem]">
              Movies
            </h1>
            <p className="mb-2 hidden shrink-0 text-sm text-white/60 sm:block">
              Newest releases first
            </p>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
            Find your next movie night, from what&apos;s showing now to what&apos;s
            coming soon.
          </p>
        </header>

        <nav
          aria-label="Filter movies by release status"
          className="mb-7 flex gap-8 border-b border-white/10 sm:gap-10"
        >
          {(
            [
              ["now_showing", "Now showing", catalog?.tabCounts.nowShowing],
              ["coming_soon", "Coming soon", catalog?.tabCounts.comingSoon],
            ] as const
          ).map(([value, label, count]) => {
            const active = status === value;
            return (
              <Link
                key={value}
                href={listingHref({ ...currentState, status: value })}
                aria-current={active ? "page" : undefined}
                style={{
                  borderBottomColor: active ? "var(--primary)" : "transparent",
                }}
                className={`-mb-px inline-flex items-baseline gap-2 border-b-[3px] px-0 pb-4 font-cinema-display text-2xl font-normal uppercase tracking-wide transition-colors sm:text-3xl ${
                  active ? "text-white" : "text-white/50 hover:text-white"
                }`}
              >
                {label}
                {count !== undefined && (
                  <span
                    className={`font-sans text-xs font-medium ${
                      active ? "text-primary" : "text-white/55"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <section aria-label="Movie search and filters" className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form
              role="search"
              onSubmit={onSubmitSearch}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-white/15 bg-[#171719] px-4 py-3 focus-within:border-white/35"
            >
              <Search
                aria-hidden="true"
                className="size-4 shrink-0 text-white/45"
              />
              <label htmlFor="movie-search" className="sr-only">
                Search movies by title
              </label>
              <input
                id="movie-search"
                type="search"
                value={searchValue}
                onChange={(event) => onSearchValueChange(event.target.value)}
                maxLength={100}
                placeholder="Search by title"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={onClearQuery}
                  aria-label="Clear movie search"
                  className="rounded p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              )}
              <button
                type="submit"
                className="rounded-sm bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                Search
              </button>
            </form>
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              aria-controls="movie-filter-panel"
              aria-expanded={filterOpen}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/5 min-[1200px]:hidden"
            >
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              Filters
              {activeFilters > 0 && (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>
        </section>

        <div className="min-[1200px]:grid min-[1200px]:grid-cols-[280px_minmax(0,1fr)] min-[1200px]:items-start min-[1200px]:gap-10">
          <MoviesFiltersSidebar
            isOpen={filterOpen}
            genres={genres}
            selectedGenres={selectedGenres}
            people={people}
            peopleError={peopleError}
            selectedShowDate={selectedShowDate}
            selectedCastId={selectedCastId}
            onToggleGenre={toggleGenre}
            onSelectShowDate={(showDate) => onNavigate({ showDate })}
            onSelectCast={selectCast}
            onClearAll={onClearAllFilters}
            filterPending={filterPending}
          />
          <div className="min-w-0">
            {(query ||
              selectedGenreNames.length > 0 ||
              selectedShowDate !== "any" ||
              selectedCastId !== null) && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs text-white/50">Filtered by</span>
                {query && (
                  <button
                    type="button"
                    onClick={onClearQuery}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:border-white/30"
                  >
                    Title: {query}
                    <X aria-hidden="true" className="size-3" />
                  </button>
                )}
                {selectedGenreNames.map((genre) => (
                  <button
                    key={genre.slug}
                    type="button"
                    onClick={() =>
                      onNavigate({
                        genres: selectedGenres.filter(
                          (slug) => slug !== genre.slug,
                        ),
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:border-white/30"
                  >
                    {genre.name}
                    <X aria-hidden="true" className="size-3" />
                  </button>
                ))}
                {selectedShowDate !== "any" && (
                  <button
                    type="button"
                    onClick={() => onNavigate({ showDate: "any" })}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:border-white/30"
                  >
                    {
                      showDateOptions.find(
                        (option) => option.value === selectedShowDate,
                      )?.label
                    }
                    <X aria-hidden="true" className="size-3" />
                  </button>
                )}
                {selectedCast && (
                  <button
                    type="button"
                    onClick={() => selectCast(selectedCast.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:border-white/30"
                  >
                    Cast: {selectedCast.fullName}
                    <X aria-hidden="true" className="size-3" />
                  </button>
                )}
                {activeFilters > 0 && (
                  <button
                    type="button"
                    onClick={onClearAllFilters}
                    className="ml-1 text-xs font-semibold text-primary hover:text-accent"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
            <MoviesGrid
              status={status}
              catalog={catalog}
              items={items}
              error={error}
              hasAppliedCriteria={hasAppliedCriteria}
              hasMore={hasMore}
              loadingMore={loadingMore}
              loadMoreError={loadMoreError}
              onLoadMore={onLoadMore}
              onRetry={onRetry}
              onClearSearchAndFilters={onClearSearchAndFilters}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
