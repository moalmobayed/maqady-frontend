"use client";

import Link from "next/link";
import { Clock3, Mail, MapPin, Navigation, Phone, UserRound, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { MediaImage } from "@/components/home/media-image";
import { ErrorState, EmptyState } from "@/components/ui";
import { formatCinemaTime } from "@/lib/home/cinema-time";
import type { TheaterDetails, TheaterShowtimes } from "@/lib/theaters/types";

const facilityLabels: Record<string, string> = {
  wheelchair_access: "Wheelchair access", free_parking: "Free parking",
  valet_parking: "Valet parking", street_parking: "Street parking",
  cafe_bar: "Cafe & bar", food_court: "Food court", kids_room: "Kids room",
  prayer_room: "Prayer room",
};
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function money(value: { amount: number; currency: string }) {
  return new Intl.NumberFormat("en", { style: "currency", currency: value.currency, maximumFractionDigits: 2 }).format(value.amount / 100);
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

function dateTabParts(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  return {
    weekday: new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(date),
    day: new Intl.DateTimeFormat("en", { day: "numeric", timeZone: "UTC" }).format(date),
  };
}

function status(theater: TheaterDetails) {
  if (theater.openState.isOpen) {
    const time = theater.openState.closesAt ? formatCinemaTime(theater.openState.closesAt) : "";
    return time ? `Open now · until ${time}` : "Open now";
  }
  const time = theater.openState.nextOpensAt ? formatCinemaTime(theater.openState.nextOpensAt) : "";
  return time ? `Closed · opens ${time}` : "Closed now";
}

function getLocationMapUrl(theater: TheaterDetails) {
  if (theater.latitude === null || theater.longitude === null) return null;

  return `https://www.google.com/maps?q=${encodeURIComponent(
    `${theater.latitude},${theater.longitude}`,
  )}&z=16&output=embed`;
}

function formatCoordinates(theater: TheaterDetails) {
  if (theater.latitude === null || theater.longitude === null) return null;

  const latitudeDirection = theater.latitude >= 0 ? "N" : "S";
  const longitudeDirection = theater.longitude >= 0 ? "E" : "W";

  return `${Math.abs(theater.latitude).toFixed(4)}° ${latitudeDirection}, ${Math.abs(theater.longitude).toFixed(4)}° ${longitudeDirection}`;
}

function formatHours(hour: { closed: boolean; opens: string | null; closes: string | null; closesNextDay: boolean }) {
  if (hour.closed) return "Closed";
  return `${hour.opens ?? "--:--"} – ${hour.closes ?? "--:--"}${hour.closesNextDay ? " · next day" : ""}`;
}

function contactIcon(label: string) {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel.includes("mail")) return <Mail aria-hidden="true" className="size-4 text-primary" />;
  if (normalizedLabel.includes("whatsapp")) return <span aria-hidden="true" className="text-sm text-primary">◌</span>;
  return normalizedLabel.includes("manager") ? <UserRound aria-hidden="true" className="size-4 text-primary" /> : <Phone aria-hidden="true" className="size-4 text-primary" />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border border-white/10 bg-[#151313] p-5 sm:p-6" aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}><h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`} className="font-cinema-display text-2xl uppercase tracking-wide text-[#f0e8df]">{title}</h2><div className="mt-5">{children}</div></section>;
}

export function TheaterDetailsPage({ theater, showtimes, showtimesError }: { theater: TheaterDetails; showtimes: TheaterShowtimes | null; showtimesError: string | null }) {
  const [selectedDate, setSelectedDate] = useState(showtimes?.days[0]?.cinemaDate ?? theater.today?.cinemaDate ?? "");
  const selectedDay = useMemo(() => showtimes?.days.find((day) => day.cinemaDate === selectedDate), [selectedDate, showtimes]);
  const directions = theater.latitude !== null && theater.longitude !== null
    ? `https://www.google.com/maps/dir/?api=1&destination=${theater.latitude},${theater.longitude}` : null;
  const locationMapUrl = getLocationMapUrl(theater);
  const coordinates = formatCoordinates(theater);
  const facilities = theater.facilities.map((item) => facilityLabels[item] ?? item.replaceAll("_", " ")).filter(Boolean);

  return (
    <main className="flex-1 pb-16">
      <section className="relative min-h-[31rem] overflow-hidden border-b border-white/10">
        <MediaImage image={theater.cover} alt={theater.cover?.alt || `${theater.name} cinema`} className="absolute inset-0 h-full w-full" preferredVariant="large" fallbackLabel="Cinema image unavailable" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#11100f] via-[#11100f]/65 to-black/20" />
        <div className="relative mx-auto flex min-h-[31rem] w-full max-w-[1800px] flex-col justify-end px-5 pb-10 pt-32 sm:px-8 lg:px-12">
          <Link href="/theaters" className="mb-6 text-xs font-semibold text-white/70 hover:text-primary">← All theaters</Link>
          <p className="text-xs uppercase tracking-[0.18em] text-primary">{theater.district}, {theater.city}</p>
          <h1 className="mt-3 max-w-5xl font-cinema-display text-5xl uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">{theater.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/75"><span className="flex items-center gap-2"><MapPin className="size-4" />{theater.address}</span><span className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300">{status(theater)}</span></div>
          <div className="mt-6 flex flex-wrap gap-2">
            {directions && <a href={directions} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-accent"><Navigation className="size-4" />Get directions</a>}
            {theater.phones[0]?.number && <a href={`tel:${theater.phones[0].number}`} className="inline-flex items-center gap-2 border border-white/25 px-4 py-3 text-sm font-semibold hover:border-white/60"><Phone className="size-4" />Call box office</a>}
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1800px] gap-5 px-5 pt-8 sm:px-8 lg:grid-cols-[1.1fr_1.2fr_0.9fr] lg:px-12">
        <Section title="Location">
          <div className="-mx-5 -mt-5 space-y-0 sm:-mx-6 sm:-mt-6">
            <div className="relative h-56 overflow-hidden border-b border-white/10 bg-[#171513]">
              {locationMapUrl ? (
                <iframe title={`${theater.name} location map`} src={locationMapUrl} className="h-full w-full border-0 grayscale-[0.2] contrast-[0.95]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-sm text-white/55">Map location unavailable.</div>
              )}
              {coordinates && (
                <button
                  type="button"
                  className="group absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                  aria-label={`${theater.name}: ${theater.address}`}
                >
                  <span className="relative flex size-10 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-xl shadow-black/50 transition group-hover:scale-110 group-focus-visible:scale-110 after:absolute after:top-[calc(100%-5px)] after:border-x-[7px] after:border-t-[12px] after:border-x-transparent after:border-t-primary">
                    <MapPin aria-hidden="true" className="size-5" />
                  </span>
                  <span className="pointer-events-none absolute bottom-12 left-1/2 w-52 -translate-x-1/2 border border-white/15 bg-[#11100f]/95 p-2 text-left shadow-xl">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-primary">{theater.name}</span>
                    <span className="mt-1 block text-[10px] leading-4 text-white/70">{theater.address}</span>
                  </span>
                </button>
              )}
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <p className="flex items-start gap-3 text-sm leading-6 text-white/75"><MapPin className="mt-1 size-4 shrink-0 text-primary" />{theater.address}</p>
              {theater.transitInfo && <p className="flex items-start gap-3 text-sm leading-6 text-white/75"><Navigation className="mt-1 size-4 shrink-0 text-primary" />{theater.transitInfo}</p>}
              {theater.parkingInfo && <p className="flex items-start gap-3 text-sm leading-6 text-white/75"><span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-primary text-[10px] font-bold text-primary">P</span>{theater.parkingInfo}</p>}
              <p className="text-xs text-white/45">{theater.district}, {theater.city}</p>
              {coordinates && <p className="font-mono text-xs tracking-wide text-white/45">{coordinates}</p>}
            </div>
          </div>
        </Section>
        <Section title="Opening hours">
          <div className="space-y-1 text-sm">
            {theater.weeklyHours.map((hour) => {
              const isToday = theater.today !== null && hour.weekday === new Date(`${theater.today.cinemaDate}T12:00:00Z`).getUTCDay() + 1;
              return (
                <div key={hour.weekday} className={`flex items-center justify-between border-b border-white/5 px-2 py-3 ${isToday ? "bg-primary/10 text-white" : "text-white/65"}`}>
                  <span className="flex items-center gap-2"><span>{weekdays[(hour.weekday - 1) % 7]}</span>{isToday && <span className="text-[10px] font-bold uppercase text-primary">Today</span>}</span>
                  <span className="font-mono text-xs">{formatHours(hour)}</span>
                </div>
              );
            })}
          </div>
          {theater.specialDates.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Special hours · next 7 days</p>
              <div className="space-y-2">
                {theater.specialDates.slice(0, 7).map((specialDate) => (
                  <div key={specialDate.cinemaDate} className="flex items-center justify-between gap-3 border-l-2 border-primary bg-primary/10 px-3 py-3 text-xs text-white/75">
                    <span>{dateLabel(specialDate.cinemaDate)} · {specialDate.specialDateLabel ?? "Special hours"}</span>
                    <span className="shrink-0 font-mono">{formatHours(specialDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mt-5 flex gap-2 text-xs leading-5 text-white/45"><Clock3 className="mt-0.5 size-4 shrink-0" />All times are Cairo time.</p>
        </Section>
        <Section title="Contact">
          <div className="divide-y divide-white/5">
            {theater.phones.map((phone) => (
              <a key={`${phone.label}-${phone.number}`} href={`tel:${phone.number}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:text-primary">
                <span className="flex size-10 shrink-0 items-center justify-center border border-white/15">{contactIcon(phone.label)}</span>
                <span><span className="block text-xs text-white/55">{phone.label}</span><span className="font-mono text-sm text-white">{phone.number}</span></span>
              </a>
            ))}
            {theater.email && <a href={`mailto:${theater.email}`} className="flex items-center gap-3 py-3 hover:text-primary"><span className="flex size-10 shrink-0 items-center justify-center border border-white/15"><Mail aria-hidden="true" className="size-4 text-primary" /></span><span><span className="block text-xs text-white/55">Email</span><span className="text-sm text-white">{theater.email}</span></span></a>}
            {theater.phones.length === 0 && !theater.email && <p className="text-sm text-white/55">Contact details unavailable.</p>}
          </div>
        </Section>
      </div>

      <div className="mx-auto mt-5 w-full max-w-[1800px] px-5 sm:px-8 lg:px-12"><Section title="Facilities"><div className="flex flex-wrap gap-2">{facilities.length ? facilities.map((item) => <span key={item} className="border border-white/15 px-3 py-2 text-xs text-white/70">{item}</span>) : <p className="text-sm text-white/55">Facilities unavailable.</p>}</div></Section></div>

      <div className="mx-auto mt-12 w-full max-w-[1800px] px-5 sm:px-8 lg:px-12"><div className="flex items-end justify-between border-b border-white/10 pb-3"><h2 className="font-cinema-display text-5xl uppercase sm:text-6xl">Halls</h2><span className="text-xs text-white/45">{theater.halls.length} halls · {theater.halls.reduce((sum, hall) => sum + hall.seatCount, 0)} seats</span></div>{theater.halls.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{theater.halls.map((hall) => <article key={hall.id} className="border border-white/10 bg-[#151313] p-4"><h3 className="font-cinema-display text-2xl uppercase">{hall.name}</h3><p className="mt-2 text-sm text-white/55"><Users className="mr-2 inline size-4" />{hall.seatCount} seats · {hall.wheelchairCount} wheelchair spaces</p></article>)}</div> : <div className="mt-5"><EmptyState title="Hall information unavailable" description="This cinema has not provided hall details yet." /></div>}</div>

      <div className="mx-auto mt-14 w-full max-w-[1800px] px-5 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between border-b border-white/10 pb-4">
          <h2 className="font-cinema-display text-5xl uppercase leading-none sm:text-7xl">Showtimes here</h2>
          {selectedDay && <span className="text-xs text-white/45">{selectedDay.movies.length} {selectedDay.movies.length === 1 ? "film" : "films"} on {dateLabel(selectedDay.cinemaDate)}</span>}
        </div>
        {showtimesError ? <div className="mt-5"><ErrorState title="Showtimes are unavailable" message={showtimesError} action={<button type="button" onClick={() => window.location.reload()} className="border border-primary px-4 py-2 text-sm text-primary">Try again</button>} /></div> : showtimes ? <>
          <div className="mt-0 flex overflow-x-auto border-b border-white/10">
            {showtimes.days.map((day) => {
              const parts = dateTabParts(day.cinemaDate);
              const selected = day.cinemaDate === selectedDate;
              return <button key={day.cinemaDate} type="button" aria-pressed={selected} onClick={() => setSelectedDate(day.cinemaDate)} className={`min-w-28 border-b-2 px-5 py-4 text-center transition sm:min-w-36 ${selected ? "border-primary bg-primary/10 text-white" : "border-transparent text-white/45 hover:text-white"}`}><span className="block text-[10px] font-semibold uppercase tracking-[0.16em]">{parts.weekday}</span><span className={`mt-1 block font-cinema-display text-3xl ${selected ? "text-white" : "text-white/75"}`}>{parts.day}</span></button>;
            })}
          </div>
          {selectedDay?.movies.length ? <div className="divide-y divide-white/10">{selectedDay.movies.map(({ movie, showtimes: movieShowtimes }) => <article key={movie.id} className="grid gap-5 py-7 lg:grid-cols-[minmax(19rem,0.9fr)_minmax(0,1.5fr)] lg:items-center"><div className="flex min-w-0 items-center gap-4"><MediaImage image={movie.poster} alt={movie.poster?.alt || `${movie.title} poster`} className="h-28 w-20 shrink-0" preferredVariant="small" fallbackLabel="Poster unavailable" /><div className="min-w-0"><h3 className="font-cinema-display text-2xl uppercase leading-none sm:text-3xl">{movie.title}</h3><p className="mt-2 text-xs text-white/50">{movie.genres.map((genre) => genre.name).join(", ")} · {movie.runtimeMinutes}m · {movie.ageRating}</p></div></div><div className="flex flex-wrap gap-2 lg:justify-start">{movieShowtimes.map((item) => <span key={item.id} className={`min-w-28 border px-3 py-2 ${item.hasStarted ? "border-white/10 bg-white/[0.02] text-white/30" : "border-white/20 text-white/90"}`} title={item.hasStarted ? "This showtime has started" : undefined}><span className="block font-cinema-display text-2xl leading-none">{formatCinemaTime(item.startsAt)}</span><span className="mt-1 block text-[10px] text-white/45">{item.hasStarted ? "Started" : `${item.hall.name} · from ${money(item.fromPrice)}`}</span></span>)}</div></article>)}</div> : <div className="mt-5"><EmptyState title="No showtimes on this date" description="Choose another date to see available screenings." /></div>}
        </> : <div className="mt-5"><EmptyState title="No showtimes available" description="This cinema has no published showtimes right now." /></div>}
      </div>

      {theater.photos.length > 0 && <div className="mx-auto mt-14 w-full max-w-[1800px] px-5 sm:px-8 lg:px-12"><h2 className="border-b border-white/10 pb-3 font-cinema-display text-5xl uppercase sm:text-6xl">Photos</h2><div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{theater.photos.map((photo) => <MediaImage key={photo.id} image={photo.image} alt={photo.caption || photo.image.alt || `${theater.name} photo`} className="aspect-video w-full" preferredVariant="medium" />)}</div></div>}
    </main>
  );
}
