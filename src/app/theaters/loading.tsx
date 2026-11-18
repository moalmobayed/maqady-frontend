import { Skeleton } from "@/components/ui";

export default function TheatersLoading() {
  return (
    <main
      aria-label="Loading theaters"
      className="mx-auto w-full max-w-[1800px] flex-1 px-5 pb-16 pt-32 sm:px-8 lg:px-12"
    >
      <Skeleton className="h-4 w-44" label="Loading theater page heading" />
      <Skeleton className="mt-4 h-16 w-64" label="Loading theater page title" />
      <Skeleton className="mt-5 h-12 w-full max-w-xl" label="Loading theater description" />
      <Skeleton className="mt-8 h-12 w-72" label="Loading theater filters" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-56 w-full" label="Loading theater card" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" label="Loading theater locations" />
      </div>
    </main>
  );
}
