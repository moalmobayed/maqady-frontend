# Home Page Plan

## Objective

Plan the implementation of the public Home route (`/`) so guests can
discover available movies and cinemas, search supported content, and
navigate to relevant details. This plan is limited to the Home page; it
does not authorize implementation or resolve product/backend decisions.
The requirements and acceptance criteria in [spec.md](./spec.md) remain
the source of truth.

## Current baseline

- The application uses Next.js App Router, React, TypeScript, and
  Tailwind CSS. The Home route is `src/app/page.tsx`.
- `src/app/layout.tsx` provides the root document, Geist fonts, global
  metadata, and a flex-column body. Keep Home-specific markup out of the
  root layout unless it is intentionally shared across routes.
- `src/app/globals.css` defines the dark Maqady theme, orange
  primary/accent colors, focus-visible outline, and Tailwind theme
  mappings. Use these tokens rather than introducing another palette or
  typography system.
- Reusable components already exist in `src/components/ui/` and are
  exported from its barrel:
  - `Skeleton` for loading placeholders.
  - `EmptyState` for section/page empty states.
  - `ErrorState` for recoverable request errors with a retry action.
  - `Modal` for a native dialog with Escape/outside-click close behavior.
  - `StatusState`, `Toast`, and `ConfirmationDialog` for their existing
    operation/access use cases; Home should not add them unless needed.
- `src/app/ui-test/page.tsx` showcases the shared components; it is not
  a production Home component.
- There are no existing customer navigation, movie-card, cinema-card,
  or Home-data modules. `src/lib/` exists but has no modules, so there
  is no established data-service pattern to preserve.
- The Home route currently contains no page content. `public/` has only
  the default Next.js SVGs, not movie or cinema artwork.
- The supplied `m.yaml` proposes a public aggregate `GET /api/v1/home`
  response. Treat it as a draft until the backend confirms its contract.
- The supplied `Home.html` export exposes bundler thumbnail/loading
  markup rather than a usable page design. Use the Home specification
  and FOYER design reference for layout guidance, retaining Maqady as the
  product brand.

## Implementation approach and technology

Use the technologies already installed in this repository:

- **Next.js 16 App Router** for the `/` route, route-level loading/error
  handling, server rendering, and navigation.
- **React 19 and TypeScript 5 with strict checking** for typed response
  data and components. Use the existing `@/*` alias for imports from
  `src/`.
- **Tailwind CSS 4** and the existing CSS theme tokens in
  `src/app/globals.css` for responsive styling.
- **Geist** from the existing root layout; preserve the global Maqady
  metadata and theme.
- **Next.js `Image`** only for approved image variants, with a designed
  fallback when an image is absent. No movie/cinema images or remote
  image hosts are configured yet; confirm the source and configure only
  the required hosts if remote assets are approved.
- Existing `Skeleton`, `EmptyState`, `ErrorState`, and `Modal` from
  `src/components/ui/`; reuse them instead of duplicating their
  responsibilities.

Do not add a query/cache library, form library, state store, UI kit, or
test dependency just for this page. Keep page data on the server by
default. Implement the route and section composition as Server
Components. Use small Client Components only for browser interactions
that need state or browser APIs: hero selection/playback, search
open/close and focus handling, mobile navigation, or ticker controls if
animated. Pass typed, serializable data from the Server Component into
those islands. Avoid making the entire page a Client Component.

Fetch the aggregate Home response in the server-side data-access module,
not in each section. Keep the API base URL in server configuration, never
in client code. Apply caching/revalidation only after confirming the
backend contract and Next.js 16 guidance; the draft API suggests a
60-second public cache, but that is not yet an approved frontend policy.
Before implementation, read the relevant guides shipped with the
installed Next.js package for App Router data fetching, `loading.tsx`,
`error.tsx`, image handling, and caching. Follow those version-specific
APIs rather than relying on older Next.js conventions.

### Proposed Home file structure

Add only Home-specific modules that do not already exist. Continue using
the existing `src/components/ui/` directory and barrel.

```text
src/
├── app/
│   ├── page.tsx                         # Server route; loads and composes Home
│   ├── loading.tsx                      # Route-level Home skeleton
│   └── error.tsx                        # Client route error boundary and retry
├── components/
│   ├── home/
│   │   ├── home-content.tsx             # Home section composition
│   │   ├── customer-header.tsx          # Home header; extract if reused
│   │   ├── customer-footer.tsx          # Home footer; extract if reused
│   │   ├── featured-hero.tsx            # Hero presentation
│   │   ├── hero-carousel.tsx            # Client selection/playback controls
│   │   ├── showtime-ticker.tsx          # Today's bookable showtimes
│   │   ├── genre-links.tsx              # Genre filter links
│   │   ├── movie-section.tsx            # Now Showing / Coming Soon section
│   │   └── cinema-section.tsx           # Our Cinemas cards and link
│   ├── movies/
│   │   └── movie-card.tsx               # Reusable card for discovery pages
│   └── ui/                              # Existing shared UI components
└── lib/
    └── home/
        ├── types.ts                     # Confirmed Home response types
        ├── service.ts                   # Server-only request and errors
        └── cinema-time.ts               # Timezone/cinema-day helpers
```

This is a proposed boundary, not a requirement to create every file.
Start with the smallest useful set: the route, a Home composition
component, Home types/service, and only the interactive or reusable
section components needed for the approved design. Keep small, static
sections together if splitting them would add needless indirection.
Start the header/footer under `components/home/` and extract them to a
shared layout folder when another implemented customer route needs them.
Do not modify `ui-test/page.tsx` for production UI.

### Data and rendering flow

1. `src/app/page.tsx` calls one server-side Home service.
2. The service fetches the confirmed API response and maps it to the
   TypeScript types in `src/lib/home/types.ts`. TypeScript types alone
   do not validate network JSON at runtime; if runtime validation is
   required, start with a small boundary parser/type guard rather than
   adding a schema dependency without approval. Report failures
   explicitly; do not substitute empty collections on request failure.
3. The route renders the customer shell and Home sections from that one
   response. Section components receive only the data they need and
   reuse the shared UI components for states.
4. `loading.tsx` provides a layout-matched loading view using existing
   `Skeleton` components. The page-level `error.tsx` is a Client
   Component following the installed Next.js error-boundary contract
   and calls its provided reset action to retry. Use `ErrorState` where
   its existing props fit; do not duplicate its presentation.
5. Only interaction components use client-side state. Movie, cinema, and
   genre links remain normal navigable links so they work without custom
   client routing logic.

The service should preserve the response's optional/null values. Use
server-provided time and the confirmed cinema timezone for ticker
eligibility and displayed local times. Do not compute authoritative
availability from an arbitrary browser clock.

## Decisions to confirm before implementation

1. **Home API:** Confirm endpoint URL, response/error schemas, cache
   behavior, and whether the backend provides `/health` or another
   supported way to handle a sleeping service.
2. **Search:** Confirm its destination, query parameter, supported entity
   types, and whether search lives in the header, an overlay, or both.
3. **Ratings:** Confirm whether movie ratings are available and their
   trusted source. Omit ratings until this is defined.
4. **Cinema time:** Confirm the authoritative timezone and server-time
   source for open status, showtime labels, and the 06:00-to-06:00 cinema
   day.
5. **Hero media:** Confirm which trailers may be used and the autoplay,
   sound, pause, and fallback behavior.
6. **Destinations:** Confirm routes for movie details, theater details,
   Coming Soon, sign-in/account, and any help/legal links not yet
   implemented.
7. **Motion:** Confirm ticker/carousel motion expectations while
   preserving reduced-motion and accessible controls.
8. **Brand:** The Home specification says to retain Maqady, while
   checklist T07 and the system plan refer to FOYER branding. Confirm
   which customer-facing brand is canonical before implementing
   navigation or hero artwork.

Do not invent production data or use decorative controls to hide an
unresolved decision. If a decision remains open, keep the UI behavior
within the approved Home specification and make the dependency explicit.

## Page structure

Implement and compose these sections in order:

1. **Customer navigation:** The approved customer-facing brand, Movies,
   Theaters, Coming Soon, functional Search, and the appropriate
   sign-in/account action. Ensure mobile navigation still exposes
   essential routes.
2. **Featured movie hero:** One active featured movie at a time, its
   available backdrop and metadata, details/booking links, and
   accessible selection controls for up to five featured items. Only
   render media controls when approved video data exists.
3. **Today's showtime ticker:** Include only future, bookable showtimes
   for the current cinema day. Hide it or show a concise empty state
   when no qualifying items exist.
4. **Genre browsing:** Link each available genre using its stable URL
   slug to the filtered movie listing.
5. **Now Showing:** Show up to the agreed response limit of movie cards,
   optional metadata, and a link to the complete listing.
6. **Coming Soon:** Show upcoming movie cards and release dates where
   provided; do not offer booking for movies without bookable showtimes.
7. **Our Cinemas:** Show customer-visible cinema cards, local open
   status, location, and optional supplied details, plus the theater
   directory link.
8. **Customer footer:** Use only working, supported navigation and
   account/help/legal destinations.

Use semantic landmarks and a clear heading hierarchy. Reuse the
application's existing theme and UI patterns rather than adding a
separate design system.

## Implementation sequence and exit gates

### Phase 1 — Confirm scope and route contracts

- Resolve the decisions above with the product/backend owners.
- Map each visible action to an existing or approved destination.
- Confirm how the application route should fetch the aggregate response
  and provide retry behavior.

**Gate:** no required action points to a made-up route or unsupported
service.

### Phase 2 — Define the data boundary

- Define TypeScript types for the agreed Home response and its nested
  movie, genre, image, video, showtime, and cinema records.
- Represent nullable and optional fields explicitly.
- Keep fetching/response handling outside presentational components.
- Use the supplied aggregate endpoint only after confirmation. Until
  then, any approved fixtures must be clearly identified as mock data
  and must not be mistaken for production availability.
- Preserve request failures as errors; do not turn them into empty
  successful responses.

**Gate:** valid, partial, empty, and failed responses can be represented
without fabricated fallback values.

### Phase 3 — Build shared customer navigation and cards

- Implement or reuse the customer header/footer without disrupting
  existing page layouts.
- Build or reuse a movie card that handles poster fallback, optional
  metadata, and the correct details route.
- Build cinema-card presentation with optional image/contact/facility
  details omitted safely.
- Reuse the shared Skeleton and Error State components.

**Gate:** the header, links, movie cards, and cinema cards work at mobile
and desktop widths and are keyboard-operable.

### Phase 4 — Compose the Home sections

- Build the hero, ticker, genre links, Now Showing, Coming Soon, and
  cinema sections from the approved response.
- Render only public customer-visible records.
- Respect agreed API item limits and use response totals for full-list
  links when supplied.
- Handle each section's empty state independently. If no movie content
  exists anywhere, explain that clearly while retaining navigation and
  search.
- Never show ratings, trailers, images, times, or booking availability
  unless supplied by the trusted data source.

**Gate:** every card and action leads to the correct destination; empty
sections do not make the whole page blank.

### Phase 5 — Add interactions and time rules

- Implement hero selection so selected content and active indicator
  always stay synchronized.
- If video is approved and available, keep it muted by default, provide
  accessible playback/sound controls, and fall back to the still image
  when loading or playback fails.
- Implement keyboard-accessible search submission for non-empty
  queries, preserve the query in the URL, and restore focus when a
  dismissible search interface closes.
- Generate genre links from backend-provided stable slugs.
- Apply the agreed cinema timezone and cinema-day rules to ticker
  filtering, showtime formatting, and opening status.
- Respect `prefers-reduced-motion`; ticker/carousel motion must not be
  required to discover or operate content.

**Gate:** search, hero controls, navigation, and time-sensitive labels
work with keyboard and assistive technology.

### Phase 6 — Verify behavior and quality

- Verify loading placeholders, slow/waking service messaging, retryable
  errors, per-section empty states, and the all-movies-empty state.
- Verify populated and partial payloads, including null images/videos,
  missing optional contact details, and no ratings.
- Verify ticker eligibility around midnight and the 06:00 cinema-day
  boundary using the confirmed timezone and server time.
- Verify each navigation target, search URL, genre filter, movie link,
  cinema link, and hero selection.
- Check mobile/tablet/desktop reflow, no page-level horizontal overflow,
  heading/landmark semantics, visible focus, alt text, contrast, and
  reduced motion.
- Run `npm run lint` and `npm run build`. Add focused tests for date/time
  rules, data mapping, and meaningful interactions if a suitable test
  setup is available.

**Done when:** all Home acceptance criteria in [spec.md](./spec.md) pass
for populated, partial, empty, slow, and failed data states, and lint
and production build succeed.

## Verification strategy

- **Static checks:** run `npm run lint` and `npm run build`.
- **Data/service checks:** verify successful, partial, empty, slow, and
  failed responses; assert failures remain distinguishable from empty
  data.
- **Time checks:** test future/past ticker items and the midnight/06:00
  cinema-day boundaries against the confirmed timezone and server time.
- **Interaction checks:** verify hero selection, playback fallback,
  non-empty search submission/query preservation, navigation targets,
  and keyboard operation.
- **Responsive/accessibility checks:** verify mobile/tablet/desktop
  layouts, no page-level horizontal overflow, semantic headings and
  landmarks, visible focus, image alternatives, contrast, and reduced
  motion.
- **Shared UI regression:** verify the existing `/ui-test` showcase and
  shared Skeleton, Empty State, and Error State behavior remain intact.

There is no test runner configured in the current package manifest. Use
the existing validation scripts first; only add a test dependency if
focused automated tests become necessary and the project owner approves
that tooling. No application implementation or test execution is part
of this planning task.