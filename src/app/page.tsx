import type { Metadata } from "next";
import { connection } from "next/server";
import { HomeContent } from "@/components/home/home-content";
import { getHomeData } from "@/lib/home/service";

export const metadata: Metadata = {
  title: "Discover Movies | Maqady",
  description:
    "Discover movies showing now, explore upcoming releases, and find a Maqady cinema.",
};

export default async function HomePage() {
  await connection();
  const result = await getHomeData();

  return (
    <HomeContent
      data={result.ok ? result.data : null}
      error={result.ok ? null : result.error}
    />
  );
}
