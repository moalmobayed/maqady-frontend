"use client";

import type { Theater } from "@/lib/theaters/types";

export type TheaterFilter = "all" | "open" | "parking";

type TheatersFiltersProps = {
  theaters: Theater[];
  selected: TheaterFilter;
  onChange: (filter: TheaterFilter) => void;
};

const filters: { value: TheaterFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open now" },
  { value: "parking", label: "Parking" },
];

function matchesFilter(theater: Theater, filter: TheaterFilter): boolean {
  if (filter === "open") return theater.openState.isOpen;
  if (filter === "parking") {
    return theater.facilities.some((facility) =>
      ["free_parking", "valet_parking", "street_parking"].includes(facility),
    );
  }
  return true;
}

export function getFilteredTheaters(
  theaters: Theater[],
  filter: TheaterFilter,
): Theater[] {
  return theaters.filter((theater) => matchesFilter(theater, filter));
}

export function TheatersFilters({
  theaters,
  selected,
  onChange,
}: TheatersFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter theaters">
      {filters.map((filter) => {
        const count = getFilteredTheaters(theaters, filter.value).length;
        const active = selected === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.value)}
            className={`inline-flex items-center gap-2 border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/20 text-white/75 hover:border-white/50 hover:text-white"
            }`}
          >
            {filter.label}
            <span className={active ? "opacity-75" : "text-white/40"}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
