"use client";

import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type MouseEvent } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { getBrowserReturnTo } from "@/lib/auth/return-to";

type AccountAccessFormProps = {
  mode: "sign-in" | "create-account";
};

export function AccountAccessForm({ mode }: AccountAccessFormProps) {
  const isCreateAccount = mode === "create-account";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const showToast = useToast();

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");
    const fullName = formData.get("fullName");

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      (isCreateAccount && typeof fullName !== "string")
    ) {
      setFeedback("Please complete all required fields.");
      return;
    }

    setFeedback("");
    setIsSubmitting(true);

    let response: Response;
    try {
      response = await fetch(
        isCreateAccount ? "/api/auth/registrations" : "/api/auth/sessions",
        {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify(
            isCreateAccount
              ? { fullName, email, password }
              : { email, password },
          ),
        },
      );
    } catch (error) {
      console.error("Authentication form request failed:", error);
      setFeedback(
        "We couldn't reach the authentication service. Please try again.",
      );
      setIsSubmitting(false);
      return;
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      console.error("Authentication response was invalid JSON:", error);
      setFeedback(
        "The authentication service returned an unexpected response.",
      );
      setIsSubmitting(false);
      return;
    }

    if (!isRecord(payload)) {
      console.error("Authentication response did not match its contract.");
      setFeedback(
        "The authentication service returned an unexpected response.",
      );
      setIsSubmitting(false);
      return;
    }

    if (!response.ok) {
      setFeedback(
        typeof payload.message === "string"
          ? payload.message
          : "We couldn't complete your request. Please try again.",
      );
      setIsSubmitting(false);
      return;
    }

    const customer = payload.customer;
    if (!isRecord(customer) || typeof customer.fullName !== "string") {
      console.error("Authentication success response did not include a customer.");
      setFeedback(
        "The authentication service returned an unexpected response.",
      );
      setIsSubmitting(false);
      return;
    }

    form.reset();
    setPasswordVisible(false);
    const returnTo = getBrowserReturnTo();
    showToast({
      title: isCreateAccount ? "Account created" : "Welcome back",
      message: isCreateAccount
        ? "Your account has been created successfully."
        : "You have signed in successfully.",
      variant: "success",
    });
    router.replace(returnTo ?? "/");
    router.refresh();
  }

  function preserveReturnTo(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    const returnTo = getBrowserReturnTo();
    if (!returnTo) return;

    event.preventDefault();
    router.push(`${href}?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-[1080px] flex-1 items-center px-5 py-12 pt-28 sm:px-8">
      <section
        aria-label={isCreateAccount ? "Create your Maqady account" : "Sign in to Maqady"}
        className="mx-auto w-full max-w-[760px]"
      >
        <nav
          aria-label="Account access"
          className="relative grid grid-cols-2 border-b border-white/15"
        >
          <Link
            href="/login"
            onClick={(event) => preserveReturnTo(event, "/login")}
            aria-current={!isCreateAccount ? "page" : undefined}
            className={`flex min-h-16 items-center justify-center px-2 pb-[3px] font-cinema-display text-lg font-bold uppercase tracking-wide transition-colors sm:text-2xl ${
              !isCreateAccount
                ? "text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            onClick={(event) => preserveReturnTo(event, "/register")}
            aria-current={isCreateAccount ? "page" : undefined}
            className={`flex min-h-16 items-center justify-center px-2 pb-[3px] font-cinema-display text-lg font-bold uppercase tracking-wide transition-colors sm:text-2xl ${
              isCreateAccount
                ? "text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Create account
          </Link>
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute -bottom-px left-0 h-[3px] w-1/2 bg-primary transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
              isCreateAccount ? "translate-x-full" : "translate-x-0"
            }`}
          />
        </nav>

        <form
          className="mt-7 space-y-5"
          onSubmit={submitForm}
          aria-busy={isSubmitting}
          aria-label={isCreateAccount ? "Create account form" : "Sign-in form"}
        >
          {isCreateAccount && (
            <div className="space-y-2">
              <label
                htmlFor="full-name"
                className="block text-sm font-semibold text-white"
              >
                Full name
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                placeholder="As it appears on your card"
                disabled={isSubmitting}
                onChange={() => setFeedback("")}
                className="h-[68px] w-full border border-white/20 bg-[#14110f] px-5 text-base text-white placeholder:text-white/45 focus-visible:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary sm:text-lg"
              />
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-white"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="name@example.com"
              disabled={isSubmitting}
              onChange={() => setFeedback("")}
              className="h-[68px] w-full border border-white/20 bg-[#14110f] px-5 text-base text-white placeholder:text-white/45 focus-visible:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary sm:text-lg"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-white"
            >
              Password
            </label>
            <div className="flex h-[68px] border border-white/20 bg-[#14110f] focus-within:border-primary focus-within:outline focus-within:outline-2 focus-within:outline-offset-0 focus-within:outline-primary">
              <input
                id="password"
                name="password"
                type={passwordVisible ? "text" : "password"}
                autoComplete={
                  isCreateAccount ? "new-password" : "current-password"
                }
                required
                minLength={isCreateAccount ? 8 : undefined}
                placeholder={
                  isCreateAccount ? "At least 8 characters" : "Your password"
                }
                disabled={isSubmitting}
                onChange={() => setFeedback("")}
                className="min-w-0 flex-1 bg-transparent px-5 text-base text-white placeholder:text-white/45 focus-visible:outline-none sm:text-lg"
              />
              <button
                type="button"
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                aria-pressed={passwordVisible}
                disabled={isSubmitting}
                onClick={() => setPasswordVisible((visible) => !visible)}
                className="inline-flex w-[68px] shrink-0 items-center justify-center border-l border-white/15 text-white/75 transition hover:bg-white/[0.04] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary"
              >
                {passwordVisible ? (
                  <EyeOff aria-hidden="true" className="size-5" />
                ) : (
                  <Eye aria-hidden="true" className="size-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-[76px] w-full items-center justify-center bg-primary px-5 text-lg font-bold text-primary-foreground transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none sm:text-xl"
          >
            {isSubmitting
              ? isCreateAccount
                ? "Creating account..."
                : "Signing in..."
              : isCreateAccount
                ? "Create account"
                : "Sign in"}
          </button>

          {feedback && (
            <p
              id="account-access-feedback"
              role="status"
              aria-live="polite"
              className="border border-amber-200/20 bg-amber-200/[0.06] px-4 py-3 text-sm leading-6 text-amber-50/85"
            >
              {feedback}
            </p>
          )}

          <p className="flex items-center gap-3 text-sm leading-6 text-white/50">
            <ShieldCheck
              aria-hidden="true"
              className="size-5 shrink-0 text-white/55"
            />
            When signed in, session tokens are stored in HTTP-only cookies and
            are not exposed to page scripts.
          </p>
        </form>
      </section>
    </main>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
