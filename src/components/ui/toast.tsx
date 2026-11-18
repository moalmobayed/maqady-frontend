"use client";

import { useEffect } from "react";
import { CircleCheck, CircleX, Info } from "lucide-react";

type ToastProps = {
  title?: string;
  message: string;
  variant?: "success" | "error" | "info";
  durationMs?: number;
  onDismiss: () => void;
};

const variantIcons = {
  success: { Icon: CircleCheck, className: "text-emerald-400" },
  error: { Icon: CircleX, className: "text-[#FF5500]" },
  info: { Icon: Info, className: "text-[#FF5500]" },
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

  const { Icon, className: iconClassName } = variantIcons[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className="flex items-start gap-3 border border-white/10 bg-[#1A1A1A] p-4 text-white shadow-xl"
    >
      <Icon aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${iconClassName}`} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <p className="text-sm leading-6 text-white/70">{message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded-md p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ×
        </span>
      </button>
    </div>
  );
}
