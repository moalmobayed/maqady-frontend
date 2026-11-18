export type DemoSeatZone = "front" | "middle" | "back";
export type DemoSeatStatus = "available" | "booked" | "unavailable";

export type DemoSeat = {
  id: string;
  row: string;
  number: number;
  zone: DemoSeatZone;
  price: number;
  status: DemoSeatStatus;
  wheelchair: boolean;
};

export type DemoSeatRow = {
  label: string;
  zone: DemoSeatZone;
  seats: DemoSeat[];
};

export const demoSeatZones: {
  id: DemoSeatZone;
  name: string;
  rows: string;
  price: number;
}[] = [
  { id: "front", name: "Front", rows: "A-C", price: 150 },
  { id: "middle", name: "Middle", rows: "D-H", price: 190 },
  { id: "back", name: "Back", rows: "I-M", price: 230 },
];

const rowLabels = "ABCDEFGHIJKLM".split("");
const bookedSeats = new Set([
  "A1", "A2", "A5", "A7", "A8", "A11", "A16",
  "B3", "B6", "B9", "B10", "B13", "B16",
  "C2", "C4", "C7", "C8", "C11", "C14",
  "D3", "D4", "D9", "D12", "D16",
  "E1", "E5", "E10", "E14",
  "F2", "F12", "F15",
  "G1", "G3", "G6", "G11", "G16",
  "H4", "H8", "H13", "H15",
  "I2", "I7", "I10", "I14",
  "J1", "J6", "J9", "J12", "J16",
  "K3", "K5", "K11", "K15",
  "L4", "L8", "L13",
  "M5", "M9", "M12",
]);
const unavailableSeats = new Set([
  "D10", "E8", "F10", "G14", "H7", "I4", "J13", "K7",
]);
const wheelchairSeats = new Set(["M1", "M2", "M15", "M16"]);

function getZone(row: string): DemoSeatZone {
  if ("ABC".includes(row)) return "front";
  if ("DEFGH".includes(row)) return "middle";
  return "back";
}

export const demoSeatRows: DemoSeatRow[] = rowLabels.map((row) => {
  const zone = getZone(row);
  const zonePrice = demoSeatZones.find((item) => item.id === zone)!.price;

  return {
    label: row,
    zone,
    seats: Array.from({ length: 16 }, (_, index) => {
      const number = index + 1;
      const id = `${row}${number}`;

      return {
        id,
        row,
        number,
        zone,
        price: zonePrice,
        status: bookedSeats.has(id)
          ? "booked"
          : unavailableSeats.has(id)
            ? "unavailable"
            : "available",
        wheelchair: wheelchairSeats.has(id),
      };
    }),
  };
});

export const initialDemoSeatIds = ["F7", "F8"];
export const demoSeatLimit = 8;
