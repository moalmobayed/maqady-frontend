import { Skeleton } from "@/components/ui";

export default function MovieDetailsLoading() {
  return (
    <main
      aria-label="Loading movie details"
      className="mx-auto w-full max-w-[1600px] flex-1 px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-12"
    >
      <Skeleton className="h-4 w-36" label="Loading breadcrumb" />
      <Skeleton className="mt-6 h-12 w-3/4 max-w-2xl" label="Loading movie title" />
      <Skeleton className="mt-4 h-4 w-80 max-w-full" label="Loading movie facts" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div>
          <Skeleton className="aspect-video w-full" label="Loading movie gallery" />
          <Skeleton className="mt-8 h-5 w-full" label="Loading synopsis" />
          <Skeleton className="mt-3 h-5 w-4/5" label="Loading synopsis" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" label="Loading ticket action" />
          <Skeleton className="h-12 w-full" label="Loading trailer action" />
          <Skeleton className="h-28 w-full" label="Loading showtime summary" />
        </div>
      </div>
      <Skeleton className="mt-16 h-60 w-full" label="Loading showtimes" />
    </main>
  );
}
