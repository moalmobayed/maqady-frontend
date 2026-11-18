import type { Metadata } from "next";
import { AccountAccessForm } from "@/components/auth/account-access-form";

export const metadata: Metadata = {
  title: "Sign In | Maqady",
  description: "Sign in to your Maqady Cinema account.",
};

export default function LoginPage() {
  return <AccountAccessForm mode="sign-in" />;
}
