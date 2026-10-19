# maqady System --- `plan.md`

This plan is based on the supplied PRD and the 24-page FOYER UI
reference PDF. It adapts the original React/Vite-oriented PRD to
**Next.js App Router**. Any technology choice not made by the source
documents is marked as a proposal or a decision to confirm.

## 1. Implementation Strategy

Build the application in small, testable phases. Start with the Next.js
foundation, shared design system, and mock data. Implement discovery
pages first, then showtimes and booking, then authentication and user
bookings, payment integrity, and admin operations. Keep the data-access
layer separate from UI components so mock data can later be replaced by
the agreed backend.

### Proposed frontend stack

- Next.js App Router + TypeScript.
- Tailwind CSS.
- shadcn/ui optional for reusable accessible components.
- React Hook Form + Zod for form handling and validation.
- TanStack Query optional if API caching/refetching needs justify it.
- Zustand optional for transient client UI state; it must not be the
  source of truth for booking/seat availability.
- Stripe Elements only if Stripe is selected.
- Next.js Route Handlers may provide API endpoints if the application
  owns its backend.

The PRD does **not** finalize a database, ORM, authentication provider,
or payment provider. Do not treat PostgreSQL/Prisma or any specific
provider as an agreed requirement until decided.

## 2. Suggested Folder Structure

```text
movie-reservation/
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── movies/
│   │   │   ├── page.tsx
│   │   │   └── [movieId]/page.tsx
│   │   ├── theaters/
│   │   │   ├── page.tsx
│   │   │   └── [theaterId]/page.tsx
│   │   ├── showtimes/[showtimeId]/seats/page.tsx
│   │   ├── checkout/[bookingId]/page.tsx
│   │   ├── booking-confirmation/[bookingId]/page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── my-bookings/
│   │   │   ├── page.tsx
│   │   │   └── [bookingId]/page.tsx
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── theaters/page.tsx
│   │       ├── movies/page.tsx
│   │       ├── people/page.tsx
│   │       ├── showtimes/page.tsx
│   │       ├── bookings/page.tsx
│   │       ├── payments/page.tsx
│   │       └── customers/page.tsx
│   ├── components/
│   │   ├── layout/       # Customer navbar/footer, admin sidebar
│   │   ├── common/       # Modal, toast, skeleton, empty/error states
│   │   ├── movies/       # MovieCard, MovieGrid, SearchBar, Filters
│   │   ├── theaters/     # TheaterCard, TheaterDetails
│   │   ├── showtimes/    # DateSelector, ShowtimeCard
│   │   ├── seats/        # SeatMap, Seat, SeatLegend
│   │   ├── booking/      # BookingSummary, PaymentStatus, Ticket
│   │   └── admin/        # Admin tables and forms
│   ├── features/
│   │   ├── movies/
│   │   ├── theaters/
│   │   ├── booking/
│   │   ├── auth/
│   │   ├── profile/
│   │   └── admin/
│   ├── services/         # API/data-access layer
│   ├── schemas/          # Zod schemas
│   ├── hooks/
│   ├── store/            # Optional transient client UI state
│   ├── lib/              # Utilities and provider adapters once decided
│   ├── types/
│   └── data/              # Initial mock data
├── spec.md
├── plan.md
├── task.md
└── package.json
```

## 3. Routes and Page Responsibilities

---

Route Responsibility

---

`/` Featured hero, Now Showing, Coming
Soon, genres, Our Cinemas

`/movies` Listing, search, filters, sorting,
pagination

`/movies/[movieId]` Movie information, showtimes,
cast/crew, media sections where
available

`/theaters` Theater directory and/or theaters
for a selected movie

`/theaters/[theaterId]` Theater profile, halls, showtimes,
photos

`/showtimes/[showtimeId]/seats` Seat map, availability states,
selected-seat total

`/login` Sign-in form

`/register` Account creation

`/checkout/[bookingId]` Booking summary and payment flow

`/booking-confirmation/[bookingId]` Server-verified confirmation and
ticket

`/my-bookings` Upcoming and past bookings

`/my-bookings/[bookingId]` Booking details/ticket

`/profile` Profile and optional saved payment
methods

`/admin` Admin overview

`/admin/theaters` Theater, hall, and seat layout
management

`/admin/movies` Movie management

`/admin/people` Actor/crew management

`/admin/showtimes` Showtime management

`/admin/bookings` Booking management

`/admin/payments` Payment status/reconciliation

`/admin/customers` Customer search/details

---

Routes are adapted from the UI index to Next.js App Router. The final
URL/query model for movie-specific theater/showtime selection can be
decided during implementation without changing the functional
requirements.

## 4. Implementation Phases

### Phase 0 --- Decisions and foundation

- Review the open questions in `spec.md`.
- Create the Next.js app with TypeScript, ESLint, Tailwind, App
  Router, and `src/`.
- Place `spec.md`, `plan.md`, and `task.md` at the project root.
- Establish FOYER theme tokens from the UI Design System page.
- Create core types, mock data, service interfaces, and shared UI
  states.

**Exit criteria:** The app runs locally, routes/layout are established,
and there are no startup errors.

### Phase 1 --- Shared UI and movie discovery

- Build customer navigation/footer, MovieCard, MovieGrid, SearchBar,
  filters, pagination, and state components.
- Implement Home.
- Implement Movies Listing/Search/Filters.
- Implement Movie Details with optional content sections.

**Exit criteria:** Users can navigate from Home to listing to movie
details; search/filters and core states work with mock data.

### Phase 2 --- Theaters, showtimes, seats, and summary

- Build theater directory and theater details.
- Implement date/showtime selection.
- Implement seat map, seat legend, price zones, and wheelchair spaces
  if defined in data.
- Implement selection/deselection and price summary.
- Implement Booking Summary.
- Keep UI state separate from server-confirmed availability.

**Exit criteria:** A mock end-to-end flow reaches Booking Summary with
correct seat selection and total; invalid/unavailable seats are
rejected.

### Phase 3 --- Authentication and account

- Choose authentication strategy/provider.
- Implement login/register/logout and session-expiry behavior.
- Protect routes and enforce server-side authorization.
- Implement Profile.
- Implement My Bookings and Booking Details.
- Ensure each user can access only their own bookings.

**Exit criteria:** Forms validate, protected resources are protected
server-side, and cross-user booking access is denied.

### Phase 4 --- Booking integrity and payment

- Finalize backend/data-store/payment-provider decisions.
- Implement booking creation or seat holds as agreed.
- Add atomic server-side seat validation.
- Integrate payment and verify status server-side.
- Handle failure, cancellation, network interruption, retries, and
  duplicate requests.
- Show successful confirmation only after server verification.

**Exit criteria:** Conflicting seats cannot be confirmed; refresh/retry
does not duplicate bookings; a booking is not marked paid without server
verification.

### Phase 5 --- Admin

- Enforce admin authorization server-side.
- Implement dedicated Movies, People, Theaters/Halls, Showtimes,
  Bookings, Payments, and Customers screens according to approved
  scope.
- Validate hall/showtime conflicts.
- Add confirmation for sensitive actions and consistent operation
  feedback.

**Exit criteria:** Authorized admins can perform approved operations;
ordinary users cannot invoke admin operations through UI or API.

### Phase 6 --- QA, accessibility, and performance

- Test the complete booking flow.
- Test payment failures, duplicate requests, session expiry, and seat
  conflicts.
- Test responsive layouts and accessibility.
- Optimize poster loading and seat-map rendering.
- Check secrets and authorization boundaries.

**Exit criteria:** MVP acceptance criteria in `spec.md` pass or
remaining gaps are documented.

## 5. Data and API Plan

The PRD identifies these required capabilities but does not define exact
endpoints/schemas: - Movies: list/details/search/filter. - Theaters and
showtimes by movie/theater/date. - Seat map and availability. - Booking
creation/details/optional hold. - Payment create/confirm. - User
registration/login/profile/bookings. - Admin CRUD and operational
queries.

Before production integration, agree on: 1. API base URL and
authentication strategy. 2. Request/response schemas and error format. 3. Source of truth for ticket price, fees, and discounts. 4. Atomic seat
reservation/locking and hold expiry. 5. Payment provider verification
and booking state transitions. 6. Cancellation/refund policy. 7. Admin
roles and permissions. 8. Pagination/filter/sort rules.

Initially, use mock data in `src/data/` and service interfaces such as
`movieService`, `theaterService`, `showtimeService`, and
`bookingService`. Components should not depend directly on storage/API
implementation details.

## 6. UI Implementation Notes from the Reference PDF

- Brand shown in the design: FOYER.
- Use charcoal/near-black surfaces, light text, and orange primary
  actions.
- Extract reusable tokens for typography, spacing, borders, buttons,
  forms, icons, and statuses from the Design System page.
- Customer pages use top navigation; admin pages use a separate
  dashboard layout/sidebar.
- Home: Hero, genre chips, Now Showing, Coming Soon with dates, Our
  Cinemas.
- Movie details: Showtimes, Cast & Crew, Videos, Photos, Details, More
  Like This where content exists.
- Theater details: profile, halls, showtimes, photos.
- Seat map: price zones, wheelchair spaces, legend, and a
  server-driven hold timer only if holds are implemented.
- Login: Sign In/Create Account; preserve a hold through sign-in only
  if backend support exists.
- Checkout: only show payment methods that are actually enabled and
  supported.
- Confirmation/details: QR ticket, download/email, directions, and
  calendar actions only when implemented.
- Profile: saved payment methods must use provider tokens/references;
  never store raw card numbers or CVC.
- Admin: dedicated screens for theaters, movies, people, showtimes,
  bookings, payments, and customers.

The PDF's final pages include a Design System reference, an All Pages
index, a duplicate booking confirmation image, and an auxiliary map
capture with `403 Access blocked`. The map capture is an error/reference
artifact, not a product page. If maps are implemented, provide a
graceful fallback.

## 7. Quality Gates

- Do not move to the next phase until exit criteria pass.
- Mock payment does not prove real payment integration works.
- Hiding an Admin link does not constitute authorization.
- Client-side seat state does not guarantee availability.
- Never show successful confirmation before server verification.
- Never put payment secrets or sensitive card data in the client.
- Test empty/error/pending states, not only the happy path.

## 8. Decisions to Confirm Before Production

- Authentication provider/strategy.
- Backend ownership, database, and ORM.
- Payment provider and enabled payment methods.
- Seat hold and expiry.
- Authentication timing in the booking flow.
- Cancellation/refund policy.
- Ticket delivery and QR/e-ticket requirements.
- Maps/calendar/directions/email support.
- Final Admin permissions.
- API request/response schemas.
