"use client";

import { useEffect } from "react";

type ToastProps = {
  title?: string;
  message: string;
  variant?: "success" | "error" | "info";
  durationMs?: number;
  onDismiss: () => void;
};

const variantClasses = {
  success: "border-success/50",
  error: "border-destructive/60",
  info: "border-info/50",
};

export function Toast({
  title,
  message,
  variant = "info",
  durationMs = 5000,
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    if (durationMs <= 0) return;

    const timeout = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timeout);
  }, [durationMs, onDismiss]);

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={`flex items-start gap-4 rounded-lg border bg-surface-elevated p-4 shadow-xl ${variantClasses[variant]}`}
    >
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <p className="text-sm leading-6 text-muted-foreground">{message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ×
        </span>
      </button>
    </div>
  );
}
