# Register

- **Route:** `/register`
- **Requirements:** [FR-09 — Authentication](../spec.md)
- **Scope:** Account creation, validation, and resulting session behavior.

## Page behavior

- Share the account-access layout with `/login`; expose route links styled as
  the **Sign in** and **Create account** tabs.
- Collect a required full name, valid email, and password. Use appropriate
  autocomplete values and a show/hide password control.
- Enforce only the confirmed minimum password length of eight characters in
  the initial form. Server-side validation remains authoritative.
- Submit `fullName`, `email`, and `password` to the same-origin
  `/api/auth/registrations` route, which proxies to
  `POST /auth/registrations` on the configured Maqady API.
- On a valid response, store the access and refresh tokens in HttpOnly cookies
  using the expirations supplied by the backend. Never return token values to
  client-side JavaScript.
- Preserve the originating same-origin page through the auth tabs and return
  there after account creation. Reject external, auth, and API destinations.
- Display account-creation success only after the backend returns a valid
  session.

## Acceptance criteria

- [ ] Full name, email, and password have labels and are keyboard accessible.
- [ ] Invalid email, missing values, or a password shorter than eight
      characters prevent form submission.
- [ ] Password visibility can be toggled without clearing the value.
- [ ] The active route tab is exposed as the current page and links to the
      corresponding auth route.
- [ ] Valid details are submitted to the documented registration endpoint;
      rejected requests show an error without claiming success.
- [ ] Session tokens are absent from JSON responses and stored in HttpOnly
      cookies using the backend-provided expiration times.
- [ ] Successful account creation returns to the safe same-origin page that
      initiated authentication.
