"use client";

import Link from "next/link";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FeaturedMovie } from "@/lib/home/types";
import { MediaImage } from "./media-image";
import { MotionReveal } from "./motion-reveal";

type FeaturedHeroProps = {
  featured: FeaturedMovie[];
};

function HeroVideo({ movie }: { movie: FeaturedMovie }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [autoplay, setAutoplay] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const video = movie.heroVideo;

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const updateAutoplay = () => {
      const shouldAutoplay = !motionPreference.matches;
      setAutoplay(shouldAutoplay);
      setPlaying(shouldAutoplay);
    };

    updateAutoplay();
    motionPreference.addEventListener("change", updateAutoplay);
    return () => motionPreference.removeEventListener("change", updateAutoplay);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const embedUrl = new URL(frame.src);
    embedUrl.searchParams.set("origin", window.location.origin);
    frame.src = embedUrl.toString();
  }, [autoplay]);

  if (!video) return null;

  function sendCommand(command: "playVideo" | "pauseVideo" | "mute" | "unMute") {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: command, args: [] }),
      "https://www.youtube-nocookie.com",
    );
  }

  const embedUrl = new URL(
    `/embed/${video.youtubeId}`,
    "https://www.youtube-nocookie.com",
  );
  embedUrl.searchParams.set("autoplay", autoplay ? "1" : "0");
  embedUrl.searchParams.set("mute", "1");
  embedUrl.searchParams.set("controls", "0");
  embedUrl.searchParams.set("enablejsapi", "1");
  embedUrl.searchParams.set("playsinline", "1");

  return (
    <>
      <iframe
        ref={frameRef}
        title={`${movie.movie.title} — ${video.title}`}
        src={embedUrl.toString()}
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        className="featured-hero-video pointer-events-none absolute border-0 opacity-65"
      />
      <div className="pointer-events-auto absolute bottom-5 right-5 z-20 flex gap-2 sm:bottom-8 sm:right-8">
        <button
          type="button"
          onClick={() => {
            sendCommand(playing ? "pauseVideo" : "playVideo");
            setPlaying((current) => !current);
          }}
          aria-label={playing ? "Pause trailer" : "Play trailer"}
          aria-pressed={playing}
          className="inline-flex size-10 items-center justify-center rounded-md border border-white/30 bg-black/60 text-white shadow-lg backdrop-blur-md transition-colors duration-200 hover:border-white/60 hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
        >
          {playing ? (
            <Pause aria-hidden="true" focusable="false" className="size-5" />
          ) : (
            <Play aria-hidden="true" focusable="false" className="size-5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            sendCommand(muted ? "unMute" : "mute");
            setMuted((current) => !current);
          }}
          aria-label={muted ? "Turn trailer sound on" : "Mute trailer"}
          aria-pressed={!muted}
          className="inline-flex size-10 items-center justify-center rounded-md border border-white/30 bg-black/60 text-white shadow-lg backdrop-blur-md transition-colors duration-200 hover:border-white/60 hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
        >
          {muted ? (
            <VolumeX aria-hidden="true" focusable="false" className="size-5" />
          ) : (
            <Volume2 aria-hidden="true" focusable="false" className="size-5" />
          )}
        </button>
      </div>
    </>
  );
}

export function FeaturedHero({ featured }: FeaturedHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const orderedFeatured = [...featured].sort(
    (first, second) => first.position - second.position,
  );
  const selectedIndex = Math.min(activeIndex, orderedFeatured.length - 1);
  const selected = orderedFeatured[selectedIndex];

  if (!selected) {
    return (
      <section
        aria-labelledby="home-heading"
        className="relative isolate flex min-h-[38rem] items-end overflow-hidden bg-gradient-to-br from-surface-elevated via-background to-background px-6 pb-12 pt-28 sm:min-h-[44rem] sm:px-10 sm:pb-16 lg:min-h-[min(82svh,780px)] lg:px-16"
      >
        <MotionReveal className="max-w-2xl space-y-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Your next movie night starts here
          </p>
          <h1
            id="home-heading"
            className="font-cinema-display text-5xl font-bold uppercase leading-[0.92] tracking-tight sm:text-7xl"
          >
            Discover movies worth seeing.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Browse what is showing, find upcoming releases, and explore
            cinemas near you.
          </p>
          <Link
            href="/movies"
            className="inline-flex rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-accent"
          >
            Explore movies
          </Link>
        </MotionReveal>
      </section>
    );
  }

  const movieHref = `/movies/${selected.movie.id}`;

  return (
    <section
      aria-labelledby="home-heading"
      className="relative isolate bg-black"
    >
      <div className="relative min-h-[38rem] overflow-hidden sm:min-h-[44rem] lg:min-h-[min(82svh,780px)]">
        <div className="absolute inset-0 z-0">
          <MediaImage
            image={selected.backdrop}
            alt={selected.backdrop?.alt ?? ""}
            className="h-full w-full"
            preferredVariant="large"
            fallbackLabel="Featured movie backdrop unavailable"
            decorative
            key={selected.movie.id}
          />
        </div>
        {selected.heroVideo && (
          <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
            <HeroVideo key={selected.movie.id} movie={selected} />
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/90 via-black/55 to-black/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-transparent to-black/35"
        />
        <div className="relative z-10 flex min-h-[38rem] flex-col justify-center px-6 pb-28 pt-32 sm:min-h-[44rem] sm:px-10 sm:pb-32 lg:min-h-[min(82svh,780px)] lg:px-16">
          <div className="max-w-5xl">
            <MotionReveal>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-primary sm:text-sm">
                Featured {String(selected.position).padStart(2, "0")} /{" "}
                {String(orderedFeatured.length).padStart(2, "0")}
                {selected.heroVideo && (
                  <span className="ml-5 text-white/75">
                    {selected.heroVideo.title}
                  </span>
                )}
              </p>
            </MotionReveal>
            <MotionReveal delay={0.1}>
              <h1
                id="home-heading"
                className="font-cinema-display max-w-5xl text-5xl font-bold uppercase leading-[0.92] tracking-tight text-white md:text-7xl lg:text-[clamp(5rem,9vw,9rem)]"
              >
                {selected.movie.title}
              </h1>
            </MotionReveal>
            <MotionReveal delay={0.2}>
              <ul
                aria-label="Movie details"
                className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-wide text-white/85 sm:text-sm"
              >
                {selected.movie.genres.map((genre) => (
                  <li key={genre.id}>{genre.name}</li>
                ))}
                <li aria-label={`Runtime ${selected.movie.runtimeMinutes} minutes`}>
                  {Math.floor(selected.movie.runtimeMinutes / 60)}h{" "}
                  {selected.movie.runtimeMinutes % 60}m
                </li>
                <li>{selected.movie.ageRating}</li>
              </ul>
            </MotionReveal>
            <MotionReveal delay={0.3}>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
                {selected.movie.synopsis}
              </p>
            </MotionReveal>
            <MotionReveal delay={0.4}>
              <div className="mt-7 flex flex-wrap gap-3">
              {selected.movie.status === "now_showing" && (
                <Link
                  href={movieHref}
                  className="inline-flex items-center border border-primary bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-accent motion-reduce:transition-none"
                >
                  Book tickets
                </Link>
              )}
              <Link
                href={movieHref}
                className="inline-flex items-center border border-white/60 bg-black/20 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:border-white hover:bg-white/10 motion-reduce:transition-none"
              >
                Movie details
              </Link>
              </div>
            </MotionReveal>
          </div>
        </div>
      </div>

      {orderedFeatured.length > 1 && (
        <div className="w-full border-y border-white/10 bg-[#0b0b0b] px-4 py-4 sm:px-8 lg:px-12">
          <ul
            aria-label="Featured movie selection"
            className="grid w-full grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-5 sm:gap-x-4"
          >
            {orderedFeatured.map((item, index) => (
              <li key={item.movie.id} className="min-w-0">
                <button
                  type="button"
                  aria-label={`Show featured movie ${index + 1}: ${item.movie.title}`}
                  aria-pressed={index === selectedIndex}
                  onClick={() => setActiveIndex(index)}
                  className={`group block w-full text-left ${
                    index === selectedIndex ? "text-white" : "text-white/55"
                  }`}
                >
                  <span
                    className={`relative mb-2 block overflow-hidden border ${
                      index === selectedIndex
                        ? "border-primary"
                        : "border-white/10 group-hover:border-white/50"
                    }`}
                  >
                    <MediaImage
                      image={item.backdrop}
                      alt=""
                      className="aspect-[16/8] w-full transition duration-300 group-hover:scale-[1.03]"
                      preferredVariant="small"
                      decorative
                    />
                    <span className="absolute left-2 top-2 bg-black/75 px-1.5 py-0.5 font-mono text-[10px]">
                      {String(item.position).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="block truncate text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                    {item.movie.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <span className="sr-only" aria-live="polite">
            {`Featured movie ${selectedIndex + 1} of ${orderedFeatured.length}: ${selected.movie.title}`}
          </span>
        </div>
      )}
    </section>
  );
}
