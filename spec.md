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

**UI and behavior** - Global navigation and Maqady brand. - Featured
movie hero. - Now Showing and Coming Soon sections; show release dates
where available. - Search supporting movies, cast, and cinemas if the
data source supports it. - Genre chips/links. - Our Cinemas section. -
Movie cards link to the corresponding movie details. - Loading, Empty,
and Error states; responsive layout.

**Acceptance criteria** - Users can open a movie details page from a
visible card. - Users can navigate to the movie listing. - Empty data
produces a clear message, not a blank section. - The page works at
mobile, tablet, and desktop widths.

### FR-02 --- Movies Listing, Search and Filters (`/movies`)

**UI and behavior** - Display movie cards/posters. - Search by movie
name; global search may also support cast/cinemas if supported by the
API. - Filter by genre and release date; actor filter only when actor
data is available. - Sort by rating or release date when those fields
are available. - Pagination or Load More. - Clear Filters. - Combine
multiple filters.

**Acceptance criteria** - Results reflect the selected search and
filters. - Multiple filters can be active together. - Empty results show
an Empty State. - Users can navigate from a card to movie details. -
Loading and Error states are handled.

### FR-03 --- Movie Details (`/movies/[movieId]`)

**UI and behavior** - Poster and cover image. - Title and description. -
Genre, duration, release date. - Age rating and review/rating
information if available. - Cast and director/crew when available. -
Showtimes. - UI reference also includes Videos, Photos, Details, and
More Like This sections where content exists. - Book Tickets action.

**Acceptance criteria** - The page displays data for the requested movie
only. - If no showtimes are available, explain this clearly. - Book
Tickets leads to a valid theater/showtime selection. - Handle loading,
errors, and unknown movie IDs. - Optional sections gracefully handle
missing content.

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

**Acceptance criteria** - Invalid forms are not submitted. - Validation
messages appear near relevant fields. - Protected routes require a valid
session. - Session expiry is handled clearly. - Any seat hold across
authentication must be server-backed and governed by a defined expiry
policy.

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

**Acceptance criteria** - Inputs are validated before submission. -
Success and error feedback is clear. - Server controls editable fields
and authorization. - Saved payment methods, if implemented, use a secure
provider integration.

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

Exact endpoint names, HTTP methods, request/response schemas,
authentication strategy, and error format are not specified by the PRD
and must not be silently assumed.

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
