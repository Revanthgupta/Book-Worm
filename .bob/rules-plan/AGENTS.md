# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Architectural Constraints (Non-Obvious)

- **Auth Boundaries**:
  - Unauthenticated users can view `/` and `/books/:id`.
  - Transactional & personal views (`/cart`, `/payment`, `/confirmation`, `/orders`, `/orders/:id`, `/wishlist`, `/writers`) require `ProtectedRoute`.
  - Book detail page handles cart/wishlist additions through inline redirection preserving `state: { from: location }`.
- **State Partitioning**:
  - `auth` slice is the single source for `user`, `isAuthenticated`, and `giftPoints`.
  - `orders` selectors must scope queries by `auth.user.id` to prevent cross-account leakage.
  - `payment` slice remains strictly ephemeral (no localStorage sync).
- **Service Integration Layer**:
  - UI triggers feature hooks/actions, which delegate to domain services in `src/features/*/`.
  - Services use `src/services/axiosClient.ts` configured for `VITE_API_BASE_URL` with automatic Bearer token injection.
- **Shared Component Boundaries**:
  - `BookIllustrationBackground` wraps both `PaymentPage` and `ConfirmationPage`.
  - `QuantityControl` is shared across `ProductDetailPage` and `CartPage`.
  - `BookCard` is shared across catalogue, sidebar, recommendations, and wishlist.
