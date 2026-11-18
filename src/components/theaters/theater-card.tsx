import Link from "next/link";
import {
  CarFront,
  Clock3,
  MapPin,
  Navigation,
  Phone,
  Ticket,
} from "lucide-react";
import { MediaImage } from "@/components/home/media-image";
import { formatCinemaTime } from "@/lib/home/cinema-time";
import type { Theater } from "@/lib/theaters/types";

const facilityLabels: Record<string, string> = {
  wheelchair_access: "Wheelchair access",
  free_parking: "Free parking",
  valet_parking: "Valet parking",
  street_parking: "Street parking",
  cafe_bar: "Cafe & bar",
  food_court: "Food court",
  kids_room: "Kids room",
  prayer_room: "Prayer room",
};

function getStatusLabel(theater: Theater): string {
  if (theater.openState.isOpen) {
    const closesAt = theater.openState.closesAt
      ? formatCinemaTime(theater.openState.closesAt)
      : "";
    return closesAt ? `Open · until ${closesAt}` : "Open now";
  }

  const nextOpensAt = theater.openState.nextOpensAt
    ? formatCinemaTime(theater.openState.nextOpensAt)
    : "";
  return nextOpensAt ? `Closed · opens ${nextOpensAt}` : "Closed now";
}

function getDirectionsHref(theater: Theater): string | null {
  if (theater.latitude === null || theater.longitude === null) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${theater.latitude},${theater.longitude}`;
}

export function TheaterCard({ theater }: { theater: Theater }) {
  const facilities = theater.facilities
    .map((facility) => facilityLabels[facility])
    .filter((facility): facility is string => Boolean(facility));
  const directionsHref = getDirectionsHref(theater);

  return (
    <article className="grid overflow-hidden border border-[#302b28] bg-[#151313] transition hover:border-[#4a403a] hover:shadow-xl hover:shadow-black/30 sm:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
      <Link
        href={`/theaters/${theater.id}`}
        className="group/image relative block min-h-52 focus-visible:outline-offset-[-3px] sm:min-h-full"
        aria-label={`View ${theater.name} details`}
      >
        <MediaImage
          image={theater.cover}
          alt={theater.cover?.alt || `${theater.name} cinema`}
          className="h-full min-h-52 w-full"
          preferredVariant="medium"
          fallbackLabel="Cinema image unavailable"
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-3 pt-10 text-base font-semibold uppercase tracking-wide text-white transition group-hover/image:text-primary sm:text-lg">
          {theater.name}
        </span>
      </Link>

      <div className="flex min-w-0 flex-col gap-3.5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/theaters/${theater.id}`} className="group/title">
              <h2 className="font-cinema-display text-[1.7rem] uppercase leading-none tracking-tight text-[#f0e8df] group-hover/title:text-primary sm:text-3xl">
                {theater.name}
              </h2>
            </Link>
            <p className="mt-1.5 text-sm uppercase tracking-[0.12em] text-white/50">
              {theater.district}, {theater.city}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold tracking-wide ${
              theater.openState.isOpen
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-white/15 bg-white/5 text-white/55"
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${
                theater.openState.isOpen ? "bg-emerald-400" : "bg-white/35"
              }`}
            />
            {getStatusLabel(theater)}
          </span>
        </div>

        <div className="space-y-2.5 text-sm leading-6 text-[#d3cbc3]">
          <p className="flex items-start gap-2">
            <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />
            <span>
              {theater.address}
              {theater.postalCode ? ` · ${theater.postalCode}` : ""}
            </span>
          </p>
          {theater.today?.opens && theater.today.closes && (
            <p className="flex items-center gap-2">
              <Clock3 aria-hidden="true" className="size-4 shrink-0" />
              <span>
                Today {theater.today.opens}–{theater.today.closes}
                {theater.today.closesNextDay ? " · next day" : ""}
              </span>
            </p>
          )}
          {theater.mainPhone?.number && (
            <p className="flex items-center gap-2">
              <Phone aria-hidden="true" className="size-4 shrink-0" />
              <a
                href={`tel:${theater.mainPhone.number}`}
                className="font-mono underline-offset-2 hover:text-white hover:underline"
              >
                {theater.mainPhone.number}
              </a>
            </p>
          )}
        </div>

        {(theater.hallCount > 0 || facilities.length > 0) && (
          <ul className="flex flex-wrap gap-1.5 border-t border-[#302b28] pt-3.5 text-xs text-[#d3cbc3]">
            {theater.hallCount > 0 && (
              <li className="inline-flex items-center gap-1.5 border border-[#3b3531] px-3 py-1.5">
                <Ticket aria-hidden="true" className="size-3.5" />
                {theater.hallCount} {theater.hallCount === 1 ? "hall" : "halls"}
              </li>
            )}
            {facilities.slice(0, 4).map((facility) => (
              <li key={facility} className="border border-[#3b3531] px-3 py-1.5">
                {facility}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <Link
            href={`/theaters/${theater.id}`}
            className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-accent"
          >
            Showtimes & info <span aria-hidden="true">→</span>
          </Link>
          {directionsHref && (
            <a
              href={directionsHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-[#514943] px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:border-white/60 hover:text-white"
            >
              <Navigation aria-hidden="true" className="size-3" />
              Directions
            </a>
          )}
          {theater.mainPhone?.number && (
            <a
              href={`tel:${theater.mainPhone.number}`}
              aria-label={`Call ${theater.name}`}
              className="inline-flex items-center justify-center border border-[#514943] px-3 py-2.5 text-white/85 transition hover:border-white/60 hover:text-white"
            >
              <Phone aria-hidden="true" className="size-4" />
            </a>
          )}
          {theater.facilities.some((facility) =>
            ["free_parking", "valet_parking", "street_parking"].includes(facility),
          ) && (
            <span className="sr-only">
              <CarFront aria-hidden="true" />
              Parking available
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
