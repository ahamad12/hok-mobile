# Mobile auth plan

Aligns tapt-mobile with the tapt-api auth changes (owner-only sign-up,
email invitations, session management, field-level errors).

## Backend surface (tapt-api `develop`)

| Route | Use in app |
| --- | --- |
| `POST /auth/register` | Creates an OWNER **and signs them in** (returns tokens). |
| `POST /auth/login` | Tokens + user. Sends `deviceName`. |
| `POST /auth/refresh` | Rotates. Reusing an old token ends the whole session, so never send two refreshes at once. |
| `POST /auth/logout`, `POST /auth/logout-all` | Sign out this device / everywhere. |
| `GET /auth/sessions`, `DELETE /auth/sessions/:id` | Device list, sign out one device. |
| `GET/PATCH /auth/profile`, `POST /auth/change-password` | Profile. Change-password signs out every device; wrong current password is 400. |
| `POST/GET /invitations`, `POST /invitations/:id/resend`, `DELETE /invitations/:id` | OWNER invites MANAGER/STAFF; MANAGER invites STAFF. |
| `POST /invitations/accept` | Invitee sets name + password from the email link, gets signed in. |

Not built server-side yet (backend Phases 4–5): password reset, email
verification, Google/Apple sign-in. The app has no screens for these until
the endpoints exist.

## Practices adopted from ride-pro-mobile

- **One session manager** (`features/auth/session/sessionManager.ts`) is the
  only place a session starts or ends. Tokens, the auth store, the socket and
  the query cache change together there.
- **Generation counter**: a refresh or profile fetch that finishes after its
  session ended is thrown away instead of resurrecting it.
- **Single-flight teardown**: concurrent sign-outs share one teardown.
- **Best-effort server revoke with a timeout**: sign-out never hangs offline.
- **Single-flight refresh** (already in `services/httpClient.ts`), plus a
  check that the session did not change while the refresh was in flight.

## App structure

- `app/(auth)`: `login`, `register`, `invite` (deep link `<scheme>://invite?token=…`).
- `app/(tabs)`: home, `profile`, `sessions`, `team` (invite + pending invitations).
- Server validation errors (`details.violations`) map onto form fields via
  `getFieldErrors()`.

## Config

Set the API's `APP_LINK_BASE_URL` to the app scheme (`tapt://`, `tapt-dev://`, …)
so invitation emails open the `invite` screen.

## Commit order

1. Remove template/demo code.
2. Core infra already in progress (env, API envelope, HTTP client, socket, hooks, tests).
3. Auth API + session manager.
4. Auth screens.
5. This plan.
