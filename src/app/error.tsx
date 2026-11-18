"use client";

import { ErrorState } from "@/components/ui";

type HomeErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function HomeError({ error, retry }: HomeErrorProps) {
  return (
    <main className="mx-auto flex flex-1 w-full max-w-3xl flex-col justify-center gap-6 px-5 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        Discover movies and cinemas
      </h1>
      <ErrorState
        title="Something went wrong"
        message="We couldn't display the Home page. Please try again."
        action={
          <button
            type="button"
            onClick={retry}
            className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent"
          >
            Try again
          </button>
        }
      />
      <p className="sr-only">{error.digest}</p>
    </main>
  );
}
