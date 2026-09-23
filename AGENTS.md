# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project State

No source code exists yet. The project is in plan-only stage. The implementation plan is at `bookstore-implementation-plan.md`. All work must follow the milestones defined there.

## Stack (once scaffolded)

Vite + React 18 + TypeScript (strict) + Tailwind CSS + Redux Toolkit + React Router + Axios + localStorage. No backend, no database, no real auth, no real payments.

## Commands (after Milestone 1 scaffolding)

```
npm run dev       # dev server
npm run build     # production build — must pass with zero TS errors before milestone is complete
npm run lint      # ESLint
npx tsc --noEmit  # standalone type check
```

No test framework is planned — validation is manual + build + type-check.

## Non-Obvious Architecture Rules

- **Feature code stays inside its feature folder** — `src/features/<feature>/`. Only components used by 2+ features go in `src/components/`.
- **No direct `localStorage` calls in components** — all reads/writes go through `src/storage/storageService.ts` using keys from `src/storage/storageKeys.ts` (`bw_*` prefix).
- **Axios client exists but must NOT make fake HTTP requests** — services use mock data/localStorage directly; the Axios instance (`src/services/axiosClient.ts`) is a future-readiness stub only.
- **All localStorage data is scoped to `auth.user.id`** — orders, wishlist, address, gift points, and writers must not leak between demo user accounts.
- **Order cancellation condition** — `Date.now() < order.createdAt + 48 * 60 * 60 * 1000`, not a simple status flag.
- **Gift points awarded at `/confirmation` only** — 1% of order total, dispatched via `addGiftPoints` action on `authSlice` and persisted to `bw_gift_points`.

## Auth Gate (non-obvious scope)

`/` and `/books/:id` are **public**. Everything else is protected by `ProtectedRoute` with `state.from` preservation:

| Protected routes | `/cart`, `/payment`, `/confirmation`, `/orders`, `/orders/:id`, `/wishlist`, `/writers` |
|---|---|
| Soft-gated actions | "Add to Cart" and "Add to Wishlist" on `/books/:id` check `isAuthenticated` inline and navigate to `/login` if false |

## Design Tokens (extracted from screenshots — use these, not Tailwind defaults)

| Token | Value |
|---|---|
| Page background | `#111827` |
| Card/panel background | `#1f2937` |
| Input/border | `#374151` |
| Primary button | `bg-blue-500 hover:bg-blue-600` (`#3b82f6`) |
| Link/accent | `#60a5fa` |
| Secondary text | `#9ca3af` |

Payment and Confirmation pages use a **full-screen dark book-illustration background** — not the standard Header/sidebar layout. `BookIllustrationBackground` is a shared component used by both.

## UI References

Five reference screenshots live in `screens/`. **Always inspect the relevant screenshot before implementing its page.** Do not substitute generic e-commerce layouts.
