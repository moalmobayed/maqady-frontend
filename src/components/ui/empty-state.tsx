import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <section
      role="status"
      className="rounded-xl border border-dashed border-border bg-surface p-8 text-center"
    >
      <p className="font-semibold tracking-tight">{title}</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
