"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/ui/toast";

export function SignedOutToast() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (window.location.hash !== "#signed-out") return;

      setIsVisible(true);
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
      <Toast
        title="Signed out"
        message="You have been signed out."
        variant="success"
        onDismiss={() => setIsVisible(false)}
      />
    </div>
  );
}
