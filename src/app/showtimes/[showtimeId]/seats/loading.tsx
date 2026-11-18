import { Skeleton } from "@/components/ui/skeleton";

export default function SeatSelectionLoading() {
  return (
    <main
      aria-label="Loading seat selection"
      className="mx-auto w-full max-w-[1800px] flex-1 px-4 pb-14 pt-24 sm:px-8 sm:pt-28 lg:px-12"
    >
      <Skeleton className="h-8 w-40" label="Loading seat selection" />
      <Skeleton className="mt-4 h-14 w-full max-w-xl" label="Loading movie and showtime" />
      <Skeleton className="mt-6 h-[min(65vh,720px)] w-full" label="Loading the seat map" />
      <Skeleton className="mt-4 h-28 w-full" label="Loading selected seats and total" />
    </main>
  );
}
