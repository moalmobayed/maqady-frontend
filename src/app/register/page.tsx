import type { Metadata } from "next";
import { AccountAccessForm } from "@/components/auth/account-access-form";

export const metadata: Metadata = {
  title: "Create Account | Maqady",
  description: "Create a Maqady Cinema account.",
};

export default function RegisterPage() {
  return <AccountAccessForm mode="create-account" />;
}
