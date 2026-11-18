import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SeatSelectionPage,
  SeatSelectionUnavailable,
} from "@/components/booking/seat-selection-page";

export const metadata: Metadata = {
  title: "Choose Your Seats | Maqady",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ showtimeId: string }>;
  searchParams: Promise<{ demo?: string | string[] }>;
};

export default async function SeatSelectionRoute({
  params,
  searchParams,
}: Props) {
  const [{ showtimeId }, query] = await Promise.all([params, searchParams]);
  if (!/^[1-9]\d*$/.test(showtimeId) || !Number.isSafeInteger(Number(showtimeId))) {
    notFound();
  }

  const demo = Array.isArray(query.demo)
    ? query.demo.includes("1")
    : query.demo === "1";

  if (!demo) {
    return (
      <SeatSelectionUnavailable
        demoHref={`/showtimes/${showtimeId}/seats?demo=1`}
      />
    );
  }

  return <SeatSelectionPage />;
}
