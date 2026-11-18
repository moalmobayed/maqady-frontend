# Maqady Cinema — Release Notes

**Snapshot date:** 24 October 2026  
**Scope:** Current customer-facing Home and Movies experience

## Overview

This release establishes the customer-facing cinema discovery experience,
connects its Home and Movies content to the backend, and organizes the shared
navigation and page components into reusable modules. Home and Movies render
API-provided content, with loading, empty, and recoverable error states where
applicable.

## Customer experience

### Global layout and navigation

- The root layout composes the shared `CustomerHeader` and `CustomerFooter`
  around route content, keeping those site-wide elements consistent across
  pages.
- The header links to Movies, Theaters, Coming Soon, and Sign in. Its search
  control opens a keyboard-usable movie search and submits a non-empty title
  query to the Movies listing.
- The active Movies, Theaters, or Coming Soon navigation item receives a
  primary-color underline. The selected Movies tab accounts for the
  `status=coming_soon` URL parameter.
- The responsive navigation includes a mobile menu and closes it after
  navigation.
- The footer maps cinema locations and phone numbers from available cinema
  data, alongside Explore and Account links. It uses a clear fallback when
  cinema data or a phone number is unavailable; it does not advertise
  unimplemented help, legal, or payment services.

### Home (`/`)

- A featured-movie hero presents the selected title, synopsis, genres, runtime,
  age rating, backdrop, and links to movie details and tickets.
- The hero supports up to five featured entries with selection controls and
  active-position indicators. When a trailer is provided, it has play/pause and
  sound controls, starts muted, and respects reduced-motion preferences.
- A "Today at Maqady" ticker uses eligible upcoming showtimes and shows each
  movie's next showtime, local time, and cinema. It displays an empty message
  when there are no upcoming showtimes.
- Genre links navigate to the Movies listing with the chosen genre applied.
- Now Showing cards and Coming Soon release rows link to their corresponding
  movie details. Cinema cards display available location, address, operating
  status, phone, halls, facilities, and cover imagery.
- Home request failures expose an error and retry action; empty sections use
  appropriate empty states rather than fabricated content.

### Movies (`/movies`)

- The listing has Now Showing and Coming Soon tabs, with counts supplied by
  the catalog, title search, responsive movie cards, and pagination.
- The filters sidebar provides genre, show-date, and cast filters. Applied
  filters are reflected in the URL and shown as removable chips; users can
  clear filters or search criteria.
- The grid renders API-returned titles and their posters (or image fallbacks),
  genres, runtime, age rating, and release date.
- Load more requests subsequent catalog pages and reports loading and request
  errors. Catalog failures expose a retry action, and empty results distinguish
  between an unfiltered empty catalog and criteria with no matches.

## Data and API integration

- Home data is fetched from the aggregate Home service. The validated response
  supplies featured movies, ticker entries, genres, movie collections, and
  cinemas.
- The Home route renders the server-fetched aggregate data through the modular
  Home view; the shared footer separately loads cinema data with a Suspense
  fallback.
- The Movies route reads its search parameters, validates supported status,
  genre, show-date, and cast selections, then requests matching catalog data.
- Movie catalog, genre, people, and load-more requests use backend data rather
  than hard-coded lists. Client-side `map` rendering means added or removed
  records are reflected after a fresh request/page render.
- Requests use `cache: "no-store"` and responses are checked against runtime
  data contracts before rendering. Data is refreshed when a new request is
  made; already-open pages do not receive live updates unless refreshed or
  navigated again.
- The Movies load-more endpoint validates input and returns cursor-paginated
  catalog data. Network, HTTP, and invalid-response failures are surfaced
  rather than silently treated as successful empty results.

## Component and architectural changes

- The App Router root layout owns shared global composition and loads footer
  cinema data behind a Suspense fallback.
- Home presentation is organized under `src/components/home/`, including
  `HomeContent`, `FeaturedHero`, `ShowtimeTicker`, `GenreLinks`,
  `MovieSection`, `MovieCard`, `CinemaSection`, and shared image/motion
  components.
- Movies presentation is organized under `src/components/movies/`:
  `MoviesPage` coordinates URL navigation and pagination state;
  `MoviesContent` composes the listing view; `MoviesFiltersSidebar`,
  `MoviesGrid`, and `MovieCard` handle separate presentation areas; and
  `movies-utils` contains shared query and display helpers.
- Backend access and data contracts are separated into `src/lib/home/` and
  `src/lib/movies/`.

## Screenshots

The full-page desktop screenshots below were captured from the production
build, using the data available at capture time. Movie and showtime content
can change as the backend changes. The Home sections screenshot offers a
closer view of the genre and Now Showing content.

| Page | Screenshot |
| --- | --- |
| Home | [Full-page Home screenshot](./screenshots/home.png) |
| Home sections | [Home genres and movies screenshot](./screenshots/home-sections.png) |
| Movies | [Full-page Movies screenshot](./screenshots/movies.png) |

## Verification

- `npm run lint` — passed.
- `npm run build` — passed.
