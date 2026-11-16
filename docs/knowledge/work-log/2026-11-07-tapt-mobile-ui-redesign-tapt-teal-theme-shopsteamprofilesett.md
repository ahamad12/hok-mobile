---
date: 2026-11-07
description: 'Redesigned tapt-mobile modelled on ride-pro-mobile''s design system (same scaffold, same token names) but with a distinct TAPT teal brand and full…'
aliases:
  - 'tapt-mobile UI redesign: TAPT teal theme, shops/team/profile/settings tabs'
tags:
  - project-note
source_repo: tapt-mobile
---

> Migrated from the obsidian-mind vault (`inbox/2026-11-07-tapt-mobile-ui-redesign-tapt-teal-theme-shopsteamprofilesett.md`) on 2026-11-16 when the `om` MCP server was retired. `[[wikilinks]]` point at vault notes and may not resolve here.

# tapt-mobile UI redesign: TAPT teal theme, shops/team/profile/settings tabs

Redesigned tapt-mobile modelled on ride-pro-mobile's design system (same scaffold, same token names) but with a distinct TAPT teal brand and full light/dark. After login the app now has four floating tabs (Shops, Team, Profile, Settings), an Airbnb-style searchable shop list, a 3-step add-shop wizard, a shop detail page, a team members/invitations screen, and devices under Settings. Auth screens got a branded gradient layout with a password checklist.

## What changed

- src/theme/Colors.ts - new palette.tapt (teal) + palette.slate ramps; LightColors/DarkColors rewritten; added isDark and gradient.header/soft tokens to ColorPallete
- app.config.js - userInterfaceStyle 'automatic' so System theme can actually go dark
- app/_layout.tsx, ThemedView - status bar follows resolved scheme via colors.isDark
- src/components - new Avatar, Badge, ListItem/ListSection/IconTile, SearchBar, SegmentedControl, EmptyState, Skeleton, GradientHeader, ScreenHeader, ConfirmSheet, OptionSheet, WizardStepIndicator; FloatingTabBar reworked (labels, filters to routes with tabBarIcon, useTabBarInset)
- app/(app)/_layout.tsx - new guarded Stack holding (tabs) plus pushed screens shop/new, shop/[id], shop/[id]/edit, invite-member, devices, change-password
- app/(app)/(tabs) - shops, team, profile, settings; old Home/sessions/staff screens removed
- src/features/shops - new feature: api (types, api, queries incl. useTeamMembers fan-out, mutations), schemas mirroring shop.contract.ts, utils (filterShops, groupTeamMembers), components (ShopCard, ShopFormFields, FormScreen)
- src/features/auth - getMyShops/useMyShops moved to shops feature; usePendingInvitations gated to OWNER/MANAGER; resend invalidates invitations; optional username on register/accept; getPasswordChecks + PasswordChecklist; device kind helper; roleLabel
- package.json - declared react-hook-form, zod, @hookform/resolvers, jest, @types/jest, axios-mock-adapter (were used but undeclared)


## Decisions

- Kept ride-pro token names so existing primitives work unchanged; replaced values only. Rejected copying ride-pro purple to keep the apps visually distinct.
- Mobile-only workarounds for API gaps instead of changing tapt-api: GET /shops/my is OWNER-only, so useMyShops is disabled for others; STAFF sees their single shop via GET /shops/:id; MANAGER sees an empty state on Shops and can invite STAFF without a shop. Team members list is assembled client-side from GET /shops/:id/staff per shop (owner only).
- Detail/form screens are pushed on a parent Stack above (tabs) so the floating tab bar does not show on them.
- Change password became its own pushed screen instead of a bottom sheet (keyboard handling is more reliable).
- Language picker left out: i18n exists but no screen uses it, so a picker would change nothing visible.
- Accept-invite screen shows a generic 'you've been invited' card: there is no endpoint to preview an invitation by token.


## Learned

- expo-router 57 has its own BottomTabBarProps; import it from 'expo-router/tabs', not @react-navigation/bottom-tabs, or the tabBar prop fails to typecheck.
- Running `yarn add` in tapt-mobile pruned packages that were present in node_modules but undeclared (@types/jest, axios-mock-adapter), breaking tsc and one test suite until they were declared.
- useServerErrors only maps field errors whose names are listed; nested shop fields are listed as 'address.city' etc.


## Verification

yarn tsc --noemit clean; yarn jest 10 suites / 64 tests passing (new tests for shop utils, shop schemas, time, device kind, initials, password checks); eslint clean apart from one pre-existing error; `npx expo export --platform android` bundles successfully. No on-device run.


## Open

- Not run on a device or emulator; visual check of every screen in light and dark, small screens and large fonts still needed.
- Backend follow-up: let MANAGERs list shops and add a team-members endpoint, then remove the workarounds.
- Pre-existing lint error in src/store/slices/socketSlice.ts (consistent-type-imports) left untouched.
- Nothing committed yet.



_Recorded 2026-11-07T04:42:48.219Z from `tapt-mobile` via the om MCP server (routing: fallback)._
