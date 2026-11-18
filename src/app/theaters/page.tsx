import type { Metadata } from "next";
import { connection } from "next/server";
import { TheatersPage } from "@/components/theaters/theaters-page";
import { getTheaters } from "@/lib/theaters/service";

export const metadata: Metadata = {
  title: "Theaters | Maqady",
  description:
    "Find Maqady cinemas, opening hours, facilities, directions, and showtimes.",
};

export default async function TheatersRoute() {
  await connection();
  const result = await getTheaters();

  return (
    <TheatersPage
      data={result.ok ? result.data : null}
      error={result.ok ? null : result.error}
    />
  );
}
