import { Skeleton } from "@/components/ui";

export default function TheaterDetailsLoading() {
  return <main className="mx-auto w-full max-w-[1800px] flex-1 px-5 pb-16 pt-32 sm:px-8 lg:px-12"><Skeleton className="h-80 w-full" label="Loading theater hero" /><Skeleton className="mt-6 h-10 w-64" label="Loading theater information" /><div className="mt-5 grid gap-5 lg:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-52 w-full" label="Loading theater panel" />)}</div><Skeleton className="mt-12 h-64 w-full" label="Loading theater showtimes" /></main>;
}
