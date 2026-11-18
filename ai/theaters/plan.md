# Theaters Listing Implementation Plan

## Goal

Implement `/theaters` as a resilient public theater directory using the
shared Maqady shell, the approved theater API contract, and the behavior
defined in [`spec.md`](./spec.md).

## 1. Confirm the API contract

- Identify the dedicated theaters list endpoint and query parameters.
- Confirm pagination or cursor behavior, totals, and filter support.
- Confirm image assets, local timezone behavior, open-state semantics,
  facilities, phone numbers, coordinates, and showtime summaries.
- Confirm whether theater details and showtimes already have service helpers.
- Do not fabricate map coordinates, phone numbers, hours, ratings, or
  showtimes when the API omits them.

## 2. Define typed service boundaries

- Add or extend theater types under `src/lib/theaters/`.
- Add runtime validators for list responses and optional nested fields.
- Add a server-only theater service with URL validation, timeout handling,
  JSON parsing, and explicit configuration/network/HTTP/contract errors.
- Add pagination support if required by the endpoint.
- Reuse shared image and time helpers where their contracts match.

## 3. Build the route entrypoint

- Create `src/app/theaters/page.tsx`.
- Parse and validate any approved URL query state.
- Load the initial theater page on the server.
- Keep server-provided cinema-local dates/times as the source for status
  labels.
- Render a recoverable error state instead of an empty directory on failure.
- Add loading and route error boundaries if the existing app shell requires
  them.

## 4. Build the directory UI

Create focused components under `src/components/theaters/`:

- `theaters-page.tsx`: page composition and state boundary.
- `theaters-filters.tsx`: All/Open now/Parking controls.
- `theater-card.tsx`: image, status, metadata, and actions.
- `theaters-grid.tsx`: responsive results and empty states.
- `theater-map.tsx`: optional provider integration or graceful fallback.
- `theaters-skeleton.tsx`: loading layout.

Use existing UI primitives and styling conventions rather than duplicating
error, empty, modal, or image behavior.

## 5. Implement filtering and pagination

- Apply All/Open now/Parking consistently to displayed records.
- Prefer server-side filtering when the API supports it; otherwise apply only
  filters whose data is present and bounded.
- Keep counts and visible results synchronized.
- If pagination is cursor-based, preserve the cursor contract and deduplicate
  appended theater IDs.
- Show pagination controls only when the API reports more data.
- Ensure changing filters resets the current page/cursor.

## 6. Add navigation and actions

- Link every card to `/theaters/[theaterId]`.
- Use `tel:` only for valid supplied phone numbers.
- Add directions only after map provider and destination requirements are
  confirmed.
- Preserve approved movie/date context when entering from a showtime flow.
- Ensure nested links/buttons do not trigger the wrong card navigation.

## 7. Integrate the optional map safely

- Implement the map behind the confirmed provider/configuration boundary.
- Avoid exposing a broken iframe or relying on a provider that blocks the
  browser.
- Show a useful fallback when coordinates/provider credentials are absent.
- Keep marker/card selection synchronized only after the interaction model is
  confirmed.

## 8. Validate

### Contract and service tests

- Valid response with full optional metadata.
- Missing cover, phone, facilities, coordinates, and hours.
- Invalid image variants and malformed dates.
- Empty results and paginated results.
- Network failure, timeout, non-2xx response, invalid JSON, and invalid
  contract.

### UI tests

- Initial loading skeleton.
- All/Open now/Parking filter behavior.
- No-match state and clear filters.
- Card links, phone links, and conditional directions.
- Keyboard focus and selected filter announcements.
- Responsive one-column and multi-column layouts.
- Map fallback does not block the directory.

### Commands

```text
npm run lint
npm run build
```

Run focused tests if a test runner is added or already configured; otherwise
verify service validators and the production build.

## 9. Documentation and checklist

- Keep [`ai/index.md`](../index.md) linked to this specification and plan.
- Update `README.md` only if a new environment variable or map provider is
  introduced.
- Mark the related item in [`ai/task.md`](../task.md) complete only after
  implementation and validation.
- Keep unresolved API/provider decisions documented until confirmed.
