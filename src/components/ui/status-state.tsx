import type { ReactNode } from "react";

type StatusStateProps = {
  status: "success" | "unauthorized" | "session-expired" | "disabled" | "pending";
  title: string;
  description: string;
  action?: ReactNode;
};

const statusLabels: Record<StatusStateProps["status"], string> = {
  success: "Success",
  unauthorized: "Access required",
  "session-expired": "Session expired",
  disabled: "Unavailable",
  pending: "Pending",
};

const statusClasses: Record<StatusStateProps["status"], string> = {
  success: "border-success/40",
  unauthorized: "border-warning/40",
  "session-expired": "border-warning/40",
  disabled: "border-border",
  pending: "border-info/40",
};

export function StatusState({
  status,
  title,
  description,
  action,
}: StatusStateProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className={`rounded-xl border bg-surface p-8 text-center ${statusClasses[status]}`}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {statusLabels[status]}
      </p>
      <p className="font-semibold tracking-tight">{title}</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
