---
date: 2026-11-07
description: 'The user disliked v1 (teal, bordered cards, gradient headers), so tapt-mobile was redesigned as a borderless monochrome system. Near-black and white…'
aliases:
  - 'tapt-mobile borderless monochrome revamp (v2) with Plus Jakarta Sans'
tags:
  - project-note
source_repo: tapt-mobile
---

> Migrated from the obsidian-mind vault (`inbox/2026-11-07-tapt-mobile-borderless-monochrome-revamp-v2-with-plus-jakart.md`) on 2026-11-16 when the `om` MCP server was retired. `[[wikilinks]]` point at vault notes and may not resolve here.

# tapt-mobile borderless monochrome revamp (v2) with Plus Jakarta Sans

The user disliked v1 (teal, bordered cards, gradient headers), so tapt-mobile was redesigned as a borderless monochrome system. Near-black and white with a sparing emerald accent, tonal surfaces instead of strokes, filled inputs, pill buttons, and Plus Jakarta Sans. Every role now uses GET /shops/my for the shop list. It was checked visually on an Android emulator through Expo Go, in light and dark.

## What changed

- src/theme/Colors.ts: monochrome ink ramp plus an emerald accent; borders transparent except a 6–8% hairline; gradients flattened
- src/theme/Common.ts: fontFamily map per weight; new tighter type scale; pill buttons; 52px inputs; a single soft shadow; src/theme/fontState.ts falls back to the system font if loading fails
- src/hooks/useThemeFonts.ts + app/_layout.tsx: load Plus Jakarta Sans before first render; expo-system-ui window background follows the theme; React Navigation ThemeProvider imported from expo-router
- src/components: AppButton, AppInput, ListItem, ListSection, Badge, SearchBar, FloatingTabBar, ScreenHeader, EmptyState, Avatar, ConfirmSheet and AppBottomSheet restyled borderless; new IconButton and ProfileHero; GradientHeader deleted
- Screens: auth, shops, shop detail, team, invite, profile, settings and devices restyled; shop Active/Inactive filter and Deactivate removed; useMyShops enabled for every role and sorted by name; managers get Members and the invite shop picker


## Decisions

- Removed the Active/Inactive filter and Deactivate because tapt-api treats isActive=false as a soft delete and hides the shop everywhere, so 'inactive' is not a state the app can show
- fontFamily is chosen per weight because Android ignores fontWeight on custom fonts
- Confirm sheets keep a solid red destructive button, while inline destructive buttons are a soft red tint


## Learned

- Expo SDK 56+ refuses imports from @react-navigation/native at bundle time; import ThemeProvider, DarkTheme and DefaultTheme from 'expo-router' instead (tsc does not catch this)
- On an emulator with a display cutout, Expo Go letterboxes the app below the cutout, which shows as a black strip at the top. This is not an app bug, but a dev build has not been checked
- ~~The earlier reading that GET /shops/my is shadowed by /shops/:id did not hold up: the owner list loads on the running server. The manager listing gap is still real~~
  - **Corrected 2026-11-16: the shadowing was real.** In committed tapt-api (`ae53ac9`), `getById` (`/shops/:id`) came before `getMyShops` (`/shops/my`) in both `shop.controller.ts` and `shop.contract.ts`, so Nest matched `/shops/my` as `id="my"` and returned 403. The fix (reorder, plus opening `/shops/my` to MANAGER/STAFF) was written in the tapt-api working tree at 05:42Z, 13 minutes before this note. The dev server runs from source, so the owner list loading here most likely shows the fix already working (inferred; not re-checked against that server). This session couldn't see the fix because om withheld tapt-api records from tapt-mobile sessions. See `../tapt-api/docs/knowledge/work-log/2026-11-07-tapt-api-unshadow-get-shopsmy-and-make-it-role-aware.md`, which this note now agrees with; `shop.routes.spec.ts` guards the route order.


## Verification

tsc clean; jest 64/64; eslint has only the pre-existing socketSlice error. Visually checked on an Android emulator (Expo Go): shops list, shop detail, team, profile, settings, appearance sheet, invite form and wizard step 1, in both light and dark.


## Open

- ~~tapt-api: allow MANAGER and STAFF on /shops/my (proposed as a separate session, not started). Until then managers see a 'Couldn't load shops' state~~ Done in the tapt-api working tree, 2026-11-07, but not committed as of 2026-11-16: `@Roles(OWNER, MANAGER, STAFF)`, and `GetMyShopsUseCase` scopes OWNER/MANAGER by tenant and STAFF to their own active shop. Commit it, then remove any leftover mobile workarounds.
- Auth screens not checked on device, to avoid signing the user out
- Nothing committed



_Recorded 2026-11-07T05:55:54.528Z from `tapt-mobile` via the om MCP server (routing: fallback)._
