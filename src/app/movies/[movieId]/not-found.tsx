import Link from "next/link";
import { EmptyState } from "@/components/ui";

export default function MovieDetailsNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16 pt-32 sm:px-8">
      <EmptyState
        title="Movie not found"
        description="This movie may have been removed or the address may be incorrect."
        action={
          <Link
            href="/movies"
            className="inline-flex min-h-11 items-center rounded-sm bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-accent"
          >
            Browse movies
          </Link>
        }
      />
    </main>
  );
}
