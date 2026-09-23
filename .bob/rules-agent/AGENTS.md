# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Before Writing Any Code

1. Read `bookstore-implementation-plan.md` — it defines the milestone you must implement.
2. Inspect the relevant screenshot in `screens/` before touching any page component.
3. Complete the current milestone fully (zero build/TS errors) before starting the next.

## Non-Obvious Coding Rules

### Storage
- All localStorage access goes through `src/storage/storageService.ts`. Never call `localStorage.getItem/setItem` directly in a component or slice.
- Key names use the `bw_` prefix — see `src/storage/storageKeys.ts`. Adding a new persisted entity requires adding a key constant there first.
- All stored data is user-scoped: when reading/writing orders, wishlist, address, gift points — always key by `auth.user.id`.

### Auth
- `ProtectedRoute` must wrap: `/cart`, `/payment`, `/confirmation`, `/orders`, `/orders/:id`, `/wishlist`, `/writers`.
- `/books/:id` is NOT wrapped in `ProtectedRoute`. The "Add to Cart" and "Add to Wishlist" buttons check `isAuthenticated` inline and call `navigate('/login', { state: { from: location } })` when false.
- After login, redirect to `location.state?.from ?? '/'`.

### Redux Slices
- `auth` slice holds `user`, `isAuthenticated`, `giftPoints`. Do not put gift points in a separate slice.
- `orders` slice must filter by `auth.user.id` in selectors — never return all orders to all users.
- Do not put form input values, dropdown selections, or modal open/close state into Redux.

### Axios
- `src/services/axiosClient.ts` is a stub for future integration. Services must NOT make actual HTTP requests. Data comes from mock data (`src/data/mockBooks.ts`) or localStorage.

### Components
- `BookIllustrationBackground` is shared between `PaymentPage` and `ConfirmationPage` — do not duplicate it.
- `QuantityControl` is shared between `ProductDetailPage` and `CartPage` — lives in `src/components/`.
- Feature-specific components stay inside `src/features/<feature>/`. Only promote to `src/components/` when used by 2+ features.

### Order Cancellation
- The 48-hour check is: `Date.now() < order.createdAt + 48 * 60 * 60 * 1000`.
- Also check `order.userId === auth.user.id` before showing the Cancel button.

### Gift Points
- Awarded once, on first render of `ConfirmationPage`: `Math.floor(orderTotal * 0.01)` points.
- Use a flag (e.g., `order.pointsAwarded`) to prevent double-awarding on re-render.

## Validation Checklist Per Milestone

- [ ] `npm run build` — zero errors
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run lint` — no new warnings
- [ ] Walk the user journey end-to-end in browser
- [ ] Check browser console for runtime errors
