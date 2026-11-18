import { LoaderCircle, RotateCcw } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { MediaImage } from "@/components/home/media-image";
import type { Genre } from "@/lib/home/types";
import type { MoviePerson, MovieShowDate } from "@/lib/movies/types";
import { initials, showDateOptions } from "./movies-utils";

const avatarColors = [
  "#49332a",
  "#263842",
  "#303c2a",
  "#482c3b",
  "#342b49",
  "#453b2d",
];

type MoviesFiltersSidebarProps = {
  isOpen: boolean;
  genres: Genre[];
  selectedGenres: string[];
  people: MoviePerson[];
  peopleError: string | null;
  selectedShowDate: MovieShowDate;
  selectedCastId: number | null;
  onToggleGenre: (slug: string) => void;
  onSelectShowDate: (showDate: MovieShowDate) => void;
  onSelectCast: (castId: number) => void;
  onClearAll: () => void;
  filterPending: boolean;
};

export function MoviesFiltersSidebar({
  isOpen,
  genres,
  selectedGenres,
  people,
  peopleError,
  selectedShowDate,
  selectedCastId,
  onToggleGenre,
  onSelectShowDate,
  onSelectCast,
  onClearAll,
  filterPending,
}: MoviesFiltersSidebarProps) {
  const [isCastSearchOpen, setIsCastSearchOpen] = useState(false);
  const [castSearch, setCastSearch] = useState("");
  const deferredCastSearch = useDeferredValue(castSearch);
  const normalizedCastSearch = deferredCastSearch.trim().toLocaleLowerCase();
  const castSearchPending = deferredCastSearch !== castSearch;
  const filteredPeople = normalizedCastSearch
    ? people.filter((person) =>
        person.fullName.toLocaleLowerCase().includes(normalizedCastSearch),
      )
    : [];

  return (
    <section
      id="movie-filter-panel"
      aria-labelledby="movie-filter-heading"
      className={`${isOpen ? "block" : "hidden"} mt-5 rounded-md border border-white/10 bg-[#171719] p-5 min-[1200px]:sticky min-[1200px]:top-6 min-[1200px]:mt-0 min-[1200px]:block min-[1200px]:p-6`}
      aria-busy={filterPending || castSearchPending}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2
            id="movie-filter-heading"
            className="text-base font-semibold text-white"
          >
            Filters
          </h2>
          <p className="mt-1 text-xs text-white/50">
            Selections update movie results.
          </p>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Genres</legend>
        <div className="mt-3 grid grid-cols-2 gap-2 min-[1200px]:grid-cols-1">
          {genres.map((genre) => {
            const checked = selectedGenres.includes(genre.slug);
            return (
              <label
                key={genre.id}
                className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition ${
                  checked
                    ? "border-primary/60 bg-primary/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleGenre(genre.slug)}
                  className="size-4 accent-primary"
                />
                {genre.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-7 min-w-0">
        <legend className="font-cinema-display text-xl uppercase tracking-wide">
          Show date
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {showDateOptions.map((date) => {
            const selected = selectedShowDate === date.value;
            return (
              <button
                key={date.value}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectShowDate(date.value)}
                className={`min-h-10 border px-3 text-sm font-medium transition ${
                  selected
                    ? "border-[#f5f0e9] bg-[#f5f0e9] text-[#17110d]"
                    : "border-white/20 text-white hover:border-white/50"
                }`}
              >
                {date.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-7">
        <legend className="font-cinema-display text-xl uppercase tracking-wide">
          Cast
        </legend>
        <div className="mt-3 min-w-0 space-y-3">
          {!isCastSearchOpen ? (
            <button
              type="button"
              onClick={() => setIsCastSearchOpen(true)}
              className="flex min-h-11 w-full items-center justify-center border border-white/20 px-3 text-sm text-white transition hover:border-white/50"
            >
              Search cast by name
            </button>
          ) : (
            <>
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
                <input
                  type="search"
                  value={castSearch}
                  onChange={(event) => setCastSearch(event.target.value)}
                  placeholder="Type an actor name"
                  aria-label="Search cast by name"
                  autoFocus
                  className="min-h-11 min-w-0 flex-1 border border-white/20 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCastSearch("");
                    setIsCastSearchOpen(false);
                  }}
                  className="min-h-11 shrink-0 border border-white/20 px-3 text-xs text-white/70 transition hover:border-white/50 hover:text-white"
                >
                  Close
                </button>
              </div>
              {castSearchPending ? (
                <div className="flex items-center gap-2 py-2 text-xs text-white/60">
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                  Searching cast...
                </div>
              ) : normalizedCastSearch ? (
                <div className="flex min-w-0 flex-col gap-2">
                  {filteredPeople.map((person, index) => {
                    const selected = selectedCastId === person.id;
                    return (
                      <button
                        key={person.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onSelectCast(person.id)}
                        className={`flex min-h-11 w-full min-w-0 items-center gap-2 border py-1 pl-1 pr-3 text-left text-sm transition ${
                          selected
                            ? "border-primary/70 bg-primary/10 text-white"
                            : "border-white/20 text-white hover:border-white/50"
                        }`}
                      >
                        {person.photo ? (
                          <MediaImage
                            image={person.photo}
                            alt={person.fullName}
                            preferredVariant="small"
                            fallbackLabel={initials(person.fullName)}
                            className="size-8 shrink-0 rounded-full"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            style={{
                              backgroundColor:
                                avatarColors[index % avatarColors.length],
                            }}
                            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white/90"
                          >
                            {initials(person.fullName)}
                          </span>
                        )}
                        <span className="truncate">{person.fullName}</span>
                      </button>
                    );
                  })}
                  {filteredPeople.length === 0 && (
                    <p className="text-xs text-white/50">
                      No cast members match that name.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-white/50">
                  Type an actor&apos;s name to search.
                </p>
              )}
            </>
          )}
          {peopleError && (
            <p role="alert" className="text-xs text-destructive">
              {peopleError}
            </p>
          )}
          {!peopleError && people.length === 0 && (
            <p className="text-xs text-white/50">
              No cast members are available.
            </p>
          )}
          {filterPending && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              Updating movie results...
            </div>
          )}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={onClearAll}
        className="mt-7 flex min-h-[60px] w-full items-center justify-center gap-3 border border-white/20 text-base font-semibold text-white/75 transition hover:border-white/40 hover:text-white"
      >
        <RotateCcw aria-hidden="true" className="size-4" />
        Clear all filters
      </button>
    </section>
  );
}
