"use client";

import type { ReactNode } from "react";
import { Modal } from "./modal";

type ConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: "default" | "danger";
  pending?: boolean;
  children?: ReactNode;
};

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  intent = "default",
  pending = false,
  children,
}: ConfirmationDialogProps) {
  const confirmClasses =
    intent === "danger"
      ? "bg-destructive text-white hover:bg-destructive/90"
      : "bg-primary text-primary-foreground hover:bg-accent";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
    >
      {children}
      <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          aria-busy={pending}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClasses}`}
        >
          {pending ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
