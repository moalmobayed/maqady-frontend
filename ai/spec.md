# maqady System --- `spec.md`

> **Source of truth:** The supplied 23-page PRD, supplemented by the
> 24-page Maqady UI reference PDF. Requirements from the PRD remain
> authoritative for product behavior. UI-only details are identified as
> design references or decisions to confirm when they imply
> backend/business behavior.

## 1. Product Overview

Maqady is a cinema ticket reservation platform. Users discover movies,
search and filter listings, view movie and theater details, choose a
showtime and seats, review a booking summary, pay, and access confirmed
bookings. Admin users manage movies, people, theaters, halls, showtimes,
bookings, payments, and customers according to authorized permissions.

### MVP scope

1.  Home
2.  Movies Listing
3.  Search and Filters
4.  Movie Details
5.  Theaters and Showtimes
6.  Interactive Seat Selection
7.  Booking Summary
8.  Checkout and Payment
9.  Booking Confirmation
10. Authentication
11. User Profile
12. My Bookings
13. Basic Admin Dashboard

The UI reference further shows dedicated screens for Theater Details,
Booking Details, Admin People, Admin Payments, and Admin Customers.
These should be included in the route inventory; final MVP scope for
each admin capability must be confirmed.

## 2. Roles

- **Guest:** Can browse public movie and theater content. Booking
  access depends on the final authentication decision.
- **Registered User:** Can manage their profile, access their own
  bookings, and complete the booking flow.
- **Admin:** Can manage authorized catalog and operational data.
- Authorization must be enforced server-side. Hiding a button or route
  in the client is not sufficient.

## 3. Functional Requirements by Page

### FR-01 --- Home (`/`)

The complete Home page requirements, behavior, data rules, accessibility
guidance, acceptance criteria, and unresolved decisions are maintained
in the dedicated [Home page specification](./home/spec.md).

### FR-02 --- Movies Listing, Search and Filters (`/movies`)

**Purpose and access**

- Provide a public, responsive catalog for movies currently showing and
  upcoming releases. Guests can browse without signing in.
- Keep the listing at `/movies`; movie cards navigate to the matching
  `/movies/[movieId]` detail route.

**Page structure and behavior**

- Show a prominent **Movies** heading and separate **Now showing** and
  **Coming soon** result sets. The reference presents these as tabs with
  per-status counts; use the counts returned by the catalog, not
  hard-coded values.
- The reference labels the default ordering **Newest releases first**.
  Support release-date sorting when the field and API ordering are
  available. Support rating sorting only when a trusted rating source
  and API ordering are available. Do not show rating-sort controls or
  rating badges based on sample/reference values.
- Provide title search. Search by cast/actor only when cast data and
  search support are confirmed; the field label and placeholder must
  accurately describe supported search.
- Provide a **Filters** control and accessible panel for genre,
  showtime date (Any day, Today, Tomorrow, This weekend), and cast.
  The approved listing design uses showtime date rather than a
  movie-release-date filter. Populate cast choices from available
  actor data; do not use prototype names or sample data.
- Support combining supported filters. The reference shows a count on
  the Filters control when criteria are active, active-filter chips in
  the results area, a **Clear all** action, and a **Show N movies**
  action. Keep filter state and the result count consistent with the
  applied criteria.
- Render a responsive grid of movie cards, each linking to its matching
  movie detail page. Show the poster or a designed fallback, title,
  available genres, runtime, age rating, and the appropriate release
  or in-cinemas date. Show a **New** badge only when the catalog
  supplies an explicit new-release designation or an agreed rule.
  Ratings may appear only when supplied by an agreed, trusted source.
- Provide **Load more** or pagination according to the confirmed API.
  Show how many results are displayed versus the total when available;
  indicate when there are no more results. Appended pages must not
  duplicate movies.
- Use the current Maqady branding and application theme. The supplied
  Movies prototype is a layout/interaction reference, not a source of
  production movie data or a reason to change the product brand.

**Search and filter state**

- Search, status, sort, and filters must combine predictably and each
  change must update the results. Clear all removes the active
  optional criteria without silently changing the selected release
  status.
- **Today** and **Tomorrow** are based on the cinema-local date
  returned by the movie showtime service. **This weekend** means
  upcoming Friday and Saturday showtimes. A cast selection matches
  movies whose credits identify the selected person with the actor role.
- Show date, cast, genre, search, and status selections are URL-backed;
  validate query values and restore the corresponding selection/results
  after refresh and browser Back/Forward.
- Whether controls update results immediately or after a dialog
  confirmation, and whether state is persisted in URL parameters, must
  follow the approved interaction/API contract. If state is URL-backed,
  refresh and browser Back/Forward must restore the corresponding
  results; query values must be validated before use.

**Loading, empty, and error behavior**

- Show a layout-matched loading state while results are requested or
  more results are loading.
- Distinguish an empty catalog from a search/filter combination with no
  matches. Offer a clear way to remove active criteria when no matches
  remain.
- Present status-specific empty results clearly; do not make an empty
  Coming soon list look like a failed request or vice versa.
- Show recoverable request errors and a retry action; do not replace
  failed requests with an empty success-shaped result.
- Hide unavailable optional filters and metadata rather than rendering
  fabricated values or nonfunctional controls.

**Accessibility and responsive behavior**

- Use semantic tabs or equivalent accessible status controls, a
  labelled search field, and an accessible filter dialog/panel with
  keyboard-operable controls, visible focus, and clear selected states.
- Preserve focus when opening/closing filters and announce result-count
  changes without making every result update disruptive.
- Ensure poster alt text is meaningful, decorative images are hidden
  from assistive technology, and status/rating information is not
  conveyed by color alone.
- Reflow the grid and filter UI for mobile, tablet, and desktop without
  horizontal page overflow.

**Acceptance criteria**

- A guest can switch between Now showing and Coming soon and sees
  results for only the selected status.
- A non-empty title query returns matching movies; unsupported cast
  search is not advertised.
- Every available filter and sort choice affects the returned results.
  Multiple active criteria are applied together, and Clear all removes
  active optional criteria.
- Showtime-date results use the selected movie's cinema-local
  showtime dates; cast results use the movie's actor credits.
- Result counts and Load more/pagination state match the data returned
  by the API; loading another page adds no duplicate movies.
- Each movie card opens the matching details route and shows only
  metadata actually available for that movie.
- Empty catalog, no matches, initial loading, load-more loading,
  request failure, and retry are handled. Invalid query parameters are
  handled if query-string state is part of the approved route contract.
- If search and filter state is URL-backed, refresh and browser
  Back/Forward restore the matching view.

The page-specific implementation plan and prototype mapping are in
[`movies/spec.md`](./movies/spec.md) and
[`movies/plan.md`](./movies/plan.md). API-dependent behavior remains
subject to the decisions in the page plan.

### FR-03 --- Movie Details (`/movies/[movieId]`)

**Purpose and access**

- Let guests view information for one movie and discover a valid
  theater/showtime before entering seat selection.
- Resolve the route parameter to one movie. Never substitute another
  movie when the requested ID is invalid or unavailable.
- Keep the page at `/movies/[movieId]`; the movie listing links to this
  route.

**Page content and behavior**

- Use the shared customer navigation and footer, plus a breadcrumb back
  to Movies and, when supported, the movie's genre/listing context.
- Show available hero artwork, title, synopsis, genres, runtime,
  release date/status, age rating, language/subtitles, and a trusted
  rating/review summary only when supplied by an agreed source.
- Show available director, writers, producer, and cast/crew credits.
  Identify cast roles/characters when supplied. Do not render missing
  credits as placeholders or link names to routes that do not exist.
- Provide the movie's available showtimes on the detail page. Let users
  choose a date, a cinema, and then a showtime. Showtime data must be for
  the current movie and selected date/cinema. Display cinema, local
  start/end time, hall, availability, and all supplied seat-zone prices
  with their currency, formatted from minor units, only when the service
  supplies them.
- Past, sold-out, and unavailable showtimes must not be selectable.
  Selecting a date or cinema clears a previously selected showtime if it
  no longer belongs to that selection. A seat-selection action stays
  disabled until a valid showtime is selected and then leads to that
  show's seat-selection route.
- Provide a Book Tickets action that takes the user to the showtime
  section; it must not imply a booking has been made. Optional cinema
  count, next-show, and starting-price summaries must be derived from
  current service data or omitted.
- Show Videos, Photos, Details, and More Like This sections only when
  the relevant data exists. Media controls must reflect actual media
  capabilities. Recommendations must exclude the current movie and
  must use valid movie routes.

**Loading, empty, and error behavior**

- Handle movie loading, request failure with retry, and an unknown
  movie ID distinctly. A failed request must not appear as a not-found
  result.
- Load showtimes independently from movie details. Show loading,
  recoverable error/retry, no showtimes for the selected date/cinema,
  and no upcoming showtimes for the movie as distinct states.
- If optional artwork, credits, ratings, media, or recommendations are
  unavailable, omit that content or use the shared image fallback. Do
  not invent values or show empty section shells.

**Accessibility and responsive behavior**

- Use one page-level heading, semantic breadcrumb navigation, labelled
  date and cinema controls, and keyboard-operable showtime and media
  controls with visible focus and clear selected/disabled states.
- Do not communicate showtime availability by color alone. Provide
  meaningful image alternatives and accessible names for media
  controls; manage focus when opening and closing any media viewer.
- Reflow the hero, media, credits, and showtime selector for mobile,
  tablet, and desktop without horizontal page overflow.

**Acceptance criteria**

- The displayed title, metadata, media, and showtimes all belong to the
  requested movie.
- Guests can browse the page without signing in.
- Selecting a date and cinema shows only matching future showtimes.
- Past, sold-out, and unavailable showtimes cannot be selected.
- The seat-selection action is unavailable until a valid showtime is
  selected and then opens the route for that exact showtime.
- Missing showtimes and optional content, loading, recoverable failures,
  and unknown movie IDs each produce the correct distinct state.
- The page remains usable by keyboard and at mobile, tablet, and desktop
  widths.

The detailed page structure, screenshot interpretation, unresolved
decisions, and implementation sequence are maintained in the
[Movie Details specification](./movie-details/spec.md) and
[implementation plan](./movie-details/plan.md).

### FR-04 --- Theaters and Showtimes (`/theaters`, `/theaters/[theaterId]`)

**UI and behavior** - List theaters showing the selected movie, or the
theater directory where applicable. - Theater cards may show image,
location/contact/hours/features when supplied by the data. - Theater
details include profile, halls, showtimes at that theater, and photos
when available. - Select a date and showtimes for that theater/movie. -
Show start/end times when available, hall, ticket price, and
availability. - Maps/directions are optional and depend on a selected
provider; provide a graceful fallback if maps fail.

**Acceptance criteria** - Showtimes reflect the selected
movie/theater/date. - Past showtimes are not presented as available. -
Users cannot proceed without a valid showtime. - Missing showtimes,
loading, and errors are handled. - Map failure does not block ticket
booking.

### FR-05 --- Interactive Seat Selection (`/showtimes/[showtimeId]/seats`)

**UI and behavior** - Screen indicator, seat grid, row labels, and seat
numbers. - Seat states: Available, Selected, Booked, Temporarily
Unavailable. - Price zones where applicable. - Wheelchair spaces where
defined by the hall layout. - Seat legend, selected-seat count,
selection/deselection, and live total. - The server is the source of
truth for seat availability.

**Acceptance criteria** - Booked/unavailable seats cannot be selected. -
Selected seats have a visible state. - Total and selected-seat count
update when seats are selected/deselected. - At least one seat is
required to continue. - The server revalidates availability before
booking confirmation. - Atomic server-side validation prevents the same
seat being confirmed for two users in the same showtime. - The UI
reference suggests a temporary hold timer; this requires a real
server-backed hold and an agreed expiry policy.

### FR-06 --- Booking Summary

**UI and behavior** - Movie, theater, hall, show date/time, selected
seat numbers. - Ticket price and quantity. - Fees/discounts when
applicable. - Final total. - Continue to Checkout and return to edit
seats.

**Acceptance criteria** - Summary matches the selected showtime and
seats. - Final pricing is calculated/validated by the server, not
trusted from client-submitted totals. - Viewing the summary does not
mean the booking is confirmed. - Users can return to edit seats before
payment.

### FR-07 --- Checkout and Payment (`/checkout/[bookingId]`)

**UI and behavior** - Order details and final amount. - Integrate with
an approved payment provider (Stripe is an example in the PRD, not a
confirmed choice). - Loading/preparing/pending states. - Handle success,
failure, cancellation, network interruption, and retry. - Prevent
duplicate payment/booking submissions. - Do not store sensitive card
data in the application frontend.

The UI reference shows Card, Apple Pay/Google Pay, and Pay at the
cinema. These methods are design references until business rules and
provider support are confirmed.

**Acceptance criteria** - Booking is not marked paid before server
verification. - Server verifies payment status with the provider. -
Errors/cancellation/network interruption have clear states. - Repeated
clicks or refreshes do not create duplicate bookings/payments. - The UI
never displays payment success before server confirmation.

### FR-08 --- Booking Confirmation (`/booking-confirmation/[bookingId]`)

**UI and behavior** - Success/confirmed state, booking reference, movie,
theater, date/time, hall, seats, payment details, and total. -
QR/e-ticket if implemented. - My Bookings link. - UI reference also
shows Add to Calendar, Directions, and email ticket delivery; implement
only when supported.

**Acceptance criteria** - Confirmation is shown as successful only after
server confirmation. - Booking details can be retrieved on refresh. -
Refresh does not create another booking. - An unconfirmed booking
displays an appropriate state instead of false success.

### FR-09 --- Authentication (`/login`, `/register`)

**UI and behavior** - Sign in, account creation, and logout. - Field
validation and email/password errors. - Show/hide password. - Session
expiry handling. - Protected routes. - UI reference uses Sign In/Create
Account tabs and suggests preserving a seat hold during sign-in.

**Confirmed authentication endpoints** - `POST /auth/registrations` accepts
`fullName`, `email`, and `password`; `POST /auth/sessions` accepts `email` and
`password`. Both return access and refresh tokens with expiry timestamps and
a customer record. The frontend proxies these requests through same-origin
Route Handlers and stores tokens in HttpOnly cookies. Token refresh and
protected-route endpoint behavior remain to be confirmed.
Local sign-out clears the HttpOnly cookies; backend token revocation is not
assumed without an endpoint contract. Successful sign-in or registration
displays a toast and returns to the initiating same-origin page when
available, otherwise the home page; reject external, auth, and API routes as
return destinations.

**Acceptance criteria** - Invalid forms are not submitted. - Validation
messages appear near relevant fields. - Protected routes require a valid
session. - Session expiry is handled clearly. - Successful sign-in and
registration show confirmation toasts during redirection. - Any seat hold
across authentication must be server-backed and governed by a defined
expiry policy.

### FR-10 --- My Bookings and Booking Details (`/my-bookings`, `/my-bookings/[bookingId]`)

**UI and behavior** - Upcoming and Past bookings. - Booking ID, movie,
theater, date/time, seats, booking status, and payment status. - Booking
details/ticket and QR where supported. - UI reference shows Download
Ticket, Email Again, Directions, and booking history; provide only when
implemented. - Cancellation only if the approved policy allows it.

**Acceptance criteria** - Users can access only their own bookings. -
Booking and payment states come from the server. - Loading, Error, and
Empty states are handled. - Cancellation is not offered unless policy
permits it. - Server authorization prevents access to another user's
booking.

### FR-11 --- User Profile (`/profile`)

**UI and behavior** - Display name and email. - Edit allowed profile
fields. - Change password if supported. - Logout. - UI reference shows
Saved Cards; this must use provider-managed tokens/references and must
never store full card numbers or CVC in the application.

**Confirmed API contract** - `GET /me` returns the authenticated customer's
ID, name, email, phone, verification state, and member-since timestamp.
The profile page uses the server-held access token and displays these
values without sample-data fallbacks. Profile updates, password changes,
and saved cards remain unavailable until their API contracts are provided.
Sign out clears the local access and refresh cookies; remote token revocation
is unavailable until a backend logout contract is provided.

**Acceptance criteria** - The signed-in navigation links directly to
`/profile`; signed-out users retain a Sign in link. - Sign out clears local
auth cookies, redirects home, and shows confirmation. - Inputs are validated
before submission. - Success and error feedback is clear. - Server controls
editable fields and authorization. - Saved payment methods, if implemented,
use a secure provider integration.

### FR-12 --- Admin Overview (`/admin`)

**UI and behavior** - Booking/revenue overview when supported by
reliable data. - UI reference includes KPIs, revenue charts, revenue by
theater, bookings/occupancy, top movies, and payment/status summaries. -
Metrics must have defined data sources; do not fabricate values.

**Acceptance criteria** - Only authorized admins can access the page. -
Loading, Empty, and Error states are handled. - Metrics are derived from
backend data and documented.

### FR-13 --- Admin Theaters and Halls (`/admin/theaters`)

- Manage theaters, halls/auditoriums, seating layout, capacity, and
  status as supported.
- Validate data and confirm destructive/sensitive actions.
- Prevent conflicting showtimes in the same hall.

### FR-14 --- Admin Movies (`/admin/movies`)

- Create, view, update, archive/delete movies according to agreed
  policy.
- Manage genre relationships and available movie metadata.
- Validate forms and report operation success/failure.

### FR-15 --- Admin People (`/admin/people`)

- Manage actors and crew roles such as actors, directors, writers, and
  crew when in scope.
- Protect personal/admin data and enforce server-side permissions.

### FR-16 --- Admin Showtimes (`/admin/showtimes`)

- Create/update/archive showtimes.
- Associate each showtime with a movie, hall, date/time, price, and
  availability as defined by the data model.
- Reject conflicting showtimes in the same hall.

### FR-17 --- Admin Bookings (`/admin/bookings`)

- Search/filter and inspect bookings.
- Display booking and payment status from a trusted source.
- Only expose operations permitted by the admin policy.

### FR-18 --- Admin Payments (`/admin/payments`)

- Display payment transactions/status and reconciliation information
  if available.
- Do not allow the client to fabricate or directly override
  provider-confirmed payment state.

### FR-19 --- Admin Customers (`/admin/customers`)

- Search/view customer information needed for support/operations.
- Apply role-based access and minimize sensitive data exposure.

## 4. Main User Flows

### Discovery to booking

Home → Movies/Search → Movie Details → Theater & Showtime → Seat
Selection → Booking Summary → Checkout → Server-verified Confirmation →
My Bookings.

### Authentication

Register/Login → Validation → Session → Protected pages → Logout/Session
Expired handling.

### View bookings

Login → My Bookings → Upcoming/Past → Booking Details → Optional
cancellation only if policy allows.

### Admin management

Admin login → Admin Overview → Manage
catalog/people/theaters/halls/showtimes/bookings/payments/customers
according to permissions.

## 5. Business Rules and Data Integrity

1.  Each showtime is associated with a movie, hall, and date/time.
2.  Seats belong to a hall, but booking availability is specific to a
    showtime.
3.  The same seat may be booked for different showtimes.
4.  The same seat cannot be confirmed for two bookings in the same
    showtime.
5.  Revalidate seats server-side before confirmation.
6.  Temporary seat holds and their expiry/release behavior require a
    product decision.
7.  Final price is calculated/validated server-side.
8.  Duplicate booking/payment requests must be prevented.
9.  Server verifies payment with the provider before marking a booking
    paid.
10. Conflicting showtimes in the same hall must be rejected.
11. Users must not access other users' bookings.
12. Non-admin users must not mutate admin data, even through direct API
    calls.
13. Cancellation/refund policy is not specified in the PRD.

## 6. Shared UI Components

- Customer Navbar and Footer
- Admin Sidebar/Layout
- Movie Card/Grid
- Search Bar and Filter Sidebar/Drawer
- Date Selector and Showtime Card
- Seat, Seat Map, and Seat Legend
- Booking Summary and Payment Status
- Modal and Confirmation Dialog
- Toast Notifications
- Skeleton Loaders
- Empty and Error States
- Pagination/Load More
- Protected-route and authorization handling

## 7. Required UI States

Handle relevant states for loaded data and operations: - Loading -
Success - Empty - Error - Unauthorized - Session Expired - Disabled -
Pending

Booking-specific states include invalid selection, seat no longer
available, payment preparation, payment failure/cancellation/pending
verification, and unconfirmed booking.

## 8. UI/UX, Responsive Design, and Accessibility

- Brand: Maqady.
- Modern dark cinematic look; charcoal/near-black surfaces, light
  text, orange primary actions, subtle borders, and status colors.
- Condensed/display-style headings as represented in the UI reference;
  use an appropriate licensed/local font or fallback.
- Consistent spacing, typography, icons, buttons, forms, and status
  tokens based on the UI Design System page.
- Mobile navigation and seat map must remain usable without overlap.
- Tablet layout should remain clear and balanced.
- Desktop can use available width for movies, filters, and booking
  summary.
- Seat state must not rely on color alone.
- Support keyboard navigation, form labels, sufficient contrast,
  visible focus, and image alt text.

## 9. Data Entities Identified by the PRD

- User
- Movie
- Genre
- Actor
- Theater
- Screen/Auditorium
- Seat
- Showtime
- Booking
- Booking Seat
- Payment

The PRD identifies entities at a high level. Final fields,
relationships, API schemas, and database decisions must be agreed with
the backend implementation.

## 10. API Capabilities Needed

- List Movies
- Movie Details
- Search/Filter Movies
- List Theaters
- Showtimes by Movie/Theater/Date
- Seat Map/Availability
- Create Booking or Seat Hold
- Booking Details
- Create/Confirm Payment
- User Bookings
- Register/Login
- Update Profile
- Admin CRUD and operational queries for supported entities

API contracts beyond the confirmed authentication and profile-read endpoints
above, including authentication error details, refresh/logout, profile updates,
password changes, saved cards, and protected-route behavior, remain to be
confirmed and must not be silently assumed.

## 11. Non-Functional Requirements

- Lazy-load and optimize movie posters.
- Use pagination when needed.
- Avoid unnecessary seat-map re-renders.
- Protect user data and enforce permissions server-side.
- Use HTTPS in production.
- Validate inputs on client and server.
- Never place payment secrets or sensitive card data in the frontend.
- Handle network errors, session expiry, and duplicate requests.
- Maintain reliable booking/payment status.
- Separate UI from data-access services and use reusable components.
- Use consistent error handling and clear naming.
- Test the core booking flow.

## 12. Testing and MVP Acceptance

Test: - Search for existing/non-existing movies. - Multiple filters and
clearing filters. - Movie details and relevant showtimes. -
Theater/date/showtime selection. - Seat selection/deselection and total
calculation. - A seat becoming booked during the flow. - Payment
success/failure/cancellation/network interruption. - Repeated submission
and refresh recovery. - Upcoming/past bookings. - User/Admin
authorization. - Loading/Empty/Error/Unauthorized/Session Expired
states. - Responsive behavior, accessibility, and form validation.

**MVP acceptance:** Users can browse/search movies, view details, select
a valid showtime and seats, review an accurate summary, complete a
payment integration with server verification, view their bookings, and
admins can manage agreed movie/showtime data. Responsive behavior, state
handling, seat-conflict prevention, and authorization are required.

## 13. Open Questions --- Resolve Before Production

1.  Is login required before selecting seats or only before payment?
2.  Is the service for one cinema or multiple cinemas? The PRD's default
    MVP points toward multiple cinemas.
3.  Will seat holds be implemented? What is their expiry duration?
4.  What is the cancellation/refund policy?
5.  Are ticket prices fixed or variable by cinema/showtime/seat?
6.  Which payment provider will be used?
7.  Are email tickets and QR/e-tickets in MVP?
8.  What are the final admin permissions?
9.  Will the project use its own backend or an external service?
10. What are the final data model and API schemas?
11. Are Apple Pay/Google Pay and Pay at the cinema actual enabled
    payment methods or UI concepts only?
12. Are Maps/Directions, Add to Calendar, Download Ticket, and Email
    Again in MVP?
