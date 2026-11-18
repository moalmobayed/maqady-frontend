"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";
import type { Theater } from "@/lib/theaters/types";

type MapBounds = {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
};

function getMapBounds(theaters: Theater[]): MapBounds | null {
  const mappedTheaters = theaters.filter(
    (theater) => theater.latitude !== null && theater.longitude !== null,
  );
  if (mappedTheaters.length === 0) return null;

  const latitudes = mappedTheaters.map((theater) => theater.latitude as number);
  const longitudes = mappedTheaters.map((theater) => theater.longitude as number);
  const latitudePadding = Math.max(
    (Math.max(...latitudes) - Math.min(...latitudes)) * 0.08,
    0.01,
  );
  const longitudePadding = Math.max(
    (Math.max(...longitudes) - Math.min(...longitudes)) * 0.08,
    0.01,
  );

  return {
    minLatitude: Math.min(...latitudes) - latitudePadding,
    maxLatitude: Math.max(...latitudes) + latitudePadding,
    minLongitude: Math.min(...longitudes) - longitudePadding,
    maxLongitude: Math.max(...longitudes) + longitudePadding,
  };
}

function getMarkerPosition(theater: Theater, bounds: MapBounds | null) {
  if (theater.latitude === null || theater.longitude === null) return null;
  if (!bounds) return null;

  const left =
    ((theater.longitude - bounds.minLongitude) /
      (bounds.maxLongitude - bounds.minLongitude)) *
    100;
  const top =
    (1 -
      (theater.latitude - bounds.minLatitude) /
        (bounds.maxLatitude - bounds.minLatitude)) *
    100;

  return {
    left: `${Math.min(94, Math.max(6, left))}%`,
    top: `${Math.min(88, Math.max(12, top))}%`,
  };
}

function getMapEmbedUrl(
  theaters: Theater[],
  selectedTheater: Theater | null,
  requestedZoom: number | null,
): string | null {
  const mappedTheaters = theaters.filter(
    (theater) => theater.latitude !== null && theater.longitude !== null,
  );
  if (mappedTheaters.length === 0) return null;

  const latitudes = mappedTheaters.map((theater) => theater.latitude as number);
  const longitudes = mappedTheaters.map((theater) => theater.longitude as number);
  const centerLatitude =
    selectedTheater?.latitude ??
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const centerLongitude =
    selectedTheater?.longitude ??
    (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
  const latitudeSpan = Math.max(Math.max(...latitudes) - Math.min(...latitudes), 0.04);
  const longitudeSpan = Math.max(Math.max(...longitudes) - Math.min(...longitudes), 0.04);
  const defaultZoom = Math.max(
    10,
    Math.min(
      13,
      Math.round(Math.log2(360 / Math.max(latitudeSpan, longitudeSpan))),
    ),
  );
  const zoom = requestedZoom ?? (selectedTheater ? 16 : defaultZoom);

  return `https://www.google.com/maps?q=${encodeURIComponent(
    `${centerLatitude},${centerLongitude}`,
  )}&z=${zoom}&output=embed`;
}

export function TheaterMap({ theaters }: { theaters: Theater[] }) {
  const mappedTheaters = theaters.filter(
    (theater) => theater.latitude !== null && theater.longitude !== null,
  );
  const [selectedTheaterId, setSelectedTheaterId] = useState<number | null>(null);
  const [mapZoom, setMapZoom] = useState<number | null>(null);
  const selectedTheater =
    mappedTheaters.find((theater) => theater.id === selectedTheaterId) ?? null;
  const mapBounds = getMapBounds(theaters);
  const mapEmbedUrl = getMapEmbedUrl(theaters, selectedTheater, mapZoom);

  function zoomMap(amount: number) {
    setMapZoom((currentZoom) => {
      const baseZoom = currentZoom ?? (selectedTheater ? 16 : 11);
      return Math.max(2, Math.min(19, baseZoom + amount));
    });
  }

  function showAllTheaters() {
    setSelectedTheaterId(null);
    setMapZoom(null);
  }

  return (
    <aside className="border border-white/10 bg-[#11100f] lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Find your cinema
          </p>
          <h2 className="mt-1 font-cinema-display text-2xl uppercase">
            Locations
          </h2>
        </div>
        <span className="text-xs text-white/45">{mappedTheaters.length} locations</span>
      </div>
      <div
        className="relative min-h-[30rem] overflow-hidden bg-[#171513]"
        aria-label="Theater locations map"
      >
        {mapEmbedUrl ? (
          <iframe
            title="Maqady theater locations"
            src={mapEmbedUrl}
            className="absolute inset-0 h-full min-h-[30rem] w-full border-0 grayscale-[0.25] contrast-[0.9]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex min-h-[30rem] items-center justify-center p-6 text-center text-sm text-white/55">
            Theater coordinates are not available.
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        <div className="absolute left-4 top-4 z-20 flex flex-col overflow-hidden border border-white/20 bg-[#11100f]/90 shadow-lg backdrop-blur-sm">
          <button
            type="button"
            onClick={() => zoomMap(1)}
            className="flex size-10 items-center justify-center border-b border-white/15 text-2xl leading-none text-white transition hover:bg-white/10 hover:text-primary"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomMap(-1)}
            className="flex size-10 items-center justify-center text-2xl leading-none text-white transition hover:bg-white/10 hover:text-primary"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>
        <button
          type="button"
          onClick={showAllTheaters}
          className="absolute right-4 top-4 z-20 inline-flex h-10 items-center gap-2 border border-white/20 bg-[#11100f]/90 px-3 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-white/10 hover:text-primary"
        >
          <MapPin aria-hidden="true" className="size-4" />
          Show all
        </button>
        <p className="absolute left-4 top-24 z-10 max-w-56 text-xs leading-5 text-white drop-shadow">
          {selectedTheater
            ? `Showing ${selectedTheater.name} on the map.`
            : "Select a marker to zoom to a cinema."}
        </p>
        <div className="absolute inset-0">
          {mappedTheaters.map((theater) => {
            if (selectedTheater && theater.id !== selectedTheater.id) return null;
            const position = selectedTheater
              ? { left: "50%", top: "50%" }
              : getMarkerPosition(theater, mapBounds);
            if (!position) return null;
            const selected = theater.id === selectedTheaterId;

            return (
              <button
                key={theater.id}
                type="button"
                onClick={() => {
                  setSelectedTheaterId(selected ? null : theater.id);
                  setMapZoom(null);
                }}
                style={position}
                className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                aria-label={`${theater.name}: ${theater.address}`}
                aria-pressed={selected}
              >
                <span
                  className={`relative flex items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg shadow-black/40 transition group-hover:scale-125 group-focus-visible:scale-125 ${
                    selected ? "size-10 ring-4 ring-primary/40" : "size-7"
                  }`}
                >
                  <MapPin aria-hidden="true" className="size-4" />
                </span>
                <span
                  className={`pointer-events-none absolute bottom-9 left-1/2 w-48 -translate-x-1/2 border border-white/15 bg-[#11100f]/95 p-2 text-left shadow-xl ${
                    selected
                      ? "block"
                      : "hidden group-hover:block group-focus-visible:block"
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-primary">
                    {theater.name}
                  </span>
                  <span className="mt-1 block text-[10px] leading-4 text-white/70">
                    {theater.address}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-3 border border-white/10 bg-[#11100f]/90 px-3 py-2 text-[10px] leading-4 text-white/70 backdrop-blur-sm">
          <span>
            {selectedTheater
              ? selectedTheater.address
              : "Click a marker to zoom in and view its address."}
          </span>
          {selectedTheater && (
            <a
              href={`/theaters/${selectedTheater.id}`}
              className="shrink-0 text-primary hover:text-accent"
            >
              Details →
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
