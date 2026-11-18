# Theater Details Specification

## 1. Overview

- **Route:** `/theaters/[theaterId]`
- **Purpose:** Help guests understand a cinema location, its facilities and
  operating hours, inspect its halls, and choose a valid movie showtime.
- **Audience:** Public guests and signed-in customers.
- **Related requirement:** [FR-04 — Theaters and Showtimes](../spec.md).
- **Related page:** [Theaters listing](../theaters/spec.md).
- **Visual reference:** The supplied theater-details screenshot, HTML
  reference, and PRD/PDF are layout guidance. API data is authoritative.

The page uses a dark cinematic layout with a hero cover, theater identity and
actions, an information area, halls, date-based showtimes, photos, and the
shared footer. It must not invent contact details, hours, photos, showtimes,
prices, or booking availability.

## 2. Page structure

### 2.1 Shared shell

- Use the shared Maqady header and footer.
- Keep `/theaters` active in the primary navigation.
- Provide a breadcrumb or back link to **All theaters**.
- Use one page-level `h1` containing the theater name.
- Set metadata using the theater name after the detail request succeeds.
- Use `notFound()` for an invalid numeric ID or a confirmed API not-found
  response. Use a recoverable error state for other request failures.

### 2.2 Theater hero

Render the following when supplied:

- Cover image using the large/medium asset variant, with a meaningful alt.
- A designed fallback when the cover is absent or fails to load.
- Theater name, district, city, and full address.
- Server-authoritative open state:
  - `Open now · until HH:MM`
  - `Closed · opens HH:MM`
  - `Closed now` when no next opening time is available.
- A local-time operating-hours summary from `today`.
- Actions:
  - **Get directions** when valid coordinates exist.
  - **Call box office** only when a valid phone number exists.
  - Other contact actions, such as WhatsApp or email, only when the API
    provides and validates those values.

Actions must be independent keyboard targets and must not be nested inside a
larger link.

### 2.3 Information panels

Use responsive panels for:

- **Location**
  - Full address.
  - City and district.
  - Transit information when supplied.
  - Parking information when supplied.
  - Coordinates/directions action when supplied.
- **Opening hours**
  - All seven weekly days from `weeklyHours`.
  - Highlight the current cinema date from `today`.
  - Show closed days explicitly.
  - Show `closesNextDay` when a closing time passes midnight.
  - Show `specialDates` overrides before regular weekly hours when applicable.
  - Explain the source of the displayed day as the cinema-local date from
    the server, not the browser's local date.
- **Contact**
  - Every supplied phone entry with its API label.
  - Email only when supplied.
  - Do not render empty contact rows or sample values.
- **Facilities**
  - Map known facility identifiers to human-readable labels.
  - Preserve an accessible label for unknown API facilities rather than
    silently claiming a different facility.

Missing panels should collapse independently; one missing optional field must
not remove the rest of the theater information.

### 2.4 Halls

- Display every hall returned in the theater detail response.
- Show hall name, seat count, and wheelchair seat count when supplied.
- Display a total hall count and total seat count when calculable.
- Do not imply that a hall is bookable without a selected valid showtime.
- If no halls are returned, show an explicit unavailable state rather than
  fabricated hall cards.
- Link to seat selection only from a valid, future, bookable showtime, not
  from a hall card alone.

### 2.5 Showtimes

- Use the dedicated theater showtime response:
  `GET /api/v1/theaters/{theaterId}/showtimes`.
- Render the returned cinema-local date tabs in server order.
- Show date labels that distinguish today and other dates.
- When a date is selected, group results by movie.
- Each movie row may include:
  - Poster with meaningful alt text or fallback.
  - Movie title.
  - Genres, runtime, and age rating when supplied.
  - Only showtimes returned for the selected date.
- Each showtime item must show:
  - Start time in the cinema timezone.
  - Hall name.
  - Starting price or available price summary when supplied.
  - Started/unavailable state when returned by the API.
- Past or started showtimes must not be presented as bookable.
- A showtime can link to the approved seat-selection flow only when the
  booking contract confirms it is available and provides the required
  showtime identifier.
- If a date has no movies/showtimes, show a date-specific empty state.
- If the showtime request fails while theater details succeed, keep the
  theater information visible and show a recoverable showtimes error.
- Do not show a generic “tickets available” promise based only on the
  theater's open state.

### 2.6 Photos

- Render `photos` only when the detail response supplies valid assets.
- Use the existing media/lightbox behavior when photo interaction is
  implemented.
- Preserve photo alt text and captions when supplied.
- Hide the section, or show a concise unavailable state, when there are no
  photos; do not use unrelated movie or stock images.

## 3. Confirmed API contracts

### 3.1 Theater detail

`GET /api/v1/theaters/{theaterId}` returns:

```ts
type TheaterDetails = {
  id: number;
  name: string;
  address: string;
  district: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  transitInfo: string | null;
  parkingInfo: string | null;
  email: string | null;
  phones: { label: string; number: string }[];
  facilities: string[];
  cover: ImageAsset | null;
  photos: TheaterPhoto[];
  openState: {
    isOpen: boolean;
    closesAt: string | null;
    nextOpensAt: string | null;
  };
  today: {
    cinemaDate: string;
    closed: boolean;
    opens: string | null;
    closes: string | null;
    closesNextDay: boolean;
    specialDateLabel: string | null;
  } | null;
  weeklyHours: WeeklyHours[];
  specialDates: SpecialDate[];
  hallCount: number;
  halls: TheaterHall[];
};
```

The exact `TheaterPhoto`, `WeeklyHours`, and `SpecialDate` fields must be
validated against the live response before implementation. Optional fields
remain optional at the UI boundary.

### 3.2 Theater showtimes

`GET /api/v1/theaters/{theaterId}/showtimes` returns:

```ts
type TheaterShowtimes = {
  theaterId: number;
  cinemaDate: string;
  days: {
    cinemaDate: string;
    movies: {
      movie: {
        id: number;
        title: string;
        poster: ImageAsset | null;
        genres: Genre[];
        runtimeMinutes: number;
        ageRating: string;
        releaseDate: string;
        status: "now_showing" | "coming_soon";
      };
      showtimes: TheaterShowtime[];
    }[];
  }[];
};

type TheaterShowtime = {
  id: number;
  startsAt: string;
  endsAt: string;
  cinemaDate: string;
  hall: { id: number; name: string };
  prices: {
    front: Money;
    middle: Money;
    back: Money;
  };
  fromPrice: Money;
  hasStarted: boolean;
};
```

The implementation must validate all nested fields at runtime and verify
that `theaterId` in the response matches the route parameter.

### 3.3 Data and booking authority

- The API is authoritative for cinema-local date, hours, open state, identity,
  facilities, halls, showtimes, prices, and started state.
- The browser must not calculate whether a showtime is bookable solely from
  its displayed time.
- The booking/seat-selection endpoint, authentication requirement, and
  payment behavior are not confirmed by the theater-details contract. Keep
  those as implementation decisions until their page contracts are approved.

## 4. Loading, error, and empty states

- Provide a route loading skeleton for the hero, information panels, halls,
  showtime date tabs, movie rows, and photos.
- Invalid IDs and confirmed not-found responses use the framework not-found
  page.
- Network, timeout, non-2xx, invalid JSON, and contract errors use a
  recoverable error state with retry.
- A theater-detail failure must not render a successful empty page.
- If details succeed but showtimes fail, render details and a separate
  showtimes retry state.
- Distinguish:
  - no halls,
  - no photos,
  - no showtimes on a selected date,
  - no showtimes for the theater,
  - unavailable booking for a returned showtime.

## 5. Accessibility and responsive behavior

- Use one `h1`, heading hierarchy, landmarks, and labelled sections.
- Date controls use tabs or equivalent controls with selected state conveyed
  through `aria-selected`/`aria-current` and more than color.
- All links, phone/email actions, showtime controls, and gallery controls are
  keyboard accessible with visible focus.
- Do not use status color without text such as `Open now`, `Closed`, or
  `Started`.
- Give images meaningful alt text; hide decorative images from assistive
  technology.
- Keep showtime controls large enough for touch interaction.
- Reflow hero, information panels, halls, showtimes, and photos to one column
  on narrow screens without horizontal overflow.
- Preserve the selected date and focused control when showtime content
  updates.

## 6. Acceptance criteria

1. `/theaters/[theaterId]` loads the matching theater detail response.
2. The page shows accurate identity, address, open state, hours, facilities,
   contact information, and coordinates when supplied.
3. Missing optional cover, photos, contacts, facilities, transit, or parking
   data does not break the page.
4. All returned halls are represented with accurate capacity metadata.
5. The seven-day showtime response is selectable by cinema date.
6. Showtimes are grouped by movie and display hall/time/price data returned by
   the API.
7. Started or unavailable showtimes cannot be presented as bookable.
8. A showtimes failure does not hide successfully loaded theater details.
9. Empty dates, no halls, and no photos have distinct usable states.
10. Invalid IDs and confirmed missing theaters use a not-found experience.
11. The page is usable on mobile, desktop, keyboard navigation, and screen
    readers.
12. No sample values, fabricated coordinates, fake photos, or unconfirmed
    booking promises appear in production UI.

## 7. Decisions to confirm before implementation

- Exact `photos`, `specialDates`, and weekly-hours nested contracts.
- Whether showtime date selection is URL-backed.
- Approved seat-selection route and query/identifier contract.
- Whether guests may select seats or must sign in before booking.
- Price unit formatting for API amounts such as integer EGP minor/major units.
- Whether WhatsApp, email, and box-office labels need dedicated behavior.
- Whether a map provider should be reused from the listing page or directions
  should remain an external link only.
