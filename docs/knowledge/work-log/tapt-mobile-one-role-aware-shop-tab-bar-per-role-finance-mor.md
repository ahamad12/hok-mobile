---
date: 2026-11-10
description: 'Replaced the two-shell shop navigation (oversight vs shift) with one five-tab bar per role, each ending in More. Owners/managers: Today · Work ·…'
aliases:
  - 'tapt-mobile: one role-aware shop tab bar per role (Finance, More, page gates)'
tags:
  - decision
source_repo: tapt-mobile
---

> Migrated from the obsidian-mind vault (`inbox/tapt-mobile-one-role-aware-shop-tab-bar-per-role-finance-mor.md`) on 2026-11-16 when the `om` MCP server was retired. `[[wikilinks]]` point at vault notes and may not resolve here.

# tapt-mobile: one role-aware shop tab bar per role (Finance, More, page gates)

Replaced the two-shell shop navigation (oversight vs shift) with one five-tab bar per role, each ending in More. Owners/managers: Today · Work · Finance · Records · More. Supervisors: Shift · Till · Deliveries · Work · More. Staff: Shift · Scratch · Deliveries · Work · More. The business layer (all hoks, team & invites) now lives in the shop's More tab, and the mock Inbox is hidden. The user chose this layout in planning on 2026-11-10.

## What changed

- src/features/shops/utils/capabilities.ts - added bar ('oversight'|'supervisor'|'staff'), canViewLicenses (supervisors and up) and pages: Record<GatedPage, boolean>; canViewProfit narrowed to owner/manager
- src/features/shops/utils/shopTabs.ts - route table keyed by bars; one declaration order gives every bar's order; team/insights/home/money kept registered but hidden
- src/features/money/screens/FinanceScreen.tsx - was InsightsScreen; adds a Today section (till, day close, expenses) above profit/cash/payables/closes
- src/features/shops/screens/RecordsScreen.tsx - now stock (scratch, deliveries) plus reference; till/close/expenses moved to Finance
- src/features/shops/screens/ShopMoreScreen.tsx - role-aware: managers get This shop plus Business sections; supervisors get Scratch, Licences, Forms; staff get Forms; everyone gets Account
- src/features/shops/components/PageGate.tsx - withPageAccess(page, title, Screen) shows a lock screen; wraps edit, staff, suppliers, categories, licenses/*, and the finance/records tabs
- src/features/shops/components/QuickActions.tsx + TodayScreen - Scan/Delivery/Till entry/Task shortcuts for managers covering the counter
- app/(auth)/_layout.tsx - signed-in users now redirect to '/' so entryHref picks the landing (before, it always went to /shops)
- app/(app)/(tenant)/_layout.tsx - Inbox tab hidden (href null) and its mock badge removed; inbox.mock.ts kept


## Decisions

- Owners/managers get dashboards plus quick actions rather than operational tabs; rejected putting Scratch/Deliveries tabs on the manager bar
- The business layer moves into the shop's More instead of being a separate level that every owner must land on; the Hoks list is still the first screen with 0 or 2+ shops
- Supervisors don't see profit, even though the API allows it (business choice)
- Staff never see licences; forms stay for everyone
- The money tab is named Finance (user rejected 'Money')
- Supervisor bar has Deliveries instead of Scratch; scratch scans still start from the Shift hero (hidden tab route) and from More
- The tab is labelled Work on every bar (dropped the Work/Tasks label flip)
- Mock Inbox hidden until GET /tenant/attention exists; Today's Needs you covers each shop


## Learned

- Python in Git Bash on this machine writes CRLF while the repo files are LF; normalise with sed -i 's/\r$//' or open with newline=''
- expo-router tabs with href:null stay navigable, so links to a hidden tab (e.g. supervisor -> scratch from the Shift hero) still work, just with no tab highlighted
- om search timed out (qmd); health reported OK, so I read the vault files directly


## Verification

yarn tsc --noemit clean; yarn jest 22 suites / 133 tests passing, including updated shopTabs and capabilities tests (each role's bar, page access); eslint has no errors in the changed areas, only existing warnings. No on-device run.


## Open

- Delivery flow not built: staff/supervisors need check-in (PENDING->RECEIVED), edit lines/quantities/invoice number, and an invoice photo. tapt-api delivery.contract has none of these (only create/list/get/payments/void). It needs a schema change; check the Delivery.totalPaidCents denormalisation and the guarded updateMany rules first
- Not run on a device: bars for each role, More items and lock screens still need a visual check
- Remaining useShopRole().manages checks in pushed screens were not migrated to caps
- Supervisor reaching Scratch through the hidden tab shows no active tab


## Related

- tapt-mobile UI redesign: TAPT teal theme, shops/team/profile/settings tabs _(no note yet)_


_Recorded 2026-11-10T19:23:04.551Z from `tapt-mobile` via the om MCP server (routing: fallback)._
