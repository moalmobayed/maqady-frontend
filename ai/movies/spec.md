# Movies

This specification covers the public [Movies Listing](#movies-listing)
at `/movies`. Movie Details is documented separately in the
[page specification](../movie-details/spec.md) and
[implementation plan](../movie-details/plan.md).

## Movies Listing

- **Route:** `/movies`
- **Canonical requirements:** [FR-02 — Movies Listing, Search and Filters](../spec.md)
- **Scope:** Public movie discovery, search, supported filters, sorting,
  and result paging.
- **Out of scope for this route:** Movie detail content,
  theater/showtime selection, booking, and account-only behavior.

## Reference interpretation

Use the newly supplied `Movies.html` as the visual and interaction
reference for this route. Its visible structure is:

1. The shared customer navigation, with Movies as the active destination.
2. A location/context eyebrow and prominent Movies page heading.
3. **Now showing** and **Coming soon** tabs with result counts.
4. A default-ordering caption reading **Newest releases first**.
5. A title-or-cast search field and a **Filters** button that can show
   the number of active filters.
6. A results region with a result count, active-filter chips with
   individual remove actions, and a poster-card grid.
7. Cards with a poster, optional **New** badge, title, genres, runtime,
   age rating, and a status-appropriate date label.
8. A displayed-versus-total count and **Load more** action when
   additional results are available; otherwise, an end-of-results
   message.
9. The shared customer footer.

The filter dialog in the prototype contains genre choices, **Show
date** choices (Any day, Today, Tomorrow, This weekend), cast choices,
**Clear all**, and a **Show N movies** action. The specific choices and
counts in the prototype are illustrative, not production data.

The current prototype does **not** display numeric rating badges or an
on-page rating/release-date sort selector. Its default-ordering caption
is not an interactive sort control. Do not describe or build those
visual controls as part of the reference unless the product/API
contract separately requires them. FR-02 does conditionally require
rating/release-date sorting when reliable data and ordering are
available; see the decisions below.

Keep Maqady branding, the application theme, and real application
routes. Prototype example movies, counts, cast, ratings, images, dates,
and standalone HTML destinations are never production data or route
contracts.

## Requirements and prototype differences

FR-02 is the source of truth for behavior. The prototype informs
presentation and interaction; it does not override the PRD or resolve
backend behavior.

| Topic | PRD requirement | Prototype reference | Implementation rule |
| --- | --- | --- | --- |
| Release status | Browse current and upcoming catalog entries | Now showing / Coming soon tabs and counts | Keep the status views distinct; counts come from the service. |
| Search | Search by movie name; broader search only if supported | Placeholder says title or cast | Support title search. Advertise cast search only after API support is confirmed. |
| Date filtering | Filter by movie release date | Show date: Any day, Today, Tomorrow, This weekend | The approved listing UI uses showtime dates from `GET /movies/{movieId}/showtimes`: Today and Tomorrow use the API's cinema date; This weekend includes upcoming Friday/Saturday showtimes. The former release-date control was removed from this page. |
| Genre / cast | Genre filter; actor filter when data exists | Genre and cast groups | Genres come from `GET /genres`. Cast choices come from actor-role records in `GET /people`; selected actors are matched against actor credits in `GET /movies/{movieId}`. |
| Sorting | Rating or release date when fields are available | Caption says newest releases first; no sort control | Use the approved default. Add explicit choices only when the field/source/order is confirmed and the UI is approved. |
| Rating | Display only if available | No numeric rating badge | Never copy rating values from an older prototype or invent scores. |
| Paging | Pagination or Load more | Load more, displayed/total count, end message | Match the confirmed API paging contract and avoid duplicate cards. |
| Metadata | Use available movie data | Poster, title, genres, runtime, age rating, released/in-cinemas date, optional New badge | Omit unavailable optional fields; use a New badge only with a confirmed flag or rule. |

## Interaction details

- Changing release-status tabs changes the active result set and its
  count.
- Search and selected filters combine with the active status and
  approved sort order.
- Showtime date and cast criteria are applied immediately and combine
  with status, title, and genre criteria. Their URL parameters are
  `showDate` (`today`, `tomorrow`, or `weekend`) and `cast` (person ID).
- Showtime filtering uses each movie's cinema-local date and counts
  only dates with at least one showtime. Weekend means the upcoming
  Friday and Saturday in the cinema calendar.
- The filter control exposes the active-filter count where supported.
  The dialog/panel has a labelled close action, keyboard-operable
  controls, **Clear all**, and a clear apply/show-results action if the
  approved design uses staged application.
- Results identify applied criteria and let a user remove an individual
  criterion. Clearing optional criteria must not unexpectedly switch
  the active release-status tab.
- Changing search, status, filters, or sort resets paging to the first
  result page. Loading more results preserves the current criteria.
- URL state is persisted for status, title, genre, showtime date, and
  cast; refresh and browser Back/Forward restore the selected results.
- Movie cards navigate to `/movies/[movieId]`. A card must not imply
  that selecting it books a ticket.

## Required states and accessibility

Follow the canonical loading, empty, error/retry, responsive, and
accessibility criteria in [FR-02](../spec.md). In particular, keep
catalog-empty and no-matches states distinct; do not render request
failure as an empty success response. The filter dialog must be
keyboard-operable and maintain understandable focus behavior. Result
count updates should be announced without repeatedly interrupting
assistive-technology users.

## Unresolved decisions

Resolve the following before implementing the corresponding controls:

1. Which rating field/source, if any, is trusted, and does the API sort
   by it?
2. Is the default ordering newest release first for both release-status
   views? Which date field and tie-breaker define this ordering?
3. The listing uses `GET /movies`, `GET /genres`, `GET /people`,
   `GET /movies/{movieId}`, and
   `GET /movies/{movieId}/showtimes`. Confirm the maximum page size,
   stable sort/tie-break guarantees, and error format with the backend
   owner.
4. The design applies filters immediately and does not show a
   **Show N movies** action. Confirm if that interaction changes.

The listing implementation approach and verification gates are recorded
in the [Movies implementation plan](./plan.md#movies-listing-plan).

## Movie Details

- **Detailed page specification:** [Movie Details](../movie-details/spec.md).
  This section summarizes the shared movie behavior; the linked page
  specification is the source for screenshot interpretation and
  page-specific acceptance criteria.
- **Route:** `/movies/[movieId]`
- **Canonical requirements:** [FR-03 — Movie Details](../spec.md)
- **Scope:** Public movie information, optional media/credits, and
  date/cinema/showtime selection for the selected movie.
- **Out of scope for this route:** Seat selection, booking creation,
  payment, and account-only behavior.

### Reference interpretation

Use the supplied **Movie Details.html** as a visual and interaction
reference for this route. It presents:

1. Shared customer navigation and a breadcrumb back to Movies.
2. A hero with movie title, genres, runtime, age rating, release date,
   language/subtitles, and a summary of cinemas showing the movie.
3. A media carousel with trailer/video and photo entry points.
4. Synopsis and genre links, plus director, writer, producer, and
   selected cast information.
5. A ticket summary/action with a jump to showtimes and a trailer action.
6. A Showtimes section with a date selector, cinema selector, showtime
   choices, and a continue-to-seats action.
7. Cast & crew, Videos, Photos, Details, and More like this sections.
8. A shared customer footer.

The prototype's movie title, descriptions, count badges, dates, people,
media, availability, prices, and standalone HTML destinations are
illustrative. Do not use them as production records, IDs, API behavior,
or application routes. Keep Maqady branding and use real app routes.

### Page content and behavior

#### Movie identity and summary

- Load one movie by the route's `movieId`; use its canonical identity
  consistently for every section and request.
- Show the shared page header/footer and a breadcrumb to `/movies`.
  Include genre breadcrumb links only when the genre listing route is
  implemented.
- Use the movie's available poster/cover artwork, title, synopsis,
  genres, runtime, release date/status, age rating, and
  language/subtitle metadata.
- Show a numeric rating or review summary only if its source, scale,
  and trust level have been approved and the movie record includes it.
  Do not create reviews or rating controls based on prototype visuals.
- A cinema count, next-show summary, or starting-price message is
  optional and must be based on current showtime data; omit it when the
  service cannot support a reliable value.

#### Media, credits, and additional information

- Render Videos and Photos only when the movie has usable media. Show
  the supplied media type, title, and duration where available.
- Media cards/carousel controls must select the matching item. A play
  action must use the approved player/provider behavior; a photo viewer
  must have a labelled close action and sensible keyboard focus.
- Show available director, writer, producer, cast, and crew information.
  Character names and portraits are optional. Provide a "show all"
  interaction only when the service has additional credits to reveal.
- Show a Details section for available facts such as release date,
  runtime, age rating, language, country, and production company.
  Omit unavailable values and empty sections.
- More like this is optional. Exclude the current movie and link each
  recommendation to its own `/movies/[movieId]` route.

#### Showtime selection and booking handoff

- Keep showtime selection scoped to the current movie.
- Let users choose an available date and cinema. Dates and cinemas,
  counts, order, and availability come from the service, not fixed
  prototype values.
- Show matching showtimes with local start time and, when available,
  end time, hall, starting price/currency, and status.
- Past, sold-out, and otherwise unavailable showtimes are visibly
  unavailable and cannot be selected. Never present an already-started
  show as bookable.
- Changing the date or cinema clears a selection that is no longer
  valid. A selected showtime remains selected only while it matches the
  active movie/date/cinema.
- "Book tickets" moves focus/scroll to the showtime section; it does not
  create a booking. "Choose seats" is disabled until a valid showtime
  is selected. When enabled, it navigates to
  `/showtimes/[showtimeId]/seats` for exactly that selected showtime.
- The seat-selection page/server remains responsible for revalidating
  showtime and seat availability. Do not imply that a seat is held or
  a booking is confirmed on this page.

### Required states

- **Movie loading:** Show a layout-matched skeleton for the hero and
  page content.
- **Movie request error:** Explain that movie details could not be
  loaded and provide retry. Do not display a not-found state.
- **Unknown movie:** Show the shared not-found/empty state and a route
  back to Movies.
- **Showtime loading/error:** Handle separately from the movie request;
  provide retry for recoverable errors.
- **No showtimes:** Explain when the movie has no upcoming showtimes.
- **No results for the selected date/cinema:** Explain that selection
  has no showtimes and allow choosing another date or cinema.
- **Optional content missing:** Omit the affected section and keep
  remaining page content usable.
- **Image/media failure:** Use the shared image fallback or a clear
  media unavailable state; do not break the rest of the page.

### Accessibility and responsive behavior

- Use a single `<h1>` for the movie title, semantic breadcrumbs and
  section headings, and labelled date/cinema selectors.
- Date, cinema, showtime, carousel, expand, play, and close controls
  must be keyboard operable, visibly focused, and expose selected or
  disabled states to assistive technology.
- Provide meaningful poster/portrait/photo alt text, or empty alt text
  for decorative images. Do not rely on color alone for showtime state.
- Announce important showtime selection/status changes without
  repeatedly interrupting assistive-technology users.
- Reflow the hero, media, credits, and showtime options at mobile,
  tablet, and desktop widths without horizontal page overflow.

### Decisions required before implementation

1. What movie-details and movie-showtimes endpoints, response fields,
   and error/not-found semantics does the backend provide?
2. What date range and ordering are supported for showtime dates, and
   which cinema timezone defines dates and "already started"?
3. What is the canonical showtime-selection route contract and how is a
   selected showtime passed into seat selection?
4. Which rating/review source and scale, if any, may be displayed?
5. Which video/photo providers and playback behavior are approved?
   Does the player open inline, in a modal, or externally?
6. How are recommendations selected and returned? Are there
   restrictions on movie status or availability?
7. Which optional movie/credit fields, localization, and currency
   formats are supported by the API?
8. Is sign-in required before seat selection, or can guests continue?
   The movie detail page itself remains public.

The PRD requirements in [FR-03](../spec.md) remain authoritative. The
prototype informs presentation, not backend contracts or business
rules.

### Acceptance checklist

- [ ] The route displays only the movie matching `movieId`.
- [ ] A guest can view movie details without signing in.
- [ ] All visible metadata and optional sections are data-backed.
- [ ] Movie and showtime loading, error, empty, and not-found states
      are distinct and recoverable where appropriate.
- [ ] Date/cinema changes refresh the scoped showtimes and invalidate
      stale selections.
- [ ] Past, sold-out, and unavailable showtimes cannot be selected.
- [ ] Seat navigation is disabled until a valid showtime is selected
      and contains that exact showtime ID.
- [ ] Media/credit controls work with keyboard and have accessible
      names, focus behavior, and selected states.
- [ ] The layout works at mobile, tablet, and desktop widths.

See the [Movie Details implementation plan](./plan.md#movie-details-plan)
for the implementation sequence and verification gates.
