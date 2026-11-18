# Theater Details Implementation Plan

## Goal

Implement a resilient `/theaters/[theaterId]` page that combines the
confirmed theater detail and theater showtime APIs with the shared Maqady
shell, responsive dark-cinema UI, and a safe path toward seat selection.

## 1. Confirm and document contracts

- Capture complete live samples for:
  - `GET /theaters/{id}`
  - `GET /theaters/{id}/showtimes`
  - a theater with no cover/photos/phone
  - a theater with multiple phone entries
  - a response containing special-date overrides
  - a date with no showtimes
- Confirm the exact nested shape of `photos`, `weeklyHours`, `specialDates`,
  showtime prices, and `hasStarted`.
- Confirm whether the showtimes endpoint accepts a date query or always
  returns the seven-day window.
- Confirm booking/seat-selection route, authentication, and price units before
  adding a booking action.
- Do not block the information page on unresolved booking decisions; hide the
  booking action until its contract is approved.

## 2. Define typed service boundaries

Create or extend `src/lib/theaters/` with:

- `types.ts` for theater details, halls, hours, special dates, photos,
  showtimes, money, and result/error types.
- Runtime guards for every required and optional nested field.
- `service.ts` helpers:
  - `getTheaterDetails(theaterId)`
  - `getTheaterShowtimes(theaterId)`
  - shared URL validation, timeout, JSON parsing, HTTP handling, and logging
- Separate confirmed not-found errors from network, HTTP, and contract errors.
- Reuse image and cinema-time helpers where their contracts match.

## 3. Build the route boundary

Create:

- `src/app/theaters/[theaterId]/page.tsx`
- `src/app/theaters/[theaterId]/loading.tsx`
- `src/app/theaters/[theaterId]/error.tsx` if the app-level retry pattern
  requires a client error boundary

Route behavior:

- Validate the dynamic ID as a positive safe integer.
- Return not-found for invalid IDs or confirmed API 404.
- Load details first and showtimes after details succeed.
- Keep details visible when showtimes fail.
- Generate metadata from the loaded theater name where supported.
- Preserve server-rendered cinema-local date values.

## 4. Component structure

Create focused components under `src/components/theaters/`:

- `theater-details-page.tsx`: page composition and selected-date state.
- `theater-details-hero.tsx`: cover, identity, status, breadcrumb, and
  actions.
- `theater-information.tsx`: location, hours, contacts, and facilities.
- `theater-hours.tsx`: weekly hours, today highlight, special-date handling.
- `theater-halls.tsx`: complete hall/capacity list and empty state.
- `theater-showtimes.tsx`: date tabs, movie groups, showtime cards, and
  error/empty states.
- `theater-photos.tsx`: photo grid and shared lightbox integration.
- `theater-details-skeleton.tsx`: layout-matched loading state.

Keep phone, email, directions, showtime, and gallery controls independent;
avoid nested interactive content.

## 5. Implement theater information

- Render only API-provided values.
- Use `MediaImage` for cover and photos with meaningful fallback labels.
- Format open/close timestamps with the cinema timezone helper.
- Format weekly hour strings without converting them through the browser
  timezone.
- Highlight the server-provided `today.cinemaDate`.
- Apply special-date overrides only for the relevant cinema date.
- Map known facilities to labels and preserve unknown values safely.
- Create `tel:`, `mailto:`, WhatsApp, and directions links only from validated
  supplied data.

## 6. Implement halls and showtimes

- Calculate totals from validated returned halls; never invent capacity.
- Keep all returned halls visible, including halls with zero wheelchair seats.
- Build date tabs from the seven-day showtime response.
- Group selected-day entries by movie in API order.
- Filter or disable showtimes with `hasStarted === true` from booking actions.
- Display time, hall, and price data with a confirmed unit formatter.
- Distinguish no-showtime dates from failed showtime requests.
- Add seat-selection navigation only after the approved booking contract exists.

## 7. Add photos and media behavior

- Confirm the theater photo shape before coding the gallery adapter.
- Reuse the existing gallery behavior where the item shape is compatible;
  otherwise extract a shared media viewer without changing movie behavior.
- Support keyboard close/navigation and contained image display.
- Omit the photos section when the API returns no photos unless product
  approves an explicit empty section.

## 8. Validate

### Contract/service checks

- Valid full detail response.
- Null cover, empty photos, no phone, no email, and missing optional transit
  or parking data.
- Multiple phones and unknown facilities.
- Closed day and next-day closing hours.
- Special-date override and malformed date.
- Seven-day showtimes with multiple movies and halls.
- No-showtime date, started showtime, and missing price.
- 404, 503, timeout, invalid JSON, and invalid contract.

### UI checks

- Route ID validation and not-found behavior.
- Hero action visibility based on data.
- Hours/current-day highlight.
- Hall totals and complete hall rendering.
- Date-tab selection and movie grouping.
- Started showtimes not bookable.
- Details visible when showtimes fail.
- Empty photos and no-showtimes states.
- Keyboard focus, semantic tabs, responsive layout, and touch targets.

### Commands

```text
npm run lint
npm run build
```

Use focused tests if a test runner is introduced or already configured.
Otherwise validate runtime guards with the production build and live endpoint
smoke checks.

## 9. Documentation and checklist

- Keep [`spec.md`](./spec.md) as the product source of truth.
- Keep [`ai/index.md`](../index.md) linked to both the specification and plan.
- Update [`ai/task.md`](../task.md) only after implementation and validation.
- Update shared theater-details requirements if booking decisions become
  confirmed.
- Do not introduce map-provider or payment environment variables without
  documenting them in `README.md`.
