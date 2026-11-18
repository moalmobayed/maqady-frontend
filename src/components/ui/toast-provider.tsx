"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Toast } from "@/components/ui/toast";

type ToastMessage = {
  title: string;
  message: string;
  variant: "success" | "error" | "info";
};

type ToastEntry = ToastMessage & { id: number };
type ShowToast = (toast: ToastMessage) => void;

const ToastContext = createContext<ShowToast | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastEntry | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback((message: ToastMessage) => {
    nextId.current += 1;
    setToast({ ...message, id: nextId.current });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              title={toast.title}
              message={toast.message}
              variant={toast.variant}
              onDismiss={dismissToast}
            />
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const showToast = useContext(ToastContext);
  if (!showToast) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return showToast;
}
