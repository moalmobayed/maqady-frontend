"use client";

import { useRouter } from "next/navigation";

export function RetryHomeButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="inline-flex rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent"
    >
      Try again
    </button>
  );
}
