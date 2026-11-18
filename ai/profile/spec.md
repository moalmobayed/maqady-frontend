# User Profile

- **Route:** `/profile`
- **Requirements:** [FR-11 — User Profile](../spec.md)
- **Scope:** Display the authenticated customer's account details.

## Confirmed data contract

- Read the current customer from `GET /me` on the configured Maqady API,
  using the server-held access token as a bearer token.
- The response contains the customer ID, full name, email, phone,
  verification state, and member-since timestamp.
- Do not substitute sample values when the service is unavailable or the
  response is invalid. If the session is missing or expired, offer sign-in
  and preserve `/profile` as the safe return destination.

## Unavailable actions

- Profile updates, password changes, and saved payment methods are not
  connected because their API contracts are not available.
- Sign out clears the local access and refresh cookies. Server-side token
  revocation is not connected because no logout API contract is available.
- Show profile fields read-only and clearly identify unavailable features.
- Do not render example card numbers or store card details.

## Acceptance criteria

- [ ] When the session cookie is present, the header shows a Profile link to
      `/profile`.
- [ ] Sidebar links are stacked vertically on desktop with single-line labels
      and status badges.
- [ ] An authenticated customer sees only profile fields returned by `GET /me`.
- [ ] Sign out clears both auth cookies and redirects home with a confirmation
      toast.
- [ ] Missing/expired sessions show a sign-in action that returns to `/profile`.
- [ ] API failures and invalid data show an error state, not fabricated profile
      data.
- [ ] Unsupported editing, password, and payment-card actions are not presented
      as functional; no server-side token revocation is claimed.
