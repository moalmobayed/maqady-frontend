"use client";

import { useCallback, useState } from "react";
import {
  ConfirmationDialog,
  EmptyState,
  ErrorState,
  Modal,
  Skeleton,
  StatusState,
  Toast,
} from "@/components/ui";

type ToastMessage = {
  title: string;
  message: string;
  variant: "success" | "error" | "info";
};

const buttonClass =
  "rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-accent";

export default function UiTestPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const dismissToast = useCallback(() => setToastMessage(null), []);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-5 py-12 pt-28 sm:px-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Maqady UI
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Component Test Page
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Temporary showcase of the existing reusable UI components and
          interaction states.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Interactive components</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={buttonClass}
            onClick={() => setModalOpen(true)}
          >
            Open Modal
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={() => setConfirmationOpen(true)}
          >
            Open Confirmation Dialog
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={() =>
              setToastMessage({
                title: "Success",
                message: "Your action completed successfully.",
                variant: "success",
              })
            }
          >
            Show Success Toast
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={() =>
              setToastMessage({
                title: "Error",
                message: "This is an example error notification.",
                variant: "error",
              })
            }
          >
            Show Error Toast
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Loading</h2>
        <div className="space-y-3 rounded-xl border border-border bg-surface p-5">
          <Skeleton className="h-5 w-1/3" label="Loading heading" />
          <Skeleton className="h-4 w-full" label="Loading content" />
          <Skeleton className="h-4 w-4/5" label="Loading additional content" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Empty state</h2>
        <EmptyState
          title="No items yet"
          description="When there is content to display, it will appear here."
          action={
            <button type="button" className={buttonClass}>
              Example action
            </button>
          }
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Error state</h2>
        <ErrorState
          title="Unable to load this section"
          message="This is an example error state. Try again when the issue is resolved."
          action={
            <button type="button" className={buttonClass}>
              Try again
            </button>
          }
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Operation and access states</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <StatusState
            status="success"
            title="Action completed"
            description="The operation completed successfully."
          />
          <StatusState
            status="pending"
            title="Still processing"
            description="This operation has not finished yet."
          />
          <StatusState
            status="unauthorized"
            title="Sign in required"
            description="You need permission to view this content."
          />
          <StatusState
            status="session-expired"
            title="Please sign in again"
            description="Your session has expired."
          />
          <StatusState
            status="disabled"
            title="Temporarily unavailable"
            description="This action is currently disabled."
          />
        </div>
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example Modal"
        description="This modal uses the existing shared Modal component."
      >
        <p className="text-sm leading-6 text-muted-foreground">
          Use the close button, click outside the dialog, or press Escape to
          dismiss it.
        </p>
      </Modal>

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={() => {
          setConfirmationOpen(false);
          setToastMessage({
            title: "Confirmed",
            message: "The example confirmation was accepted.",
            variant: "success",
          });
        }}
        title="Confirm example action"
        description="This dialog demonstrates the existing confirmation component."
        confirmLabel="Confirm"
        intent="default"
      />

      {toastMessage && (
        <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm">
          <Toast
            title={toastMessage.title}
            message={toastMessage.message}
            variant={toastMessage.variant}
            onDismiss={dismissToast}
          />
        </div>
      )}
    </main>
  );
}
