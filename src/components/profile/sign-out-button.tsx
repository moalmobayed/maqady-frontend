"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function signOut() {
    setIsSigningOut(true);
    setErrorMessage("");

    let response: Response;
    try {
      response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { accept: "application/json" },
      });
    } catch (error) {
      console.error("Sign-out request failed:", error);
      setErrorMessage("We couldn't sign you out. Please try again.");
      setIsSigningOut(false);
      return;
    }

    if (!response.ok) {
      console.error("Sign-out request returned an unsuccessful response:", {
        status: response.status,
      });
      setErrorMessage("We couldn't sign you out. Please try again.");
      setIsSigningOut(false);
      return;
    }

    window.location.replace("/#signed-out");
  }

  return (
    <>
      <button
        type="button"
        onClick={signOut}
        disabled={isSigningOut}
        aria-busy={isSigningOut}
        className="flex min-h-14 w-full items-center justify-between gap-3 whitespace-nowrap border-l-2 border-transparent px-3 text-left text-sm text-white/70 transition hover:border-white/15 hover:bg-white/[0.03] hover:text-white disabled:cursor-wait disabled:opacity-60"
      >
        <span className="flex items-center gap-3 whitespace-nowrap">
          <LogOut aria-hidden="true" className="size-4 shrink-0" />
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </span>
      </button>
      {errorMessage && (
        <p role="alert" className="px-3 text-sm leading-5 text-red-300">
          {errorMessage}
        </p>
      )}
    </>
  );
}
