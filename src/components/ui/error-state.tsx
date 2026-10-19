import type { ReactNode } from "react";

type ErrorStateProps = {
  title?: string;
  message: string;
  action?: ReactNode;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="rounded-xl border border-destructive/40 bg-surface p-8 text-center"
    >
      <p className="font-semibold tracking-tight">{title}</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        {message}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
