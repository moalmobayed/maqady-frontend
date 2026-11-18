# maqady System --- `task.md`

> Implementation checklist derived from the PRD and the 24-page FOYER UI
> reference. All tasks start unchecked. Mark a task complete only after
> implementation and verification. Mock data does not replace required
> production integrations.

## Phase 0 --- Project Foundation

- [ ] **T01 --- Create the Next.js project**
  - Use Next.js App Router, TypeScript, ESLint, Tailwind CSS, and
    `src/`.
  - Run `npm run dev` and verify the app starts.
  - **Done when:** the app runs locally without startup errors.
- [ ] **T02 --- Add project specification files**
  - Place `spec.md`, `plan.md`, and `task.md` in the `ai/` directory.
  - Review open questions and record decisions as they are resolved.
  - **Done when:** all three documents are present and reflect the
    agreed MVP.
- [x] **T03 --- Set up global layout and FOYER theme**
  - Configure `src/app/layout.tsx`, global styles, typography, and
    theme tokens.
  - Use charcoal/dark surfaces, light text, orange primary actions,
    and subtle borders.
  - **Done when:** all pages share a consistent visual foundation.
- [ ] **T04 --- Define core data types**
  - Define User, Movie, Genre, Actor, Theater, Screen, Seat,
    Showtime, Booking, BookingSeat, and Payment types.
  - Confirm unspecified fields with the backend rather than
    inventing contracts.
  - **Done when:** types cover the data required by the UI and are
    consistent.
- [ ] **T05 --- Add mock data and service interfaces**
  - Create sample movies, genres, theaters, halls, seats, showtimes,
    and bookings.
  - Add a data-access layer separate from UI components.
  - **Done when:** screens can use mock data and later swap to the
    agreed backend.
- Sequencing note: T06 is being implemented before T04 and T05 because
  backend endpoints and data contracts are pending. T04 and T05 remain
  pending; T06 components must remain presentation-focused.
- [x] **T06 --- Build shared components and UI states**
  - Build Modal, Confirmation Dialog, Toast, Skeleton, Empty State,
    and Error State.
  - Support relevant Loading, Success, Empty, Error, Unauthorized,
    Session Expired, Disabled, and Pending states.
  - **Done when:** states/components are reusable and clear.

## Phase 1 --- Home and Movie Discovery

- [ ] **T07 --- Build customer navigation and footer**
  - Include FOYER brand, Movies, Theaters, Coming Soon, search, and
    auth/account links as appropriate.
  - Support mobile navigation.
  - **Done when:** links work and layout is responsive.
- [ ] **T08 --- Build reusable Movie Card and Movie Grid**
  - Display poster, title, available metadata, and link to details.
  - Add image fallback and loading skeleton.
  - **Done when:** components can be reused on Home and Movies
    Listing.
- [ ] **T09 --- Implement Home (`/`)**
  - Featured movie hero.
  - Now Showing and Coming Soon with dates where available.
  - Genre chips, global search, and Our Cinemas.
  - Loading/Empty/Error states.
  - **Done when:** users can navigate to movie/theater details and
    empty sections show clear feedback.
- [ ] **T10 --- Implement Movies Listing (`/movies`)**
  - Display movie cards with pagination or Load More.
  - Add Loading/Empty/Error states.
  - **Done when:** listing data renders and cards open the correct
    movie.
- [x] **T11 --- Implement Search and Filters**
  - Search by movie title.
  - Filter by genre and showtime date; filter by cast when actor data
    exists.
  - Sort by rating or release date when supported.
  - Combine filters and implement Clear Filters.
  - **Done when:** results reflect filters and empty results are
    handled.
- [ ] **T12 --- Implement Movie Details (`/movies/[movieId]`)**
  - Match the reference hierarchy: movie hero/media gallery, synopsis
    and booking summary, showtimes, Cast & Crew, Videos, Photos,
    Details, and More Like This when supported by data.
  - Keep date/cinema/showtime selection scoped to the requested movie;
    block unavailable showtimes and hand off the exact selected
    showtime to seat selection.
  - Handle loading, request failure, unknown movie, no showtimes, and
    optional media/data states distinctly.
  - Follow the [Movie Details spec](./movie-details/spec.md) and
    [implementation plan](./movie-details/plan.md).
  - **Done when:** all page acceptance criteria pass and valid movie
    data and showtimes lead to the correct seat-selection route.

## Phase 2 --- Theaters, Showtimes, and Seats

- [x] **T13 --- Implement Theater Listing (`/theaters`)**
  - Theater cards with image and available
    location/contact/hours/features.
  - Handle unavailable optional data and map-provider failures.
  - **Done when:** theater cards link to the correct theater detail
    page.
- [x] **T14 --- Implement Theater Details (`/theaters/[theaterId]`)**
  - Theater profile, halls, showtimes at the theater, and photos
    where available.
  - **Done when:** theater content and showtimes are scoped to the
    selected theater.
- [ ] **T15 --- Implement Date and Showtime Selection**
  - List cinemas showing the movie and select date.
  - Show start/end time where available, hall, price, and
    availability.
  - Do not present past showtimes as available.
  - **Done when:** users cannot proceed without a valid showtime.
- [ ] **T16 --- Build Seat Map and Seat Legend**
  - Screen indicator, seat rows/numbers,
    Available/Selected/Booked/Temporarily Unavailable.
  - Add price zones and wheelchair spaces when defined in the hall
    layout.
  - Do not rely on color alone to distinguish seat states.
  - **Done when:** map is understandable and usable on small
    screens.
- [ ] **T17 --- Implement Seat Selection Logic**
  - Select/deselect multiple seats.
  - Update seat count and total.
  - Prevent selection of booked/unavailable seats.
  - Require at least one seat to continue.
  - **Done when:** UI updates immediately and invalid selections
    show clear feedback.
- [ ] **T18 --- Implement Booking Summary**
  - Movie, theater, hall, showtime, seat numbers, ticket
    price/quantity, fees/discounts where applicable, and total.
  - Checkout action and return-to-seats action.
  - **Done when:** summary matches the selected showtime/seats and
    production pricing is server-validated.
- [ ] **T19 --- Define seat-hold and concurrency behavior with
      backend**
  - Decide whether seat holds are supported and set expiry/release
    rules.
  - Revalidate seats server-side before confirmation.
  - Prevent duplicate seat confirmation for the same showtime using
    atomic server-side validation.
  - **Done when:** behavior is documented and tested for a seat
    becoming booked mid-flow.

## Phase 3 --- Authentication and User Account

- [x] **T20 --- Implement Register and Login**
  - Forms, field validation, email/password errors, and show/hide
    password.
  - Support Sign In/Create Account presentation from the UI
    reference.
  - Connect the documented authentication endpoints through same-origin
    routes, store session tokens in HttpOnly cookies, and return to the
    originating same-origin page after success.
  - **Done when:** valid/invalid submissions and errors are handled.
- [ ] **T21 --- Implement Logout, Session Expiry, and Protected
      Routes**
  - Handle expired sessions.
  - Enforce protected routes and server-side authorization.
  - **Done when:** authorization cannot be bypassed by changing a
    URL or calling an API directly.
- [ ] **T22 --- Implement User Profile (`/profile`)**
  - Display name/email, edit allowed fields, change password if
    supported, and logout.
  - Saved Cards only through secure provider tokens/references;
    never store full card number or CVC.
  - **Done when:** validation and authorization work and sensitive
    card data is not stored by the app.
- [ ] **T23 --- Implement My Bookings (`/my-bookings`)**
  - Upcoming/Past bookings with ID, movie, theater, date/time,
    seats, booking status, and payment status.
  - Add Loading/Empty/Error states.
  - **Done when:** users can access only their own bookings.
- [ ] **T24 --- Implement Booking Details
      (`/my-bookings/[bookingId]`)**
  - Booking/ticket details and QR if supported.
  - Add Download Ticket, Email Again, Directions, or history only
    when implemented.
  - Offer cancellation only if the approved policy permits it.
  - **Done when:** unauthorized access is denied and unavailable
    actions are not presented as successful.

## Phase 4 --- Checkout, Payment, and Confirmation

- [ ] **T25 --- Finalize payment and booking API contract**
  - Choose payment provider and enabled methods.
  - Define payment creation/confirmation, statuses, errors, and
    server-side verification.
  - **Done when:** backend/provider contract is documented.
- [ ] **T26 --- Implement Checkout (`/checkout/[bookingId]`)**
  - Show order details and final amount.
  - Handle preparing/pending/success/failure/cancel/network error.
  - Prevent duplicate payment requests and do not store sensitive
    card data in the frontend.
  - Only display payment methods that are actually supported.
  - **Done when:** UI does not claim success before server
    confirmation.
- [ ] **T27 --- Implement Booking Confirmation**
  - Booking reference, movie, theater, date/time, hall, seats,
    payment details, total, and QR/e-ticket if supported.
  - Add My Bookings link; calendar/email/directions actions only
    when implemented.
  - **Done when:** server confirms booking before success is
    displayed and refresh does not create a new booking.
- [ ] **T28 --- Handle Payment and Booking Recovery**
  - Test failure, cancellation, network interruption, retry,
    refresh, and duplicate submit.
  - Retrieve booking/payment state from server.
  - **Done when:** retry does not create duplicate booking/payment
    and state can be recovered.

## Phase 5 --- Admin Dashboard

- [ ] **T29 --- Build Admin Overview (`/admin`)**
  - KPIs/charts for bookings, revenue, occupancy, top movies, and
    payment summaries only when backed by data.
  - Add admin layout/sidebar and server-side role checks.
  - **Done when:** only authorized admins can access the page and
    metrics have defined data sources.
- [ ] **T30 --- Implement Admin Movies (`/admin/movies`)**
  - Create/read/update/archive/delete according to the agreed
    policy.
  - Validate forms and show success/error feedback.
  - **Done when:** only authorized admins can mutate movie data.
- [ ] **T31 --- Implement Admin People (`/admin/people`)**
  - Manage actors/directors/writers/crew roles where in scope.
  - **Done when:** permissions are enforced and data validation
    works.
- [ ] **T32 --- Implement Admin Theaters and Halls
      (`/admin/theaters`)**
  - Manage theaters, halls, capacity, seating layout, and status.
  - **Done when:** seats map consistently to halls and unauthorized
    users are denied.
- [ ] **T33 --- Implement Admin Showtimes (`/admin/showtimes`)**
  - Create/update/archive showtimes.
  - Prevent conflicting showtimes in the same hall.
  - **Done when:** conflicts are rejected with clear feedback.
- [ ] **T34 --- Implement Admin Bookings (`/admin/bookings`)**
  - Search/filter bookings and inspect permitted booking details.
  - **Done when:** booking/payment status comes from a trusted
    source.
- [ ] **T35 --- Implement Admin Payments (`/admin/payments`)**
  - Show transactions/status and reconciliation data if available.
  - **Done when:** client-side actions cannot fabricate
    provider-confirmed payment status.
- [ ] **T36 --- Implement Admin Customers (`/admin/customers`)**
  - Search/view the customer information needed for approved
    operations.
  - **Done when:** access is restricted and sensitive data is
    minimized.

## Phase 6 --- QA, Accessibility, and Performance

- [ ] **T37 --- Test movie discovery**
  - Existing/non-existing movie search, multiple filters, clear
    filters, pagination, details, and showtimes.
  - **Done when:** results and empty states are correct.
- [ ] **T38 --- Test booking and seat integrity**
  - Select/deselect seats, total calculation, unavailable seat,
    expired showtime, and conflicting booking.
  - **Done when:** conflicting seats cannot be confirmed and total
    is correct.
- [ ] **T39 --- Test authentication and authorization**
  - Register/login/logout, session expiry, cross-user booking
    access, and non-admin access to admin APIs.
  - **Done when:** server rejects unauthorized operations.
- [ ] **T40 --- Test payment and confirmation**
  - Success/failure/cancel, network interruption, repeated clicks,
    refresh, and booking retrieval.
  - **Done when:** no unverified success or duplicate
    booking/payment occurs.
- [ ] **T41 --- Test responsive design and accessibility**
  - Mobile/tablet/desktop, keyboard navigation, labels, focus,
    contrast, alt text, and seat states not based on color alone.
  - **Done when:** core flows are usable across viewport sizes and
    by keyboard.
- [ ] **T42 --- Performance and security review**
  - Lazy-load posters, optimize images, avoid unnecessary seat-map
    re-renders, check production HTTPS, secrets, and server-side
    authorization.
  - **Done when:** no sensitive payment secrets/card data are
    exposed in the client and access checks are enforced.
- [ ] **T43 --- MVP acceptance review**
  - Verify every acceptance criterion in `spec.md`; record gaps and
    unresolved decisions.
  - **Done when:** core discovery, booking, payment verification,
    bookings, admin scope, UI states, and authorization are verified
    or documented as deferred.

## Additional decisions to resolve before production

- [ ] Decide when login becomes mandatory in the booking flow.
- [ ] Confirm backend ownership, database, and authentication
      provider.
- [ ] Confirm payment provider and enabled payment methods (Card,
      Apple Pay/Google Pay, Pay at the cinema).
- [ ] Decide seat-hold behavior and expiry.
- [ ] Define cancellation/refund policy.
- [ ] Define ticket pricing, fees, and discounts.
- [ ] Confirm QR/e-ticket, email delivery, download, calendar,
      directions, and maps scope.
- [ ] Confirm final Admin permissions.
- [ ] Document API request/response schemas.
