import { Skeleton } from "@/components/ui";

export default function HomeLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <main aria-label="Loading home page" className="w-full flex-1">
        <section className="relative flex min-h-[38rem] flex-col justify-end px-6 pb-12 pt-28 sm:min-h-[44rem] sm:px-10 lg:min-h-[min(82svh,780px)] lg:px-16">
          <Skeleton
            className="absolute inset-0 opacity-40"
            label="Loading featured movie"
          />
          <p
            role="status"
            className="relative z-10 mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            Loading movies and cinemas. The first request may take a little
            longer while the service starts.
          </p>
          <Skeleton className="relative z-10 h-16 w-4/5 max-w-4xl sm:h-24" />
          <Skeleton className="relative z-10 mt-5 h-5 w-full max-w-xl" />
          <Skeleton className="relative z-10 mt-2 h-5 w-2/3 max-w-lg" />
          <Skeleton className="relative z-10 mt-8 h-12 w-36" />
        </section>
        <div className="flex gap-3 overflow-hidden border-y border-white/10 bg-[#0b0b0b] px-5 py-4 sm:px-8">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={index}
              className="aspect-[16/8] w-40 shrink-0 sm:w-52"
              label={`Loading featured movie ${index + 1}`}
            />
          ))}
        </div>
        <div className="mx-auto grid w-full max-w-[1800px] grid-cols-2 gap-4 px-5 py-10 sm:grid-cols-3 sm:px-8 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="aspect-[2/3] w-full"
              label={`Loading movie ${index + 1}`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
