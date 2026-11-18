# Seat Selection Implementation Plan

## Objective and scope

Implement `/showtimes/[showtimeId]/seats` to satisfy
[FR-05](../spec.md) and this
[Seat Selection specification](./spec.md). Render the service-provided seat
layout and availability, support accessible selection, show the current
selection and price information, and hand off to the agreed Booking Summary
flow.

This page does not create or confirm a booking, process payment, or define the
account and seat-hold policies. The FOYER PDF and `Seat Selection.html` are
visual references only; their example data and unconfirmed behavior are not
contracts.

## Current project context

- The seat-selection route and interactive UI now have an explicit demo
  preview mode; live seat API integration is not implemented.
- Current `src/lib/movies` and `src/lib/theaters` services cover catalog and
  showtime data; no seat-map service or seat-selection API contract is defined.
- [Booking Summary](../booking-summary/spec.md) references FR-06 but leaves its
  route unresolved.
- Follow the existing `src/app`, `src/components`, and `src/lib` patterns.
  Keep server data access and validation separate from interactive seat-map
  state.

## Decisions and dependencies

Resolve or explicitly track the decisions in the
[specification](./spec.md#decisions-required-before-implementation) before
implementing dependent behavior. In particular, confirm:

- The showtime/seat layout/availability endpoints and error contract.
- How current availability is refreshed and revalidated.
- The Booking Summary route and handoff payload.
- Whether holds exist and their complete server-defined lifecycle.
- Seat limits, accessible-seat rules, price/currency behavior, and guest
  access.

Do not make up API paths, response shapes, prices, a seat limit, hold duration,
or a sign-in requirement. If a decision remains open, keep the implementation
boundary typed and omit any UI that would claim the behavior is supported.

## Proposed boundaries

Start with the smallest boundaries that fit the repository:

```text
src/
├── app/
│   └── showtimes/
│       └── [showtimeId]/
│           └── seats/
│               ├── page.tsx       # Validate route ID and load seat data
│               └── loading.tsx    # Seat-page loading skeleton
├── components/
│   └── booking/
│       ├── seat-selection-page.tsx # Interactive page composition
│       └── seat-map.tsx            # Layout, seat states, and keyboard use
└── lib/
    └── booking/
        ├── seat-service.ts         # Request and validate agreed API data
        └── seat-types.ts           # Confirmed response and UI types
```

These are proposed boundaries, not a requirement to create every file. Reuse
the shared customer shell, loading/error states, and existing data utilities.
Add client components only for selection and other browser interactions. Keep
seat layout and API response types based on confirmed contracts.

## Implementation sequence

### 1. Confirm the flow and map reference content

- Map the reference's showtime context, screen indicator, seat grid, legend,
  price-zone labels, selection summary, and continue action to approved
  requirements.
- Confirm which states, price details, accessible spaces, and actions are
  supported by the live data contract.
- Separate optional server-backed holds and booking progress from core
  selection.

**Gate:** every interactive control has a defined data source and destination;
no prototype-only values or behavior are treated as requirements.

### 2. Add route data and validation

- Validate the route identifier before requesting data.
- Add a typed service boundary for the agreed showtime, hall layout,
  availability, and price response.
- Validate nested seat/layout fields and verify the returned showtime matches
  the route. Use established service error patterns.
- Keep invalid identifier, confirmed not-found/unavailable, request failure,
  malformed response, sold-out, and no-usable-layout outcomes distinct.
- Do not infer seats from capacity, replace failed data with an empty map, or
  silently catch contract errors.

**Gate:** only validated data for the exact route showtime can render as a
usable map.

### 3. Build the page shell and responsive seat map

- Render movie/showtime context, screen orientation, hall rows, row/seat
  identifiers, aisles/gaps, and only the seat types returned by the service.
- Render a legend from the states actually present and any supported price
  zones.
- Keep the visual hierarchy aligned with the supplied reference and the
  existing Maqady dark theme, without copying sample data.
- Make the map horizontally operable on narrow screens while preventing
  page-level overflow.
- For the initial visual pass, keep the explicitly labeled local fixture
  behind `?demo=1`. The normal route must not render it as real showtime data.

**Gate:** every visible seat and status corresponds to its server-provided
layout and is understandable without relying on color. In demo mode only,
every fixture value is clearly identified as illustrative.

### 4. Implement selection and summary

- Keep selected seat IDs in transient client state scoped to the current
  showtime and loaded availability snapshot.
- Select/deselect only eligible seats. Apply seat-count, group, and accessible
  seat rules only when confirmed.
- Keep the selected-seat list, count, and price display synchronized; allow
  removal from the summary.
- Clearly distinguish a client-calculated display amount from an
  authoritative server quote. Never trust a client total for booking or
  payment.
- Keep the continue action disabled until at least one valid seat is selected.

**Gate:** selection is consistent across the map and summary, and invalid
seats cannot advance.

### 5. Revalidate and hand off safely

- On continue, use the agreed server-side revalidation or atomic hold operation
  before passing the selection to Booking Summary.
- Handle a seat conflict using the server response, explain the change, and
  require the customer to review the resulting selection.
- Add a hold timer only when a server hold is active and supplies a valid
  expiry; handle expiration and release without false reservation claims.
- Pass the exact showtime and selected seat identifiers through the agreed
  route/state contract. Do not proceed to payment or mark the booking
  confirmed.

**Gate:** stale or conflicting availability cannot be represented as a
successful handoff.

### 6. Verify accessibility, states, and integrity

- Test valid and invalid showtime IDs, request/contract failure, sold-out
  showtime, unusable layout, seat becoming unavailable, zero selection,
  selection removal, and hold expiry only if holds are implemented.
- Test keyboard selection and focus movement, accessible seat names/states,
  live announcements, visible focus, reduced motion, and touch operation.
- Check mobile, tablet, and desktop layouts for usable seat-map scrolling and
  no page-level horizontal overflow.
- Run focused tests where present, then `npm run lint` and `npm run build`.

**Completion gate:** all acceptance criteria in the
[Seat Selection specification](./spec.md#acceptance-criteria) pass, or
remaining API/product dependencies are documented instead of simulated.
