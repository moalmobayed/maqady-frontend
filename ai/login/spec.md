# Login

- **Route:** `/login`
- **Requirements:** [FR-09 — Authentication](../spec.md)
- **Scope:** Sign in, validation, and session creation.

## Page behavior

- Share the account-access layout with `/register`; expose route links styled
  as the **Sign in** and **Create account** tabs.
- Collect a required, valid email and a required password. Use appropriate
  autocomplete values and a show/hide password control.
- Submit credentials to the same-origin `/api/auth/sessions` route, which
  proxies to `POST /auth/sessions` on the configured Maqady API.
- On a valid response, store the access and refresh tokens in HttpOnly cookies
  using the expirations supplied by the backend. Never return token values to
  client-side JavaScript.
- When a same-origin page initiated sign-in, return there after success.
  Reject external, auth, and API routes as return destinations.
- Display a success message only after the backend has returned a valid
  session. Do not show a password-recovery control until a recovery endpoint
  and flow are available.

## Acceptance criteria

- [ ] The email and password fields are labelled and keyboard accessible.
- [ ] Invalid email and missing required values prevent form submission.
- [ ] Password visibility can be toggled without clearing the value.
- [ ] The active route tab is exposed as the current page and links to the
      corresponding auth route.
- [ ] Valid credentials are submitted to the documented session endpoint;
      rejected credentials show an error without claiming success.
- [ ] Session tokens are absent from JSON responses and stored in HttpOnly
      cookies using the backend-provided expiration times.
- [ ] Successful sign-in returns to the safe same-origin page that initiated
      authentication.
