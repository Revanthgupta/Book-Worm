# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Coding Rules & Conventions

- **Storage Abstraction**: All client-side storage must route through `src/storage/storageService.ts` with typed keys from `src/storage/storageKeys.ts` (`bw_*` prefix).
- **Type Syntax**: `verbatimModuleSyntax` is enabled in `tsconfig.app.json`. Always import types using explicit `import type { ... }` syntax.
- **Route Access Matrix**:
  - Public: `/`, `/books/:id`
  - Inline Auth Gate: "Add to Cart" and "Add to Wishlist" on `/books/:id` must check auth status and navigate to `/login` with `state: { from: location }`.
  - Protected: `/cart`, `/payment`, `/confirmation`, `/orders`, `/orders/:id`, `/wishlist`, `/writers`.
- **Redux Slice Architecture**:
  - `auth` slice manages `user`, `isAuthenticated`, and `giftPoints` (persisted as `bw_gift_points` and `bw_user`).
  - `orders` selectors must always filter records by `auth.user.id`.
  - UI-only state (e.g., modals, form inputs) must remain in local React state, not Redux.
- **API & Mock Resilience**:
  - Frontend services (`src/features/*/`) consume `/api/*` via `src/services/axiosClient.ts`.
  - Payment mock fails deterministically with HTTP 402 if card number ends with `0000`.
  - Order cancellation eligibility must check `Date.now() < order.createdAt + 48 * 60 * 60 * 1000` and verify user ownership.
