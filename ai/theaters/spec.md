# Theaters Listing Specification

## 1. Overview

- **Route:** `/theaters`
- **Purpose:** Help guests discover Maqady cinema locations, compare
  availability and facilities, and continue to theater details or showtime
  booking.
- **Audience:** Public guests and signed-in customers.
- **Related requirement:** [FR-04 — Theaters and Showtimes](../spec.md#fr-04----theaters-and-showtimes-theaters-theaters-theaterid).
- **Related page:** [Theater Details](../theater-details/spec.md).

The supplied theater reference shows a dark cinematic directory with a
large `THEATERS` heading, a location count, quick filters, a vertical list
of theater cards, and an optional map area. The reference HTML and
screenshot are visual guidance only; production content must come from the
theater API.

## 2. Page structure

### 2.1 Header and navigation

- Use the shared Maqady header and footer.
- Mark `/theaters` as the active primary navigation item.
- Display a short eyebrow containing the city/region and the number of halls
  or theaters when the API supplies those counts.
- Display the page heading `Theaters`.
- Provide a concise description explaining that guests can find cinemas,
  opening hours, facilities, and showtimes.

### 2.2 Quick filters

Provide accessible controls for:

- **All:** Show every theater in the returned directory.
- **Open now:** Show theaters whose server-provided `openState.isOpen` is
  true.
- **Parking:** Show theaters with `free_parking`, `valet_parking`, or
  `street_parking`.

Filter state may be local UI state unless the approved theater API supports
URL-backed filtering. A filter must not appear if the required data is not
available. Selected state must be conveyed by more than color.

### 2.3 Theater directory

Render a responsive list or grid of theater cards. Each card may include:

- Cover image with meaningful alt text, or a designed fallback when no cover
  exists.
- Theater name, district, city, and full address.
- Open/closed state and closing or next opening time in local time.
- Main phone number when supplied.
- Hall count when supplied.
- Recognized facilities with human-readable labels.

Cards must link to `/theaters/[theaterId]`. Phone and action controls must
remain independently keyboard accessible.

### 2.4 Card actions

- **Showtimes & info:** Navigate to the theater details page. If a movie
  context is later supported, preserve the selected movie and date.
- **Directions:** Use a configured map provider only when a valid destination
  is available. Otherwise hide the action.
- **Call:** Render a `tel:` link only when a phone number is supplied.

The page must not promise ticket availability merely because a theater is
open. Bookable showtimes are determined by the showtime service.

### 2.5 Map area

- A map is optional and must not block directory browsing or booking.
- If an approved provider and coordinates are available, show theater
  markers and connect marker selection with the corresponding card.
- If the provider is unavailable, blocked, or not configured, show a
  graceful placeholder or omit the map. Do not expose a broken embedded
  frame or third-party access-blocked page.
- The directory remains the source of truth for theater details.

## 3. Data contract

The page consumes theater records with the following fields when supplied:

```ts
type TheaterListItem = {
  id: number;
  name: string;
  district: string;
  city: string;
  address: string;
  cover: ImageAsset | null;
  openState: {
    isOpen: boolean;
    closesAt: string | null;
    nextOpensAt: string | null;
  };
  mainPhone: { label: string; number: string } | null;
  hallCount: number;
  facilities: string[];
};
```

The current Home response already provides equivalent `cinemas` records.
The theaters page should use a dedicated directory endpoint when one is
available so it can support pagination, filtering, coordinates, and
theater-specific metadata without depending on the Home payload.

The server is authoritative for open/closed state, cinema-local dates and
times, theater identity and address, facilities, showtimes, and booking
availability.

## 4. Loading, empty, and error states

- Show a layout-matched skeleton for the heading, filters, cards, and map
  while the directory is loading.
- Distinguish an empty directory from a filter with no matches.
- For a filter with no matches, provide a `Clear filters` action.
- If the directory request fails, show a recoverable error with a retry
  action; do not render an empty success state.
- Missing cover, phone, facilities, hours, or map data must be handled
  independently.
- If a theater has no upcoming showtimes, the details page should explain
  that state.

## 5. Accessibility and responsive behavior

- Use one `h1`, semantic filter controls, labelled actions, and keyboard
  operability throughout.
- Use `aria-pressed` or an equivalent selected state for quick filters.
- Keep visible focus indicators on cards, filters, phone links, and actions.
- Do not rely on the open indicator alone; include text such as `Open now`
  or `Closed`.
- Use meaningful image alt text; decorative map and fallback graphics must be
  hidden from assistive technology.
- Reflow cards to one column on narrow screens and multiple columns or a
  directory-plus-map layout on wide screens without horizontal overflow.

## 6. Acceptance criteria

1. A guest can open `/theaters` and see available theater cards.
2. The page shows accurate theater names, locations, hours/status, and
   optional metadata from the API.
3. All/Open now/Parking filters update the visible directory correctly.
4. A theater with no cover, phone, or facilities still renders a complete,
   usable card.
5. Every theater card opens its matching details route.
6. Directions and call actions appear only when their data and provider are
   available.
7. Loading, empty directory, no filter matches, request failure, and retry
   states are distinct and usable.
8. A map failure or unavailable provider does not prevent browsing or booking.
9. Past or unavailable showtimes are never presented as bookable on the
   theater details flow.
10. The page remains usable on mobile, tablet, desktop, keyboard navigation,
    and screen readers.

## 7. Decisions to confirm

- Dedicated theaters endpoint and pagination shape.
- Whether filters are URL-backed.
- Whether coordinates are available and which map provider is approved.
- Whether the directory includes all active theaters or only theaters with
  current showtimes.
- Whether a selected movie/date context can enter the theater directory.
- Exact copy and ordering of facilities.
