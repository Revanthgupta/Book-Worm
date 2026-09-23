# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Key Documentation Locations

- **Implementation plan** — `bookstore-implementation-plan.md` — full screen inventory, milestone breakdown, auth gate table, design tokens, redux state shape, localStorage keys, and dependency order.
- **Project rules** — `.bob/rules/bookstore-frontend.md` — authoritative rules for scope, architecture, and quality.
- **UI skill** — `.bob/skills/bookstore-ui/SKILL.md` — implementation workflow for bookstore features.
- **Review skill** — `.bob/skills/bookstore-review/SKILL.md` — review checklist for UI fidelity, accessibility, and functional correctness.
- **Screenshots** — `screens/` — five PNG reference files (`HomepageScreen`, `ProductDetailpageScreen`, `CartpageScreen`, `PaymentpageScreen`, `PaymentConfirmationpageScreen`).

## Non-Obvious Context

- The app is called **Book Worm** (not "Online Bookstore") — that's the brand name shown in every screenshot.
- Payment and Confirmation pages do **not** use the standard Header + sidebar layout — they use a full-screen dark illustrated background. Questions about those pages need to account for this different layout mode.
- The cart page embeds the delivery address form directly (not a separate `/address` route) — this was a deliberate decision matching the `CartpageScreen.png` reference.
- Six screens are **Bob-designed** (no reference screenshot): Login, My Orders, Order Detail, Wishlist, My Writers, 404. They must follow the dark design system tokens from the plan.
- The `bw_` prefix on all localStorage keys is a project convention — `bw_user`, `bw_cart`, `bw_orders`, `bw_gift_points`, `bw_wishlist`, `bw_address`, `bw_writers`, `bw_reviews`.
- There is no test framework — "testing" means `npm run build` + `npx tsc --noEmit` + manual browser walkthrough.
