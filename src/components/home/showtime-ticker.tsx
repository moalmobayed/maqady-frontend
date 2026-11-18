import Link from "next/link";
import { formatCinemaTime, getCurrentTickerItems } from "@/lib/home/cinema-time";
import type { HomeData } from "@/lib/home/types";
import { MotionReveal } from "./motion-reveal";

type ShowtimeTickerProps = {
  data: HomeData;
};

export function ShowtimeTicker({ data }: ShowtimeTickerProps) {
  const items = getCurrentTickerItems(data);

  return (
    <section
      aria-label="Upcoming showtimes today"
      className="w-full border-y border-white/10 bg-[#0b0b0b]"
    >
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-2 px-5 py-3 sm:px-8 md:flex-row md:items-center lg:px-12">
        <MotionReveal className="shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Today at Maqady
          </p>
        </MotionReveal>
        <MotionReveal className="min-w-0 flex-1" delay={0.12}>
          <div className="showtime-ticker-viewport md:pl-5">
            {items.length > 0 ? (
              <ul className="showtime-ticker-track flex shrink-0 gap-7 pr-7">
                {items.map((item) => (
                  <li key={item.nextShowtime.id} className="shrink-0">
                    <Link
                      href={`/movies/${item.movie.id}`}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-white/80 transition hover:text-white sm:text-xs"
                    >
                      <span className="max-w-48 truncate font-semibold">
                        {item.movie.title}
                      </span>
                      <span className="text-[9px] font-semibold text-primary">
                        Next
                      </span>
                      <time
                        dateTime={item.nextShowtime.startsAt}
                        className="font-bold"
                      >
                        {formatCinemaTime(item.nextShowtime.startsAt)}
                      </time>
                      <span className="max-w-36 truncate text-[9px] text-white/50">
                        {item.nextShowtime.theater.name}
                      </span>
                      <span aria-hidden="true" className="text-primary">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-1 text-xs text-white/50">
                No upcoming showtimes today.
              </p>
            )}
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
