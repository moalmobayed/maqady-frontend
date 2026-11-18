"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent } from "react";
import { getCurrentPageReturnTo } from "@/lib/auth/return-to";

type SignInLinkProps = {
  className?: string;
  onNavigate?: () => void;
};

export function SignInLink({ className, onNavigate }: SignInLinkProps) {
  const router = useRouter();

  function navigateToSignIn(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onNavigate?.();

    const returnTo = getCurrentPageReturnTo();
    router.push(
      returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login",
    );
  }

  return (
    <Link href="/login" onClick={navigateToSignIn} className={className}>
      Sign in
    </Link>
  );
}
