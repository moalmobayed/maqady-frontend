# Seat Selection

- **Route:** `/showtimes/[showtimeId]/seats`
- **Canonical requirements:** [FR-05 -- Interactive Seat Selection](../spec.md)
- **Related page:** [Booking Summary](../booking-summary/spec.md)
- **Scope:** Load a show's seat layout and availability, let a guest select
  seats, show the selected-seat count and price, and hand the selection to
  Booking Summary.
- **Out of scope:** Creating or confirming a booking, collecting payment, and
  deciding account or seat-hold policy.
- **Design references:** The supplied 23-page FOYER PDF and `Seat Selection.html`
  guide visual direction and layout only. The HTML prototype's sample data and
  behaviors are not product or API contracts.

## Page structure

1. **Customer shell and showtime context**
   - Reuse the Maqady customer shell and established dark/orange visual
     language.
   - Identify the selected movie and showtime using service data: theater,
     hall, local date, and start time when supplied.
   - Keep the `showtimeId` in the route as the page identity. Do not use
     client-provided movie, hall, or price values as authoritative data.
   - Show a booking-step indicator only if the booking flow's steps and order
     are confirmed.
2. **Screen and seat map**
   - Show a labelled screen indicator and the service-provided hall layout,
     including row labels, seat numbers, aisles, gaps, and accessible spaces
     where defined.
   - Preserve the actual layout; do not infer missing rows or seats from a
     capacity count.
   - Make each seat's state and identifier available to sighted and
     assistive-technology users.
3. **Legend and price zones**
   - Explain the states that occur in the loaded layout: Available, Selected,
     Booked, and Temporarily Unavailable.
   - Include a transient/held state only when the service defines and returns
     it.
   - Show price zones and per-seat prices only when supplied for this showtime.
     Use the supplied currency and formatting rules.
   - Do not rely on color alone to communicate seat state or price zone.
4. **Selection summary and next action**
   - Show selected seat identifiers, selected-seat count, and a live total
     based on the current service-provided price data.
   - Mark the displayed total as subject to server revalidation when the API
     does not provide an authoritative quote.
   - Allow seats to be removed from the summary as well as toggled on the map.
   - Keep the continue action disabled until there is at least one currently
     available seat selected and the selection is valid.
   - Continue to the agreed Booking Summary flow with the exact showtime and
     selected seat identifiers. Do not skip directly to payment or imply a
     booking has been confirmed.

## Development preview

- The initial UI pass may be previewed with `?demo=1`. This mode uses local,
  illustrative showtime, seat, and price data and must display a prominent
  notice that it is not live.
- Without the explicit demo query, do not render the demo fixture as the
  requested show's data. Until the seat API is integrated, show a clear
  unavailable state with an action to open the demo preview.
- In demo mode, Continue must explain that availability, reservation, and
  Booking Summary are not connected. It must not navigate to a nonexistent
  route or claim a hold or booking.

## Functional requirements

### Showtime and layout data

- Load the selected showtime, hall layout, availability, and any prices from
  the agreed service contract for the route's `showtimeId`.
- Verify that returned showtime identity matches the route. A different or
  malformed response must not be rendered as valid data.
- Availability is specific to the selected showtime. The same physical seat
  may be available for a different showtime.
- Treat the server as the source of truth. Client state is only a pending
  selection until the server accepts or revalidates it.
- If live updates, polling, or a hold operation are not part of the confirmed
  contract, do not imply that the map is live or that selected seats are
  reserved.

### Seat selection

- Guests may select and deselect multiple Available seats.
- Booked and Temporarily Unavailable seats cannot be selected. A seat with an
  unknown state is not selectable.
- Update the selected identifiers, count, and displayed total when a valid
  seat is added or removed.
- Enforce and explain any maximum selection, group-seating, or accessible-seat
  rules only when those rules are defined by the product or service.
- Before handoff, revalidate the selected seats with the server or use an
  agreed atomic server-side hold/booking operation. If any selection is no
  longer available, explain which seats changed, update the selection only
  from the returned authoritative state, and require the customer to review
  before continuing.
- Seat selection does not itself create a booking or guarantee availability
  after leaving this page.

### Holds and expiry

- A hold timer may be shown only when the server has created a hold and
  provides its authoritative expiry.
- A client-only timer must never imply that seats are reserved.
- Hold duration, renewal, expiry, release, reconnect, sign-in preservation,
  and behavior after expiry are unresolved until the backend and product
  contract define them.

## Loading, empty, and error states

- **Loading:** Show a layout-matched skeleton while the showtime and seat data
  load.
- **Request or contract error:** Explain that seat information is unavailable
  and provide a retry where the failure is recoverable. Do not convert a
  failed request or invalid response into an empty or available seat map.
- **Invalid or unavailable showtime:** Show a distinct state and a working
  route back to movie/showtime selection when that destination is known.
- **Sold out:** Show this only when the service confirms no seats can be
  selected. Distinguish it from a failed or empty response.
- **Availability conflict:** Explain that availability changed, reflect the
  server response, and let the customer make a new selection.
- **Expired hold:** Explain that the server released the seats and offer a
  supported way to reselect or choose another showtime. Do not claim seats
  remain held.
- **No usable layout:** Explain that seat selection is unavailable; never
  synthesize seats from a seat count.

## Accessibility and responsive behavior

- Use semantic headings and a labelled seat-map region. Give every seat an
  accessible name containing its row/seat identifier and state.
- Make available seats operable by keyboard. Provide predictable focus
  movement within the map, and retain focus when a seat is selected or
  deselected.
- Expose selected, booked, unavailable, and accessible-space status without
  relying on color or icon alone. Disabled seats must not appear operable.
- Announce meaningful selection-count, total, and availability changes
  without announcing every visual detail of the map.
- Keep row labels and seat numbers visible and understandable when the map is
  horizontally scrolled on small screens. Keep selection summary and continue
  action reachable without page-level horizontal overflow.
- Support touch targets, visible focus, readable contrast, and reduced motion.

## Acceptance criteria

- [ ] The route loads data for exactly the requested `showtimeId`.
- [ ] The map matches the returned hall layout and does not invent seats or
      availability.
- [ ] Available seats can be selected and deselected; booked, unavailable,
      and unknown-state seats cannot be selected.
- [ ] The selected-seat list, count, and displayed total stay synchronized
      when seats are selected or removed.
- [ ] Continue is unavailable with no valid seats selected and hands off the
      exact showtime and selected seats to the agreed Booking Summary flow.
- [ ] The server revalidates availability before the next booking step; a
      conflict is clearly reported and cannot produce a false success.
- [ ] Any hold indicator is backed by an active server hold and its expiry.
- [ ] Loading, request failure, invalid showtime, sold out, unusable layout,
      and availability conflict are distinguishable.
- [ ] The map and summary work with keyboard, assistive technology, touch,
      and narrow viewports without color-only status or page-level overflow.
- [ ] No sample prices, seat limits, expiry durations, or prototype user data
      are presented as live product facts.

## Decisions required before implementation

1. What are the seat-layout, availability, and showtime endpoint contracts,
   identifier formats, validation rules, and error semantics?
2. How is availability refreshed, and how are concurrent selections reported?
3. Does the backend support seat holds? If so, define duration, expiry,
   release, renewal, refresh/reconnect behavior, and whether a hold survives
   sign-in.
4. What is the approved maximum seat count and are there group-seating,
   accessible-seat, or companion-seat rules?
5. Are prices attached to seats or zones? Confirm currency, fees/discounts,
   quote behavior, and the server's authoritative total.
6. May guests select seats, or is authentication required before selection or
   before the next booking step?
7. What is the Booking Summary route and how are the showtime, selection, and
   any server hold carried forward?
8. What is the supported recovery destination for an invalid/expired
   showtime?

Do not resolve these questions by copying the reference prototype's prices,
eight-seat limit, five-minute timer, credentials, or navigation behavior.

See the [Seat Selection implementation plan](./plan.md) for implementation
sequence and verification gates.
