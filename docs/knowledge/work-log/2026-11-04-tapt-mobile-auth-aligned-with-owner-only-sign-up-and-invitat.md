---
date: 2026-11-04
description: 'Moved tapt-mobile onto the new tapt-api auth surface: register signs the owner in, staff join via POST /invitations and accept from an email deep…'
aliases:
  - 'tapt-mobile auth aligned with owner-only sign-up and invitations'
tags:
  - project-note
source_repo: tapt-mobile
---

> Migrated from the obsidian-mind vault (`inbox/2026-11-04-tapt-mobile-auth-aligned-with-owner-only-sign-up-and-invitat.md`) on 2026-11-16 when the `om` MCP server was retired. `[[wikilinks]]` point at vault notes and may not resolve here.

# tapt-mobile auth aligned with owner-only sign-up and invitations

Moved tapt-mobile onto the new tapt-api auth surface: register signs the owner in, staff join via POST /invitations and accept from an email deep link, device sessions can be listed/revoked. Added a single session manager modelled on ride-pro-mobile, and basic auth/team/devices screens. Removed template demo code.

## What changed

- src/features/auth/session/sessionManager.ts - only place sessions start/end; generation counter drops late responses; single-flight teardown; best-effort server logout with 5s timeout
- src/services/httpClient.ts - refresh discards its tokens if the stored refresh token changed mid-flight
- src/features/auth/api/* - login/register/accept return AuthGrant + deviceName; invitations CRUD; sessions; shops/my for invite picker
- src/constants/ApiErrors.ts - getFieldErrors reads details.violations (strips 'body.') or bare [{field,message}]
- app/(auth)/login|register|invite, app/(tabs)/sessions, app/(tabs)/staff/index|create - basic screens on shared AuthScreen/FormField/useServerErrors
- Removed features/example, (modals), showcase, forgot-password (no backend endpoint yet)


## Decisions

- Kept the existing httpClient single-flight refresh instead of porting ride-pro's proactive expiry refresh; only added the session-changed guard
- Invite link route is app/(auth)/invite?token=; APP_LINK_BASE_URL must be set to the app scheme
- Forgot-password screen deleted until backend Phase 4 ships reset endpoints



## Verification

tsc --noEmit clean; jest 47/47 pass; eslint clean on changed folders. No device run.


## Open

- Signed-in user opening an invite link is redirected to tabs by the (auth) guard
- Password reset, email verification, Google/Apple sign-in screens wait on backend Phases 4-5
- Not run on a device/simulator against the live API



_Recorded 2026-11-04T05:39:48.308Z from `tapt-mobile` via the om MCP server (routing: fallback)._
