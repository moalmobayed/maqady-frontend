# Home

- **Route:** `/`
- **Source:** [FR-01 — Home](../spec.md)
- **Scope:** Public movie discovery, featured movies, genres, cinema
  discovery, and navigation into search, details, and booking.

## Purpose

Help guests discover currently bookable and upcoming movies, browse by
genre, find a cinema, and continue to movie details or booking.

## Page structure and behavior

1. **Global navigation**
   - Show the Maqady brand and links to Movies, Theaters, and Coming
     Soon, plus Search and the appropriate Sign in/account action.
   - The brand returns to `/`. Navigation items lead to their
     corresponding application routes.
   - Provide a usable mobile navigation layout without hiding
     essential destinations.

2. **Featured movie hero**
   - Show one featured movie at a time, with a large cinematic backdrop,
     title, a short synopsis, genres, runtime, age rating, and rating
     when a rating is available.
   - Provide clear **Book tickets** and **Movie details** actions.
     Both lead to the selected movie's details/showtime flow; neither
     may imply that a booking has already been made.
   - Support up to five featured movies. Show the active position and
     accessible controls to select a movie. Changing the selection
     updates the hero content and active indicator together.
   - When the reference trailer is available, it may play muted in the
     background. Provide accessible pause/play and sound controls.
     Do not autoplay sound. The hero remains usable when video is
     unavailable, blocked, or still loading by showing its backdrop or
     a fallback image.
   - Do not show fabricated ratings, metadata, trailers, or imagery.

3. **Today's showtime ticker**
   - Show a compact, horizontally moving strip of movies that have a
     remaining bookable showtime today. Each item shows the movie and
     its next showtime and links to that movie's details/showtimes.
   - Use the cinema's local date and time. Do not include past or
     unavailable showtimes. If there are no qualifying showtimes, hide
     the ticker or show a concise empty message; do not render stale
     times.
   - Motion must respect reduced-motion preferences and must not be
     required to access or understand an item.

4. **Genre browsing**
   - Show available genres as links to the movie listing filtered by
     that genre (for example, `/movies?genres=drama`).
   - Use stable URL-safe genre slugs. Genres with no matching public
     movies may be omitted.

5. **Now Showing**
   - Show a movie-card collection and a link to the complete movie
     listing.
   - Cards show a poster (or a designed fallback), movie title, first
     genre, runtime, age rating, and rating only when supplied.
   - Each card links to the matching movie details page. Never show
     unpublished or archived titles.

6. **Coming Soon**
   - Show the upcoming-movie collection after Now Showing, with a link
     to the upcoming movies listing.
   - Display each movie in a responsive release row with its poster
     or fallback, title, release date, and genre when available. Each
     row links to its movie details page.
   - Do not show a booking action for a movie that has no bookable
     showtimes.

7. **Our Cinemas**
   - Show cinemas available to customers, with a cover image or
     fallback, location, address, current open/closed status, and
     other details only when supplied (such as phone, hall count, or
     facilities).
   - Each card links to that cinema's details page; provide a link to
     the full theaters listing.
   - Display opening/closing times in the cinema's local time. Missing
     optional contact or image data must not break the card.

8. **Footer**
   - Provide consistent brand and navigation links to movie discovery,
     theaters, and applicable account/help/legal destinations.
   - Do not show nonfunctional links or imply unsupported payment,
     booking, or support services.

## Search

- The navigation Search action opens or focuses a search interface
  usable by keyboard and assistive technology.
- Search supports movie titles. Search across cast or cinemas only if
  the search service actually supports those entity types.
- Submitting a query navigates to results and preserves the query in
  the URL. Empty queries do not submit. Provide a way to close/clear
  search and return focus to its trigger.
- Search is an interactive capability and is not satisfied by a
  decorative search icon. Its endpoint, supported entity types, and
  result behavior must be agreed with the API implementation.

## Data and time rules

- Home content is public. Only public, customer-visible movie and
  cinema records may be rendered.
- The deployed `GET /api/v1/home` endpoint provides one aggregate
  response with featured movies, today's ticker, genres, Now Showing,
  Coming Soon, and cinemas. The frontend validates this response and
  handles missing or empty optional content without inventing values.
- The response limits the hero to five and includes totals for each movie
  collection so links can lead to the full listings. Movie collections
  may contain all items returned by the API.
- Use the server-provided cinema date/time for time-sensitive labels
  when available. A cinema day runs from 06:00 to 06:00; after
  midnight, a showtime before 06:00 belongs to the previous
  `cinemaDate`. Display times in the applicable cinema timezone.
- The reference displays movie ratings, but the supplied draft home
  API's movie schemas do not define a rating field. Confirm its source
  and contract before displaying ratings; omit them when unavailable.

## Loading, empty, and error behavior

- Show layout-matched loading placeholders while home data is being
  fetched.
- If the service is waking after inactivity, show a recoverable
  “waking up”/loading message rather than a false empty state or
  immediate generic failure.
- A failed request shows a clear error and a retry action. Do not
  replace errors with empty success-shaped data.
- Each content section handles empty results independently. If all
  movie content is empty, explain that no movies are currently
  available and retain navigation/search so the page is not blank.
- A missing optional image, video, phone, rating, or facility list
  uses an appropriate fallback or is omitted.

## Accessibility and responsive behavior

- Use semantic landmarks and heading levels; give the hero a single
  page-level heading and each content section a descriptive heading.
- All links and carousel/search controls are keyboard operable, have
  visible focus, and expose meaningful accessible names and current
  state. Decorative imagery has empty alt text; informative posters
  and cinema images have useful alt text.
- Do not convey movie status, selected carousel item, or cinema open
  state by color alone. Maintain readable contrast and support reduced
  motion.
- At mobile, tablet, and desktop widths, content reflows without
  horizontal page overflow, clipped controls, or overlapping text.
  Horizontal carousels/tickers remain operable by touch, pointer, and
  keyboard.

## Acceptance criteria

- A guest can navigate from the home page to Movies, Theaters, Search,
  and Sign in/account destinations.
- Every featured movie, movie card, and cinema card opens the matching
  detail page; genre links open a correctly filtered movie listing.
- Selecting a featured movie updates its hero details and active
  carousel state. Hero playback controls work when video is available,
  and the hero remains understandable when it is not.
- The ticker contains only movies with a future bookable showtime for
  the current cinema day and displays the correct local start time.
- Now Showing, Coming Soon, and cinema sections render the correct
  available content and handle optional or missing fields gracefully.
- Search submits a non-empty query and routes to supported results;
  unsupported search categories are not advertised.
- Loading, recoverable service wake-up, request failure/retry, and
  empty states are distinguishable. Empty data never appears as an
  unexplained blank section.
- The page is usable with keyboard and assistive technology and at
  mobile, tablet, and desktop widths.

## Reference notes and unresolved decisions

- Visual reference: `Home.html` and the FOYER design materials. Use
  their dark cinematic surfaces, high-contrast display headings,
  orange action accents, featured-media carousel, ticker, genre links,
  movie cards, and cinema cards as design guidance; retain Maqady as
  the product brand unless a brand change is explicitly approved.
- The supplied PRD's Home requirements are the baseline functional
  scope. The reference's ticker, full cinema cards, footer content,
  autoplay behavior, and ratings are additional design details;
  confirm business/data requirements where they go beyond the PRD.
- Confirm the backend home endpoint and response schema, search
  capability and route, rating source, cinema timezone behavior,
  trailer autoplay policy, ticker motion behavior, and destinations
  for help/legal links before treating them as production contracts.
