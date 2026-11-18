import { Skeleton } from "@/components/ui";

export default function MoviesLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <main
        aria-label="Loading movies"
        className="mx-auto w-full max-w-[1800px] flex-1 px-5 pb-16 pt-32 sm:px-8 lg:px-12"
      >
        <Skeleton className="h-4 w-44" label="Loading movie page heading" />
        <Skeleton className="mt-4 h-14 w-56" label="Loading movie page title" />
        <Skeleton className="mt-10 h-12 w-64" label="Loading release status" />
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index}>
              <Skeleton className="aspect-[2/3] w-full" label="Loading movie poster" />
              <Skeleton className="mt-4 h-5 w-4/5" label="Loading movie title" />
              <Skeleton className="mt-2 h-3 w-3/5" label="Loading movie details" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
