# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Architectural Constraints (Non-Obvious)

### Auth Gate Boundary
- Public: `/` and `/books/:id` only.
- All transactional and account routes are `ProtectedRoute`-wrapped: `/cart`, `/payment`, `/confirmation`, `/orders`, `/orders/:id`, `/wishlist`, `/writers`.
- `/books/:id` is intentionally NOT wrapped — but the Add to Cart / Add to Wishlist buttons must check `isAuthenticated` and redirect inline.
- This means M4 (Auth) must be completed before M5 (Cart) can be considered fully implemented.

### Milestone Dependency (strictly linear after M3)
```
M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9 → M10
```
M4 is not parallel to M5 — auth gates are required on `/cart` which is M5's page.

### Redux Slice Ownership
- `giftPoints` lives on the `auth` slice (not a standalone slice).
- `orders` selector must filter by `auth.user.id` — no global "all orders" selector exposed to UI.
- `payment` slice is ephemeral (no localStorage) — it only holds `selectedMethod`, `status`, and `lastConfirmedOrderId`.

### Storage Architecture
- A single `src/storage/storageService.ts` module is the only permitted access point for localStorage.
- All keys are declared as constants in `src/storage/storageKeys.ts`.
- Data is user-scoped: stored/retrieved by `auth.user.id` to prevent cross-account leakage in the demo.

### Axios Layer
- `src/services/axiosClient.ts` is a future-ready stub — it must NOT make real HTTP calls in the current milestone.
- The layered call chain `UI → Hook → Redux/Service → Axios → Backend` must be maintainable but the Axios→Backend step is a no-op for now.

### Shared Component Boundaries
- `BookIllustrationBackground` — shared by `PaymentPage` + `ConfirmationPage`. Must not be duplicated.
- `QuantityControl` — shared by `ProductDetailPage` + `CartPage`. Lives in `src/components/`.
- `BookCard` — shared across Homepage, ProductDetail sidebar, Cart, Confirmation, Wishlist, Orders. Lives in `src/components/` with a size/variant prop.

### Design System Constraint
- The color palette is fixed (extracted from screenshots). Do not use Tailwind's default palette for primary surfaces — use the custom tokens: `bg-gray-900` (`#111827`), `bg-gray-800` (`#1f2937`), `bg-gray-700` (`#374151`), `text-blue-400` (`#60a5fa`), `bg-blue-500` (`#3b82f6`).
- Payment and Confirmation pages break the standard layout — planning any feature that touches these pages must account for the `BookIllustrationBackground` wrapper pattern.

### Out of Scope (Hard Constraints)
Do not plan for: Java backend, PostgreSQL, real authentication (OAuth/JWT), real payment processing, deployment infrastructure, or any cloud services.
