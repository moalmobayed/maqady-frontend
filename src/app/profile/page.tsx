import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile/profile-page";
import { getCurrentProfile } from "@/lib/profile/service";

export const metadata: Metadata = {
  title: "Profile | Maqady",
  description: "View your Maqady Cinema account details.",
};

export default async function ProfileRoute() {
  const result = await getCurrentProfile();
  return <ProfilePage result={result} />;
}
