import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { TheaterDetailsPage } from "@/components/theaters/theater-details-page";
import { getTheaterDetails, getTheaterShowtimes } from "@/lib/theaters/service";

type Props = { params: Promise<{ theaterId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { theaterId } = await params;
  if (!/^[1-9]\d*$/.test(theaterId)) return { title: "Theater | Maqady" };
  const result = await getTheaterDetails(Number(theaterId));
  return { title: result.ok ? `${result.data.name} | Maqady` : "Theater | Maqady" };
}

export default async function TheaterDetailsRoute({ params }: Props) {
  await connection();
  const { theaterId } = await params;
  if (!/^[1-9]\d*$/.test(theaterId)) notFound();
  const id = Number(theaterId);
  if (!Number.isSafeInteger(id)) notFound();
  const details = await getTheaterDetails(id);
  if (!details.ok) {
    if (details.error.kind === "not-found") notFound();
    return <div className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-16 pt-32"><ErrorBoundaryState message={details.error.message} /></div>;
  }
  const showtimes = await getTheaterShowtimes(id);
  return <TheaterDetailsPage theater={details.data} showtimes={showtimes.ok ? showtimes.data : null} showtimesError={showtimes.ok ? null : showtimes.error.message} />;
}

function ErrorBoundaryState({ message }: { message: string }) {
  return <section role="alert" className="border border-red-500/30 bg-[#151313] p-8 text-center"><h1 className="font-cinema-display text-3xl uppercase">Theater unavailable</h1><p className="mt-3 text-sm text-white/60">{message}</p><Link href="/theaters" className="mt-5 inline-block border border-primary px-4 py-2 text-sm text-primary">Back to theaters</Link></section>;
}
