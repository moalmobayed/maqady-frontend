# Movies Implementation Plan

## Objective

Implement the public `/movies` listing in line with
[FR-02](../spec.md), using the supplied `Movies.html` for its visual
structure and interaction reference. Movie Details has a dedicated
[implementation plan](../movie-details/plan.md) and
[specification](../movie-details/spec.md).

## Current implementation status

- The `/movies` listing is implemented with live catalog data, title
  search, status navigation, genre, showtime-date, and cast filters,
  URL-backed criteria, active-filter removal, and cursor-based Load more.
- Filters use `GET /movies`, `GET /genres`, and actor-role records from
  `GET /people`. Cast matching uses credits from `GET /movies/{id}`;
  showtime-date matching uses `GET /movies/{id}/showtimes`. Since the
  catalog endpoint does not accept cast or showtime-date parameters,
  the service filters the complete matching catalog before paging.
- The `/movies/[movieId]` detail route and live showtime selection are
  implemented in progress under [Movie Details](../movie-details/plan.md);
  the seat-selection destination is a separate pending route.

## Movies Listing Plan

## Verified project baseline

- The app uses Next.js App Router, React, TypeScript, and Tailwind CSS.
- The `/movies` listing route and catalog service are implemented.
  `/movies/[movieId]` and its movie-details service are implemented in
  progress; see the dedicated page plan for remaining decisions.
- `src/lib/home/service.ts` and `src/lib/home/types.ts` define the Home
  aggregate and its display data. The existing `Movie` type has title,
  genres, runtime, age rating, release date, status, and optional poster
  data. It does not define rating, cast, catalog totals, or pagination.
- The Home aggregate is not a complete movie catalog and must not be
  repurposed as the source for catalog search, filters, counts, or
  pagination.
- The Home UI has customer header/footer, image fallback, movie-card,
  and shared loading/empty/error components. Reuse them where their
  responsibilities fit, but inspect their current presentation and
  adapt or add a listing card as needed. The existing Home movie card
  includes a position marker and does not provide all listing metadata,
  so it is not automatically a drop-in match for the prototype.
- Use Maqady branding, the existing global theme and application route
  conventions. Do not copy the prototype's sample data or its
  standalone-HTML navigation targets.

## Product and API decisions

Do not invent API fields or display nonfunctional controls. Resolve
these questions with the product/backend owner before implementing the
dependent behavior:

1. **Catalog contract:** endpoint, response/error schema, public
   visibility rules, status totals, maximum page size, and cursor or
   page-number semantics.
2. **Rating and ordering:** confirm a trusted rating source and
   scale; whether the API can sort by rating; the default order for
   each release status; the exact date field used by "Newest releases
   first"; and deterministic tie-breaking.
3. **New badge:** confirm a server-provided flag or an agreed
   definition. Do not infer "New" from an arbitrary date window.

The page can be structured and rendered with confirmed catalog data
while unresolved optional fields/controls remain omitted.

## Data and rendering approach

1. Add `src/app/movies/page.tsx` as a Server Component. Keep catalog
   fetching and response validation out of presentation components.
2. Add a catalog-specific service and types only after the API contract
   is confirmed. Keep this service independent of the Home aggregate;
   do not filter a partial Home response in the browser and present it
   as a complete catalog.
3. Use the server-rendered route for the initial status, criteria, count,
   and result page. Preserve explicit request errors rather than
   turning them into empty results.
4. Use client-side state only for controls that need immediate
   interaction, filter dialog behavior, and API-supported Load more.
   Keep the result cards and page composition server-rendered when
   practical.
5. Parse and validate status, title, genre, showtime-date, and cast
   query parameters at the route boundary. Keep Back/Forward and refresh
   consistent with the selected criteria.
6. Reset paging when status or any applied search/filter/sort criterion
   changes. Apply filtering/sorting before paging at the service/API
   boundary. Deduplicate appended items by stable movie ID as a
   defensive UI measure; do not rely on client-side de-duplication to
   correct an invalid API cursor.
7. Reuse the shared header, footer, image fallback, and UI state
   components where appropriate. Build a listing-specific card only
   where adapting the current Home card would create an unclear or
   brittle component.

## Visual and interaction implementation

Follow the reference's information hierarchy: Movies heading/context,
Now showing and Coming soon tabs with service-provided counts, approved
default-ordering caption, search and Filters controls, results count
and applied-criteria chips, responsive poster grid, then paging state.
Keep the shared customer footer after the results.

- Match visible copy to behavior. Use "title or cast" only if both are
  actually searchable. Distinguish **release date** from **show date**
  in labels and API semantics.
- Populate filter names and counts from the supported catalog/filter
  response. Avoid fixed example genres, actors, counts, or dates.
- Show optional poster, title, genre, runtime, age rating, release
  date, **New** badge, and rating only when supplied and meaningful.
  Never manufacture a poster, rating, cast member, date, or badge.
- Preserve working focus behavior, keyboard-operable tabs/controls,
  visible focus, semantic labels, useful poster alternatives, and
  responsive layouts at narrow widths.
- Provide separate states for initial loading, loading more, empty
  catalog, no matches, request error/retry, and end of results. Reuse
  the shared UI states rather than creating parallel generic patterns.

## Proposed file boundaries

Use these as a starting point, not a mandate to create one file per
component:

```text
src/
├── app/
│   └── movies/
│       ├── page.tsx              # Parse approved query state; load catalog
│       └── loading.tsx           # Listing-shaped route loading UI if useful
├── components/
│   └── movies/
│       ├── movies-content.tsx    # Page composition
│       ├── movie-filters.tsx     # Accessible filter dialog/panel
│       └── movie-card.tsx        # Only if existing card needs a distinct variant
└── lib/
    └── movies/
        ├── service.ts            # Catalog request, validation, errors
        ├── query.ts              # Only if query parsing needs extraction
        └── types.ts              # Confirmed catalog contract
```

Keep search/filter state in the smallest appropriate client boundary.
Combine components when splitting would add indirection without a clear
reuse or state-management benefit.

## Implementation phases and gates

### Phase 1 — Confirm behavior and data contract

- Confirm the catalog/query/paging contract and the remaining rating,
  ordering, and **New** badge decisions.
- Map every visible control to a supported result change.

**Gate:** each visible filter maps to catalog, actor-credit, or
showtime data; there are no fabricated actor choices or simulated
showtime results.

### Phase 2 — Build the route and catalog boundary

- Define types from the confirmed response schema.
- Implement server-side catalog access, response validation, and
  explicit errors.
- Parse and validate URL-backed query state, load the initial catalog
  page, and render a basic responsive listing.

**Gate:** initial results/counts match the selected status and approved
criteria; a request failure is not rendered as an empty success state.

### Phase 3 — Add search, filters, ordering, and paging

- Implement only the confirmed controls.
- Make applied criteria composable; clear criteria without unexpectedly
  changing release status.
- Preserve the current criteria when loading another page and reset the
  page when criteria change.
- Add active-criteria removal and result counts consistent with the
  actual applied state.

**Gate:** each visible control demonstrably changes the returned
results; paging does not skip or duplicate catalog records.

### Phase 4 — Verify states, accessibility, and responsive layout

- Verify Now showing/Coming soon, title search, each supported filter,
  supported sort options, combined criteria, Clear all, and
  pagination/Load more.
- Verify empty catalog, no matches, initial and incremental loading,
  request failure/retry, and end-of-results handling.
- Test keyboard/focus behavior for tabs and the filter dialog, result
  announcements, accessible poster text, and mobile/tablet/desktop
  layouts.
- Run focused tests where present, then `npm run lint` and
  `npm run build`.

**Gate:** the FR-02 acceptance criteria pass. Any unresolved optional
API-backed behavior is omitted and documented, not simulated with
prototype data.

## Movie Details Plan

The dedicated [Movie Details plan](../movie-details/plan.md) is the
implementation source for this route. The notes below summarize its
scope and dependencies.

### Goal

Deliver a public, responsive movie detail page that shows only the
requested movie, presents available related information, and hands a
user off to seat selection only after they select a valid showtime for
that movie.

### 1. Confirm the data and navigation contracts

- Resolve the movie detail and showtime service endpoints, ID formats,
  response/error shapes, and whether showtime queries are paged.
- Confirm date range, cinema-local timezone, ordering, availability
  states, and display-ready price/currency fields.
- Confirm the seat-selection route contract and whether guests may
  continue.
- Decide approved media providers/playback behavior, rating source,
  optional fields, and recommendation strategy.
- Keep unavailable decisions out of the UI as nonfunctional controls
  or hard-coded sample data.

### 2. Connect page data and route states

- Read and validate `movieId`; request the movie and showtimes through
  the project's existing data-access patterns.
- Keep movie loading/failure/not-found distinct from showtime
  loading/failure/empty states.
- Normalize optional data only through existing types/helpers; do not
  silently turn failed or malformed responses into valid empty data.
- Reuse shared navigation, image, loading, empty, and error components.

### 3. Build the movie overview

- Render breadcrumb, hero artwork, title, supported metadata, synopsis,
  available credits, and Details.
- Use shared styling and semantic page structure.
- Omit unavailable optional values and sections; use the shared image
  fallback when artwork is missing or fails.

### 4. Implement showtime selection and handoff

- Add date and cinema controls using service-provided options.
- Render only showtimes matching the current movie/date/cinema.
- Disable past, sold-out, and unavailable times with clear text status.
- Clear or revalidate the selected showtime when its parent selection
  changes.
- Keep the seat-selection action disabled until a valid showtime is
  selected; navigate using that show's canonical ID.
- Keep booking, seat holds, and final availability validation outside
  this page.

### 5. Add optional media and recommendations

- Render Videos, Photos, Cast & crew, and More like this only when
  usable data exists.
- Implement carousel/viewer/expand interactions only to the extent
  supported by approved providers and data.
- Ensure recommendations exclude the current movie and use real
  application routes.

### 6. Validate behavior and quality

- Verify requested ID mapping, guest access, optional-data omission,
  and unknown-ID behavior.
- Verify date/cinema filtering, stale-selection clearing, local-time
  availability, disabled past/sold-out times, and exact showtime route
  handoff.
- Verify separate movie/showtime error and empty states, retry, and
  image/media failures.
- Check keyboard access, focus, screen-reader names/statuses, and
  mobile/tablet/desktop layouts.
- Run the focused tests available in the repository, then
  `npm run lint` and `npm run build`.

### Completion gates

- Every displayed movie field and showtime belongs to the requested
  movie and comes from the agreed data source.
- An invalid movie ID cannot render another movie or a success-shaped
  empty page.
- Users cannot proceed to seat selection without a valid selected
  showtime, and navigation targets that exact showtime.
- Optional media, ratings, credits, and recommendations do not block
  the core details/showtime journey when missing.
- Accessibility and responsive checks in the
  [Movie Details specification](./spec.md#movie-details) pass.

### Dependencies and open decisions

Implementation depends on the API, timezone/date behavior, media
provider, rating policy, recommendation strategy, guest-booking policy,
and seat-selection route contract listed in the
[Movie Details specification](./spec.md#movie-details). Keep these
explicit rather than inferring them from example counts, values, or
links in the prototype.
