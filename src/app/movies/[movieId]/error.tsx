"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui";

type MovieDetailsErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function MovieDetailsError({
  error,
  retry,
}: MovieDetailsErrorProps) {
  useEffect(() => {
    console.error("Movie details route failed:", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-5 py-16 pt-32 sm:px-8">
      <ErrorState
        title="We couldn't display this movie"
        message="Please try again. Your movie and showtime selections have not been changed."
        action={
          <button
            type="button"
            onClick={retry}
            className="rounded-sm bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-accent"
          >
            Try again
          </button>
        }
      />
    </main>
  );
}
