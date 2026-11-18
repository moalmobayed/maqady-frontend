# Movie Details Implementation Plan

## Objective and scope

Implement the public `/movies/[movieId]` route to satisfy
[FR-03](../spec.md) and the
[Movie Details specification](./spec.md). Match the screenshot's
content order and dark Maqady visual direction while using real
application data and routes.

This track includes movie details, available media/credits, and
date/cinema/showtime selection through the handoff to seat selection.
Seat-map implementation, booking creation, payment, and authentication
are separate tracks. Do not use the screenshot or bundled HTML artifact
as an API contract or source of production data.

## Current implementation status

- The dynamic `/movies/[movieId]` route now loads validated detail and
  showtime responses and renders the screenshot-inspired overview,
  media gallery, credits, date/cinema/showtime selectors, and details.
- Route loading, unexpected error recovery, unknown movie, movie
  request failure, and showtime request failure states are implemented.
- The page uses shared customer layout, image, error, and modal
  components. Video playback uses the API's validated YouTube ID.
- Build and lint pass. Browser checks covered a now-showing movie, a
  coming-soon movie, an unknown movie ID, video/photo dialogs,
  showtime selection/reset, and a narrow viewport without horizontal
  overflow.
- Detail, showtime, price-summary, and similar-movie API data are
  connected and validated. Similar movies load from
  `GET /movies/{movieId}/similar`.
- Product/API follow-ups remain: the seat-selection destination is not
  implemented yet, and the current showtime response exposes
  `hasStarted` but no sold-out field.

Continue to reuse shared customer layout, image, loading/empty/error,
and styling patterns. Keep detail data separate from the Home
aggregate and catalog unless the API contract provides a safe shared
source.

## Decisions and dependencies

Before implementing dependent behavior, confirm the detail/showtime
endpoint contracts, response and error shapes, date range and cinema
timezone, sold-out availability, seat route, media player, rating
policy, and guest continuation policy. The detail endpoint supplies
starting-price amounts in minor currency units, and the similar-movies
endpoint supplies related movie cards.
The full decision list is in the
[specification](./spec.md#decisions-required-before-implementation).

Until confirmed, build against typed boundaries and omit unsupported
optional UI. Do not introduce mock values or treat malformed/failed
responses as valid empty data.

## Proposed route and component boundaries

Start with the smallest boundaries that fit the existing project:

```text
src/
├── app/
│   └── movies/
│       └── [movieId]/
│           ├── page.tsx          # Validate route ID and load movie data
│           ├── loading.tsx       # Detail-page skeleton
│           └── error.tsx         # Route-level recovery if required
├── components/
│   └── movies/
│       ├── movie-details-page.tsx
│       ├── movie-media-gallery.tsx
│       ├── movie-showtimes.tsx
│       └── ...                   # Add only when reuse/complexity warrants
└── lib/
    └── movies/
        ├── detail-service.ts     # Request/validate detail and showtimes
        └── detail-types.ts       # Confirmed detail/showtime contracts
```

These are boundaries, not a requirement to create every file. Follow
the repository's existing service, type, and component patterns.
Prefer server-side loading for route data. Add client components only
for interactions such as gallery selection, date/cinema selection,
showtime selection, and media viewing.

## Implementation sequence

### 1. Confirm contracts and map content

- Map each screenshot region to supported movie, credit, media,
  recommendation, or showtime fields.
- Confirm route ID parsing, detail/showtime request contracts, error
  semantics, timezone, availability, pricing, and seat handoff.
- Record which optional regions are supported. Leave unsupported
  rating, recommendation, playback, and summary content out.

**Gate:** every planned visible control has a supported data source and
behavior; no screenshot example is treated as production data.

### 2. Implement route data and state boundaries

- Add `/movies/[movieId]` and validate the route parameter before
  fetching.
- Load the movie and showtimes with explicit typed success/error
  results; keep showtime failures independent from movie failures.
- Distinguish unknown movie responses from request failures.
- Reuse existing route-level loading/error patterns and shared UI
  states. Do not silently catch errors or convert failure into empty
  success-shaped content.
- Keep selected date, cinema, and showtime consistent with the
  currently loaded data.

**Gate:** a bad ID cannot show a different movie; movie and showtime
loading, failure, not-found, and empty states remain distinguishable.

### 3. Build the page shell and movie overview

- Compose the shared header/footer, breadcrumb, title/metadata hero,
  media gallery, synopsis/credits, booking summary, and Details
  section in the screenshot's order.
- Reuse existing typography, colors, spacing, image handling, and
  layout conventions. Preserve the screenshot's dark surface, orange
  action, and high-contrast section hierarchy within the established
  Maqady theme.
- Render only available metadata. Use a shared image fallback and
  avoid empty section containers.

**Gate:** the desktop hierarchy reflects the reference and all visible
content belongs to the requested movie.

### 4. Implement gallery and optional content

- Match the full-width three-column reference hero with a status-badged
  poster, featured media player, and stacked Videos/Photos previews.
- Add a horizontal, selectable media thumbnail strip below the hero,
  ordered with videos before photos and showing video duration where
  available.
- Connect the featured media player, thumbnail selection, and
  previous/next actions to available media.
- Implement playback and photo viewing only with approved provider
  behavior; preserve keyboard focus and close behavior.
- Render Cast & Crew, Videos, Photos, and More Like This only when
  their data exists. Exclude the current movie from recommendations.

**Gate:** every visible media/expand action works and missing optional
data does not block the core movie/showtime journey.

### 5. Implement showtimes and handoff

- Render service-provided dates, cinemas, and matching showtimes in
  the screenshot's date-strip/cinema-list/time-card hierarchy.
- Format date and local time using the agreed cinema timezone and
  project formatting helpers.
- Prevent selecting past, sold-out, or otherwise unavailable
  showtimes. Clear/revalidate selection when date or cinema changes.
- Make Book tickets move focus/scroll to showtimes. Enable Choose seats
  only for a currently valid selection and pass that exact showtime ID
  using the agreed route contract.
- Do not create a booking, claim seats are held, or skip destination
  availability validation.

**Gate:** users cannot proceed with a stale or invalid showtime.

### 6. Verify responsive behavior, accessibility, and recovery

- Verify unknown IDs, movie request errors/retry, showtime errors/
  retry, no upcoming shows, date/cinema empty results, missing
  optional sections, and image/media failures.
- Test keyboard operation, visible focus, selected/disabled states,
  viewer focus return, image alternatives, section semantics, and
  status announcements.
- Check mobile, tablet, and desktop layouts for readable content and
  no horizontal page overflow.
- Run focused tests where present, then `npm run lint` and
  `npm run build`.

**Completion gate:** all acceptance criteria in the
[Movie Details specification](./spec.md#acceptance-criteria) pass.
Document any unimplemented API-dependent behavior as a decision;
never simulate it with reference data.
