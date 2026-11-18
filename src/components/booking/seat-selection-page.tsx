"use client";

import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
} from "react";
import {
  demoSeatLimit,
  demoSeatRows,
  demoSeatZones,
  initialDemoSeatIds,
  type DemoSeat,
  type DemoSeatRow,
  type DemoSeatStatus,
  type DemoSeatZone,
} from "@/lib/booking/demo-seat-map";

const zoneNames: Record<DemoSeatZone, string> = {
  front: "Front",
  middle: "Middle",
  back: "Back",
};

const seatGroups = [
  demoSeatRows[0].seats.slice(0, 4).map((seat) => seat.number),
  demoSeatRows[0].seats.slice(4, 12).map((seat) => seat.number),
  demoSeatRows[0].seats.slice(12).map((seat) => seat.number),
];

function getStatusLabel(status: DemoSeatStatus, selected: boolean) {
  if (selected) return "selected";
  if (status === "booked") return "booked";
  if (status === "unavailable") return "temporarily unavailable";
  return "available";
}

function formatDemoPrice(amount: number) {
  return `EGP ${amount.toLocaleString("en-US")}`;
}

function seatClassName(
  status: DemoSeatStatus,
  selected: boolean,
  wheelchair: boolean,
) {
  const base =
    "relative inline-flex size-9 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none sm:size-10";

  if (selected) {
    return `${base} border-primary bg-primary text-primary-foreground`;
  }
  if (status === "booked") {
    return `${base} cursor-not-allowed border-white/5 bg-[#191513] text-white/30`;
  }
  if (status === "unavailable") {
    return `${base} cursor-not-allowed border-dashed border-amber-200/30 bg-[repeating-linear-gradient(135deg,#211d1a_0px,#211d1a_5px,#302820_5px,#302820_7px)] text-amber-100/45`;
  }
  if (wheelchair) {
    return `${base} border-sky-400/50 bg-sky-950/60 text-sky-200 hover:border-sky-300 hover:bg-sky-900/70`;
  }
  return `${base} border-white/10 bg-[#241f1c] text-white/80 hover:border-white/35 hover:bg-[#332b26]`;
}

function SeatRow({
  row,
  rowIndex,
  ariaRowIndex,
  selectedIds,
  focusedSeatId,
  seatRefs,
  onSeatFocus,
  onSeatSelect,
  onSeatKeyDown,
}: {
  row: DemoSeatRow;
  rowIndex: number;
  ariaRowIndex: number;
  selectedIds: string[];
  focusedSeatId: string;
  seatRefs: MutableRefObject<Map<string, HTMLButtonElement>>;
  onSeatFocus: (seatId: string) => void;
  onSeatSelect: (seat: DemoSeat) => void;
  onSeatKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    rowIndex: number,
    seatNumber: number,
  ) => void;
}) {
  return (
    <div
      role="row"
      aria-label={`Row ${row.label}`}
      aria-rowindex={ariaRowIndex}
      className="grid grid-cols-[1.25rem_1fr_1.25rem] items-center gap-2 sm:grid-cols-[1.5rem_1fr_1.5rem] sm:gap-3"
    >
      <span
        role="rowheader"
        className="text-center font-mono text-[10px] font-semibold text-white/45"
      >
        {row.label}
      </span>
      <div role="presentation" className="flex min-w-max items-center justify-center gap-1.5 sm:gap-2">
        {seatGroups.map((group, groupIndex) => (
          <div
            key={`${row.label}-${groupIndex}`}
            role="presentation"
            className="flex items-center gap-1.5 sm:gap-2"
          >
            {group.map((number) => {
              const seat = row.seats[number - 1];
              const selected = selectedIds.includes(seat.id);
              const disabled = seat.status !== "available";
              const statusLabel = getStatusLabel(seat.status, selected);

              return (
                <div
                  key={seat.id}
                  role="gridcell"
                  aria-colindex={number}
                  className="flex"
                >
                  <button
                    ref={(element) => {
                      if (element) seatRefs.current.set(seat.id, element);
                      else seatRefs.current.delete(seat.id);
                    }}
                    type="button"
                    disabled={disabled}
                    tabIndex={
                      disabled ? -1 : focusedSeatId === seat.id ? 0 : -1
                    }
                    aria-label={`${seat.wheelchair ? "Wheelchair space, " : ""}Row ${row.label}, seat ${number}, ${statusLabel}, ${zoneNames[seat.zone]} zone, ${formatDemoPrice(seat.price)}`}
                    aria-pressed={selected}
                    onFocus={() => onSeatFocus(seat.id)}
                    onClick={() => onSeatSelect(seat)}
                    onKeyDown={(event) =>
                      onSeatKeyDown(event, rowIndex, number)
                    }
                    className={seatClassName(
                      seat.status,
                      selected,
                      seat.wheelchair,
                    )}
                  >
                    {seat.wheelchair ? (
                      <Accessibility aria-hidden="true" className="size-4" />
                    ) : seat.status === "booked" ? (
                      <X aria-hidden="true" className="size-3" />
                    ) : (
                      number
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <span aria-hidden="true" className="text-center font-mono text-[10px] text-white/25">
        {row.label}
      </span>
    </div>
  );
}

function BookingProgress() {
  const steps = [
    { number: "01", label: "Showtime", done: true },
    { number: "02", label: "Seats", current: true },
    { number: "03", label: "Checkout" },
    { number: "04", label: "Ticket" },
  ];

  return (
    <ol
      aria-label="Demo booking progress"
      className="grid w-full grid-cols-4 gap-2 sm:max-w-[430px]"
    >
      {steps.map((step) => (
        <li
          key={step.number}
          aria-current={step.current ? "step" : undefined}
          className={`border-t-2 pt-2 ${
            step.current
              ? "border-primary text-white"
              : step.done
                ? "border-white/50 text-white/75"
                : "border-white/10 text-white/30"
          }`}
        >
          <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] sm:text-[10px]">
            {step.done && <Check aria-hidden="true" className="size-3" />}
            {step.number} {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function SeatSelectionPage() {
  const [selectedIds, setSelectedIds] = useState(initialDemoSeatIds);
  const [focusedSeatId, setFocusedSeatId] = useState(initialDemoSeatIds[0]);
  const [notice, setNotice] = useState("");
  const [continueMessage, setContinueMessage] = useState("");
  const seatRefs = useRef(new Map<string, HTMLButtonElement>());
  const allSeats = demoSeatRows.flatMap((row) => row.seats);
  const selectedSeats = selectedIds
    .map((id) => allSeats.find((seat) => seat.id === id))
    .filter((seat): seat is DemoSeat => seat !== undefined);
  const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  function selectSeat(seat: DemoSeat) {
    setContinueMessage("");
    setNotice("");
    setFocusedSeatId(seat.id);
    if (selectedIds.includes(seat.id)) {
      setSelectedIds((current) => current.filter((id) => id !== seat.id));
      return;
    }
    if (selectedIds.length >= demoSeatLimit) {
      setNotice("Demo selections are limited to 8 seats.");
      return;
    }
    setSelectedIds((current) => [...current, seat.id]);
  }

  function focusSeat(seat: DemoSeat | undefined) {
    if (!seat || seat.status !== "available") return false;
    setFocusedSeatId(seat.id);
    seatRefs.current.get(seat.id)?.focus();
    return true;
  }

  function handleSeatKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    rowIndex: number,
    seatNumber: number,
  ) {
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
    };
    const direction = directions[event.key];

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const row = demoSeatRows[rowIndex];
      const candidates =
        event.key === "Home" ? row.seats : [...row.seats].reverse();
      focusSeat(candidates.find((seat) => seat.status === "available"));
      return;
    }

    if (!direction) return;
    event.preventDefault();

    let targetRowIndex = rowIndex;
    let targetNumber = seatNumber;
    for (let attempt = 0; attempt < 16; attempt += 1) {
      targetRowIndex += direction[0];
      targetNumber += direction[1];
      if (
        targetRowIndex < 0 ||
        targetRowIndex >= demoSeatRows.length ||
        targetNumber < 1 ||
        targetNumber > 16
      ) {
        return;
      }
      const target = demoSeatRows[targetRowIndex].seats[targetNumber - 1];
      if (focusSeat(target)) return;
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 pb-14 pt-24 text-white sm:px-8 sm:pt-28 lg:px-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <Link
              href="/movies"
              aria-label="Back to movies"
              className="mt-1 inline-flex size-10 shrink-0 items-center justify-center border border-white/15 bg-white/[0.03] text-white/75 transition hover:border-white/40 hover:text-white"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Link>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 border border-amber-300/40 bg-amber-300/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-100">
                Demo preview
              </span>
              <h1 className="mt-3 font-cinema-display text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
                Choose your seats
              </h1>
              <p className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide text-white/65 sm:text-xs">
                <span className="bg-white/10 px-2 py-1">
                  The Last Lighthouse
                </span>
                <span className="bg-white/10 px-2 py-1">
                  Foyer Zamalek · Hall 3
                </span>
                <span className="bg-white/10 px-2 py-1">
                  Thu 15 Oct · 19:30
                </span>
                <span className="bg-white/10 px-2 py-1">2D · 12+</span>
              </p>
            </div>
          </div>
          <BookingProgress />
        </div>

        <p
          role="note"
          className="border border-amber-200/20 bg-amber-200/[0.06] px-4 py-3 text-xs leading-5 text-amber-50/80"
        >
          Demo data only. These seats, prices, and showtime details are
          illustrative; availability is not live and selecting seats does not
          reserve or book them.
        </p>

        <section
          aria-label="Demo seat map"
          className="border border-white/[0.08] bg-[#110e0c] px-3 py-8 sm:px-6 sm:py-10 lg:px-8"
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
            <div
              aria-hidden="true"
              className="h-8 w-[72%] rounded-[50%] border-b-[3px] border-white/80 shadow-[0_12px_24px_-15px_rgba(255,255,255,0.75)] sm:h-10"
            />
            <h2 className="mt-3 text-[9px] font-bold uppercase tracking-[0.45em] text-white/45">
              Screen
            </h2>

            <ul
              aria-label="Seat status legend"
              className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-3 text-[10px] text-white/70 sm:gap-x-6 sm:text-xs"
            >
              <li className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-4 rounded border border-white/15 bg-[#241f1c]"
                />
                Available
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-4 rounded bg-primary"
                />
                Selected
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex size-4 items-center justify-center rounded bg-[#191513] text-white/45"
                >
                  <X aria-hidden="true" className="size-3" />
                </span>
                Booked
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-4 rounded border border-dashed border-amber-100/40 bg-[#302820]"
                />
                Temporarily unavailable
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex size-4 items-center justify-center rounded border border-sky-300/50 bg-sky-950/60 text-sky-200"
                >
                  <Accessibility aria-hidden="true" className="size-3" />
                </span>
                Wheelchair space
              </li>
            </ul>

            <div
              aria-label="Demo prices by seat zone"
              className="mt-6 flex flex-wrap justify-center gap-2"
            >
              {demoSeatZones.map((zone) => (
                <span
                  key={zone.id}
                  className="flex items-center gap-2 bg-white/[0.06] px-3 py-2 text-[10px] text-white/70 sm:text-xs"
                >
                  <span className="font-cinema-display font-bold uppercase tracking-wide text-white">
                    {zone.name}
                  </span>
                  <span>Rows {zone.rows}</span>
                  <span className="font-semibold text-white">
                    {formatDemoPrice(zone.price)} / seat
                  </span>
                </span>
              ))}
            </div>

            <p className="mt-3 text-center text-[10px] text-white/35">
              Example seat prices only · EGP
            </p>

            <div className="mt-6 w-full overflow-x-auto overscroll-x-contain pb-3">
              <div
                className="mx-auto flex w-max min-w-full flex-col gap-5 px-2"
              >
                {demoSeatZones.map((zone) => {
                  const rows = demoSeatRows.filter(
                    (row) => row.zone === zone.id,
                  );
                  const firstIndex = demoSeatRows.findIndex(
                    (row) => row.zone === zone.id,
                  );
                  return (
                    <section
                      key={zone.id}
                      aria-labelledby={`demo-zone-${zone.id}`}
                      className="flex flex-col gap-2"
                    >
                      <h3
                        id={`demo-zone-${zone.id}`}
                        className="mx-0 mr-auto border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/55 sm:mx-auto sm:mr-0"
                      >
                        {zone.name} · Rows {zone.rows} ·{" "}
                        {formatDemoPrice(zone.price)}
                      </h3>
                      <div
                        role="grid"
                        aria-label={`${zone.name} zone seats`}
                        aria-rowcount={rows.length}
                        aria-colcount={16}
                        className="flex flex-col gap-2"
                      >
                        {rows.map((row, zoneRowIndex) => (
                          <SeatRow
                            key={row.label}
                            row={row}
                            rowIndex={firstIndex + zoneRowIndex}
                            ariaRowIndex={zoneRowIndex + 1}
                            selectedIds={selectedIds}
                            focusedSeatId={focusedSeatId}
                            seatRefs={seatRefs}
                            onSeatFocus={setFocusedSeatId}
                            onSeatSelect={selectSeat}
                            onSeatKeyDown={handleSeatKeyDown}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
            <p className="mt-1 text-[10px] text-white/40">
              Swipe or scroll sideways to view the full seat map.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="seat-summary-heading"
          className="border border-white/10 bg-[#151210] p-4 sm:p-5"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <h2
                id="seat-summary-heading"
                className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50"
              >
                Your seats ·{" "}
                <span aria-live="polite">
                  {selectedSeats.length} of {demoSeatLimit}
                </span>
              </h2>
              <div className="mt-3 flex min-h-11 flex-wrap items-center gap-2">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((seat) => (
                    <span
                      key={seat.id}
                      className="inline-flex h-11 items-center gap-2 border border-white/[0.08] bg-white/[0.04] px-3"
                    >
                      <span className="font-cinema-display text-xl font-bold">
                        {seat.id}
                      </span>
                      <span className="text-[10px] text-white/50">
                        {zoneNames[seat.zone]} · {formatDemoPrice(seat.price)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove seat ${seat.id}`}
                        onClick={() => selectSeat(seat)}
                        className="inline-flex size-8 items-center justify-center text-white/55 transition hover:bg-white/10 hover:text-white"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-white/50">
                    Choose available seats on the map.
                  </p>
                )}
              </div>
              {notice && (
                <p role="alert" className="mt-2 text-xs text-amber-100">
                  {notice}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-4 lg:min-w-[340px] lg:justify-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div className="lg:text-right">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">
                  Demo total
                </span>
                <span
                  aria-live="polite"
                  className="mt-1 block font-cinema-display text-4xl font-bold leading-none sm:text-5xl"
                >
                  {formatDemoPrice(total)}
                </span>
              </div>
              <button
                type="button"
                disabled={selectedSeats.length === 0}
                onClick={() =>
                  setContinueMessage(
                    "Demo only: live availability, seat holds, booking summary, and checkout are not connected.",
                  )
                }
                className="inline-flex h-12 w-full items-center justify-center gap-2 bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35 sm:w-auto sm:min-w-48 motion-reduce:transition-none"
              >
                Continue
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
          <p className="mt-4 text-[10px] leading-5 text-white/40">
            Demo prices are illustrative. No reservation is created and seats
            are not held.
          </p>
          {continueMessage && (
            <p
              role="status"
              aria-live="polite"
              className="mt-3 border border-amber-200/20 bg-amber-200/[0.06] px-3 py-2 text-xs text-amber-50/80"
            >
              {continueMessage}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export function SeatSelectionUnavailable({ demoHref }: { demoHref: string }) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16 pt-32 sm:px-8">
      <section
        aria-labelledby="seat-map-unavailable-heading"
        className="border border-white/10 bg-[#151210] p-8 text-center sm:p-12"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Seat selection
        </p>
        <h1
          id="seat-map-unavailable-heading"
          className="mt-3 font-cinema-display text-4xl uppercase sm:text-5xl"
        >
          Live seat data isn&apos;t connected yet
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60">
          The seat map needs a backend layout and availability contract. You
          can preview the interface with clearly labeled demo data; the demo
          cannot reserve seats or create a booking.
        </p>
        <Link
          href={demoHref}
          className="mt-7 inline-flex h-12 items-center justify-center gap-2 bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-accent motion-reduce:transition-none"
        >
          Preview demo seat map
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
    </main>
  );
}
