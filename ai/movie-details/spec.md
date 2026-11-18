# Movie Details

- **Route:** `/movies/[movieId]`
- **Canonical requirements:** [FR-03 — Movie Details](../spec.md)
- **Scope:** Public movie information, available media and credits, and
  date/cinema/showtime selection for the requested movie.
- **Out of scope:** Seat-map behavior, booking creation, payment, and
  account-only features.
- **Design references:** The supplied Movie Details screenshot and
  `Movie Details.html`. The screenshot is the visual guide; the HTML is
  a bundled page artifact, not a source of application routes, data, or
  backend behavior.

## Page structure and visual direction

Use the existing Maqady customer shell and dark theme. Follow the
reference's information hierarchy and dense, editorial cinema layout:
near-black surfaces, high-contrast light text, orange highlights and
primary actions, fine separators, and large condensed-style section
headings consistent with the app's available typography. Keep the page
responsive and do not reproduce sample content as live data.

Render these regions in order, omitting optional regions when their
data is unavailable:

1. **Customer header:** Maqady brand, Movies, Theaters, Coming soon,
   search, and sign-in/account entry points. Indicate the active
   navigation item according to the existing shell.
2. **Breadcrumb and movie hero:** Breadcrumb back to Movies; movie
   title; available genres, runtime, release information, age rating,
   language/subtitle information, and cinema-availability summary.
   Include a compact now-showing/coming-soon status when supplied.
3. **Featured media gallery:** A full-content-width, three-column
   desktop composition: a portrait poster with a top-left
   now-showing/coming-soon badge; a large landscape media player with a
   central play action, previous/next controls, title, available
   video type/duration, and item counter; and vertically stacked
   Videos and Photos preview cards with imagery, icons, and
   data-backed counts. Place a horizontal selectable thumbnail strip
   directly below the hero, listing available videos first and photos
   after them. Video thumbnails show their available duration and a
   play indicator; selecting any thumbnail updates the featured media.
   On smaller screens, stack the poster, player, and preview cards and
   keep the thumbnail strip horizontally scrollable without page-level
   overflow. Do not assume every movie has a trailer, video, or photo
   gallery.
4. **Synopsis and booking summary:** Below the media strip, arrange
   genre links, a readable synopsis, and grouped Director, Writers,
   Producer, and Stars rows in the wide left column. Place prominent
   Book tickets and optional Watch trailer actions above a bordered
   summary of available next-show, cinema-count, language, and
   starting-price facts in the right column. Price amounts are returned
   in minor currency units and must be formatted using their returned
   currency. Stack the columns on narrow screens.
5. **Showtimes:** A section heading; selectable dates; cinema choices
   grouped by location where supported; showtime cards for the selected
   date/cinema; and a Choose seats action. The screenshot uses a
   horizontal date strip, cinema list, and time-card row at desktop.
6. **Cast & crew:** A horizontally browsable set of people with names
   and roles, followed by a show-all action only when additional
   credits exist.
7. **Videos:** Video cards with thumbnail, title/type, and duration
   when provided, with a working playback action and a link to more
   videos only when available.
8. **Photos:** An image mosaic/gallery with a working open/view action
   and a link to more photos only when available.
9. **Details:** A compact facts grid for available release date,
   runtime, age rating, language, country of origin, and production
   company.
10. **More like this:** Related movie cards linking to their own movie
    detail routes, excluding the current movie.
11. **Customer footer:** Reuse the shared footer and its real routes.

At narrower widths, stack hero and booking content, make date and
cinema choices comfortably operable, and let galleries scroll or wrap
without causing page-level horizontal overflow. Preserve the content
order and keep the primary booking action easy to find.

## Functional requirements

### Movie identity and metadata

- Resolve `movieId` to exactly one movie. Use that identity for all
  credits, media, recommendations, and showtime requests. Never render
  a different movie as a fallback.
- Keep the page public. Show the available artwork, title, synopsis,
  genres, runtime, release date/status, age rating, and
  language/subtitle information.
- Show numeric ratings or review summaries only when the product
  approves a source and scale and the movie response supplies the
  value. Do not create ratings, reviews, or controls from prototype
  imagery.
- Link genres or people only to real, implemented destinations.
  Otherwise render them as informational text.
- Omit absent optional fields and empty sections. Never fill gaps with
  placeholder facts, prototype names, or fabricated counts.

### Featured media, video, photos, and credits

- Populate the featured gallery from the movie's available media.
  Selected-item, previous/next, and thumbnail controls must refer to
  the same media collection and expose the selected state.
- Play videos using the approved provider/player behavior. Open photos
  in an accessible viewer when supported; include a labelled close
  action, sensible focus entry/return, and keyboard controls.
- Render available director, writer, producer, cast, and crew credits.
  Show character/role details and portraits only when supplied.
- Show an expand/show-all control only when more credits or media
  actually exist.
- Image or playback failure must not block movie details or showtime
  selection. Use the shared image fallback or a clear media error.

### Showtimes and seat-selection handoff

- Fetch showtimes independently from movie details and scope every
  result to the requested movie.
- Let the user select a service-provided date and cinema. The available
  dates, cinema labels, grouping, counts, showtimes, order, and
  availability must come from the service, not fixed screenshot values.
- Display local start time and, when provided, end time, hall, price,
  currency, and availability. Determine whether a showtime is in the
  past using the cinema's agreed timezone and current server/service
  status.
- Past, sold-out, and otherwise unavailable showtimes are clearly
  identified and cannot be selected. Availability must not be conveyed
  by color alone.
- Changing date or cinema clears a selected showtime that no longer
  matches. Revalidate the selected ID against the currently displayed
  movie/date/cinema results before enabling Choose seats.
- Book tickets scrolls or focuses the showtime section; it does not
  create a booking or reserve seats.
- Choose seats remains disabled until one valid showtime is selected.
  When enabled, navigate to the agreed seat-selection route for that
  exact showtime. The destination/server revalidates availability.
- Optional next-show, cinema-count, and starting-price summaries must
  be derived from current showtime data and omitted if not reliably
  available.

### Related movies

- Load recommendations from `GET /movies/{movieId}/similar`.
- Exclude the current movie and link each card to the correct
  `/movies/[movieId]` route.
- Use only available artwork and metadata; do not copy screenshot
  examples into production content.

## Loading, empty, and error states

- **Movie loading:** Show a page-shaped skeleton for the hero and
  content sections.
- **Movie request failure:** Explain that details could not be loaded
  and offer retry. Do not display a not-found state for a request error.
- **Unknown/unavailable movie:** Show the shared not-found state and a
  route back to Movies; do not substitute another record.
- **Showtime loading/error:** Handle independently from movie loading
  and failure; offer retry for recoverable errors.
- **No upcoming showtimes:** Explain that there are no upcoming
  showtimes for this movie.
- **No matches for selected date/cinema:** Explain the scoped empty
  result and let the user choose another available date or cinema.
- **Missing optional data:** Omit the relevant section without
  leaving an empty shell.
- **Image/video failure:** Keep the rest of the page usable and present
  an appropriate fallback or media-specific unavailable state.

## Accessibility and responsive behavior

- Use one page-level `<h1>` for the movie title, semantic breadcrumb
  navigation, and correctly nested section headings.
- Label date/cinema selectors and all gallery, play, expand, viewer,
  and showtime controls. All controls must be keyboard operable, have
  visible focus, and expose selected/disabled states.
- Maintain useful focus when opening/closing a photo viewer and when
  activating Book tickets to move to showtimes.
- Provide meaningful alternatives for informative poster, portrait,
  and gallery images; use empty alternatives for decorative imagery.
- Announce important showtime selection and availability changes
  without interrupting users on every minor visual update.
- Reflow hero, galleries, credits, and showtime choices at mobile,
  tablet, and desktop widths with no page-level horizontal overflow.

## Decisions required before implementation

1. What are the movie-details and movie-showtimes endpoint contracts,
   identifier formats, response validation rules, and error/not-found
   semantics?
2. What date range and ordering are supported, and which cinema
   timezone governs date labels and already-started showtimes?
3. What is the canonical seat-selection route and how is the selected
   showtime ID passed? May guests proceed?
4. Is any rating/review source and scale approved?
5. Which video/photo providers and player/viewer behaviors are
   approved?
6. How are related movies selected and returned, and what eligibility
   rules apply?
7. Which optional movie/credit fields, locales, currency, and price
   formatting does the API support?
8. Can showtime availability be authoritatively determined from the
   response, or is a separate availability check required?

Do not resolve these decisions by copying values or behavior from the
visual reference. The canonical product requirements remain in [FR-03](../spec.md).

## Acceptance criteria

- [ ] Only the movie matching the route's `movieId` is displayed.
- [ ] Guests can view the page without signing in.
- [ ] Every displayed fact, credit, media item, recommendation, and
      showtime is supported by the movie/service data.
- [ ] The page follows the documented reference hierarchy and omits
      unavailable optional sections.
- [ ] The gallery selection, media actions, and show-all actions work
      only when the corresponding items exist.
- [ ] Date and cinema changes show only matching future showtimes and
      clear any now-invalid selected showtime.
- [ ] Past, sold-out, and unavailable showtimes cannot be selected.
- [ ] Choose seats is disabled until a valid showtime is selected and
      then targets that exact showtime.
- [ ] Loading, request error, unknown movie, no showtimes, filtered
      empty, and optional-media failures are distinct and usable.
- [ ] Keyboard, focus, accessible names/statuses, and responsive
      behavior meet the requirements above.

See the [Movie Details implementation plan](./plan.md) for sequencing,
project-specific boundaries, and verification gates.
