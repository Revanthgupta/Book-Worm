# Online Bookstore Frontend — Implementation Plan

## Top-Level Overview

Build the complete frontend of the **Book Worm** Online Bookstore capstone application using React 18, TypeScript, Tailwind CSS, Redux Toolkit, React Router, Axios, and localStorage.

The application has a dark-themed design system (near-black background `#1a1a2e` / `#0f0f1a`, white text, blue accent `#3b82f6`, amber/orange highlights). All five supplied screenshots have been inspected and analysed. The plan covers every capstone-required screen, identifies which are directly covered by the supplied references and which Bob must design, and divides work into nine independently-runnable milestones.

**Scope boundary:** Frontend only. No Java backend, no database, no real auth, no real payments. Mock data + localStorage throughout.

---

## Design System — Extracted from Screenshots

| Token | Value |
|---|---|
| Background (primary) | `#111827` (very dark navy/black) |
| Background (card/panel) | `#1f2937` (dark grey) |
| Background (sidebar) | `#111827` |
| Text (primary) | `#ffffff` |
| Text (secondary) | `#9ca3af` |
| Accent (blue) | `#3b82f6` |
| Accent (amber/gold) | `#f59e0b` |
| Accent (link) | `#60a5fa` |
| Danger/remove | `#ef4444` |
| Border | `#374151` |
| Input background | `#374151` |
| Button primary | `#3b82f6` hover `#2563eb` |
| Font | System sans-serif stack |
| Category sidebar width | `~180px` |
| Header height | `~56px` |

---

## Screen Inventory

### A. Supplied Reference Screens

| # | Screen | Route | Screenshot |
|---|---|---|---|
| 1 | Homepage / Catalogue | `/` | `HomepageScreen.png` |
| 2 | Product Detail | `/books/:id` | `ProductDetailpageScreen.png` |
| 3 | Shopping Cart + Address | `/cart` | `CartpageScreen.png` |
| 4 | Payment | `/payment` | `PaymentpageScreen.png` |
| 5 | Payment Confirmation | `/confirmation` | `PaymentConfirmationpageScreen.png` |

### B. Additional Screens — Bob Designs

| # | Screen | Route | Capstone Requirement | Rationale |
|---|---|---|---|---|
| 6 | Login / Authentication | `/login` | Login/User Authentication | Required before any transactional or account feature |
| 7 | My Orders (Order History) | `/orders` | Order history, Buy Again, Cancellation | Header nav "My Orders" links here |
| 8 | Order Detail | `/orders/:id` | Order cancellation within 48h, Buy Again | Needed for individual order actions |
| 9 | Wishlist | `/wishlist` | Browse books, My Wishlist nav item | Header nav "My Wishlist" links here |
| 10 | My Writers (Author Follow) | `/writers` | Browse brands/authors | Header nav "My Writers" links here |
| 11 | 404 / Not Found | `*` | Routing completeness | Good UX practice |

> **Login** is a dedicated `/login` page using the same dark visual language as Payment/Confirmation.
> **Authentication is required** for every transactional or account-level feature: `/cart` (address entry), `/payment`, `/confirmation`, `/orders`, `/orders/:id`, `/wishlist`, `/writers`, and gift points access. The Homepage (`/`) and Product Detail (`/books/:id`) remain publicly browsable.
> **My Orders**, **Order Detail**, **Wishlist**, and **My Writers** reuse the same Header/layout and BookCard/OrderCard components.

---

## Architecture

```
src/
├── components/           # Global reusable UI
│   ├── Header/
│   ├── Footer/
│   ├── BookCard/
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   ├── Spinner/
│   ├── ErrorMessage/
│   ├── Breadcrumb/
│   ├── QuantityControl/
│   ├── StarRating/
│   └── Pagination/
├── hooks/                # Shared custom hooks
├── utils/                # Helpers, formatters
├── features/
│   ├── authentication/
│   │   ├── authSlice.ts
│   │   ├── LoginModal.tsx
│   │   └── authService.ts
│   ├── books/
│   │   ├── booksSlice.ts
│   │   ├── BookGrid.tsx
│   │   ├── CategorySidebar.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterBar.tsx
│   │   ├── RelatedBooks.tsx
│   │   ├── ReviewSection.tsx
│   │   ├── WriterProfile.tsx
│   │   └── booksService.ts
│   ├── cart/
│   │   ├── cartSlice.ts
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   ├── AddressForm.tsx
│   │   └── cartService.ts
│   ├── orders/
│   │   ├── ordersSlice.ts
│   │   ├── OrderCard.tsx
│   │   ├── OrderDetail.tsx
│   │   └── ordersService.ts
│   └── payment/
│       ├── paymentSlice.ts
│       ├── PaymentMethodSelector.tsx
│       ├── CreditCardForm.tsx
│       ├── GiftPointsRedemption.tsx
│       └── paymentService.ts
├── pages/
│   ├── HomePage.tsx
│   ├── ProductDetailPage.tsx
│   ├── CartPage.tsx
│   ├── PaymentPage.tsx
│   ├── ConfirmationPage.tsx
│   ├── OrdersPage.tsx
│   ├── OrderDetailPage.tsx
│   ├── WishlistPage.tsx
│   ├── WritersPage.tsx
│   └── NotFoundPage.tsx
├── store/
│   ├── index.ts
│   └── rootReducer.ts
├── services/
│   └── axiosClient.ts
├── storage/
│   ├── storageKeys.ts
│   └── storageService.ts
├── types/
│   ├── book.ts
│   ├── user.ts
│   ├── cart.ts
│   ├── order.ts
│   └── payment.ts
├── data/
│   └── mockBooks.ts       # Mock data
├── App.tsx
└── main.tsx
```

---

## Redux State Shape

| Slice | State Fields |
|---|---|
| `auth` | `user`, `isAuthenticated`, `giftPoints` |
| `books` | `catalogue`, `filters`, `selectedCategory`, `searchQuery`, `loading`, `error` |
| `cart` | `items[]`, `couponCode`, `discount` |
| `orders` | `orders[]`, `loading`, `error` |
| `payment` | `selectedMethod`, `status`, `lastConfirmedOrderId` |

---

## localStorage Keys

| Key | Content |
|---|---|
| `bw_user` | Authenticated user object |
| `bw_cart` | Cart items array |
| `bw_orders` | Orders array |
| `bw_gift_points` | Gift points balance |
| `bw_wishlist` | Wishlist book IDs |
| `bw_address` | Saved delivery address |

---

## Milestones

---

### Milestone 1 — Project Foundation

**Intent:** Bootstrap the Vite + React 18 + TypeScript project, configure Tailwind CSS, set up Redux store, Axios client, localStorage abstraction, routing scaffold, and shared global components.

**Expected Outcomes:**
- `npm run dev` serves the app on localhost
- Tailwind dark theme classes work
- Redux DevTools show empty slices
- React Router renders a placeholder for each route
- Header renders with Book Worm logo, nav links, cart icon, user icon

**Todo List:**
1. Scaffold Vite project: `npm create vite@latest bookstore -- --template react-ts`
2. Install dependencies: `react-router-dom`, `@reduxjs/toolkit`, `react-redux`, `axios`, `tailwindcss`, `postcss`, `autoprefixer`
3. Configure `tailwind.config.js` with dark mode (`class`), content paths, custom color tokens matching the design system
4. Configure `postcss.config.js`
5. Create `src/index.css` with Tailwind directives and base dark background
6. Create `src/store/index.ts` — configure Redux store
7. Create `src/store/rootReducer.ts` — combine all slices (placeholders initially)
8. Create `src/services/axiosClient.ts` — Axios instance with baseURL env var, request/response interceptors (auth token, error logging)
9. Create `src/storage/storageKeys.ts` — all `bw_*` constants
10. Create `src/storage/storageService.ts` — typed `get`, `set`, `remove` wrappers
11. Create route scaffold in `src/App.tsx` using `<BrowserRouter>` and `<Routes>`
12. Create placeholder page components in `src/pages/`
13. Implement `src/components/Header/` — Book Worm logo, My Orders / My Wishlist / My Writers nav, cart icon with badge, user icon
14. Implement `src/components/Footer/` — minimal footer
15. Implement `src/components/Spinner/` and `src/components/ErrorMessage/`
16. Wrap `main.tsx` with `<Provider store={store}>` and `<BrowserRouter>`

**Relevant Context:** Header extracted from all five screenshots — same dark nav bar, "Book Worm" brand left, three nav links centre, cart + user icons right.

**Status:** [x] complete — `npm run build` and `npx tsc --noEmit` pass with zero errors.

---

### Milestone 2 — Homepage and Catalogue

**Intent:** Implement the Homepage (reference: `HomepageScreen.png`) including the left-hand category sidebar, top search/filter bar, and the three book section rows (Recommended for You, Bestsellers this Month, New Launches).

**Expected Outcomes:**
- Category sidebar renders all categories with active highlight
- Search bar filters books by title/author
- Language, Format, Price Range, Sort dropdowns function
- Three sections render from mock data
- BookCard shows cover image, title, author, format, categories (as links), price, delivery date
- Clicking a category filters the visible books
- Clicking a book navigates to `/books/:id`

**Todo List:**
1. Create `src/data/mockBooks.ts` — 20–30 mock books with all required fields
2. Create TypeScript types in `src/types/book.ts` — `Book`, `Category`, `BookFormat`, `Author`
3. Create `src/features/books/booksSlice.ts` — catalogue, filters, selectedCategory, searchQuery state
4. Create `src/features/books/CategorySidebar.tsx` — dark left sidebar, "All" + named categories, active item highlight
5. Create `src/features/books/SearchBar.tsx` — search input with magnifier icon matching screenshot
6. Create `src/features/books/FilterBar.tsx` — Language, Format, Price Range, Sort dropdowns
7. Create `src/components/BookCard/` — card matching screenshot: cover left, title/author/description/format/categories/price/delivery right
8. Create `src/features/books/BookGrid.tsx` — horizontal scrollable or wrapped row of BookCards
9. Create `src/pages/HomePage.tsx` — compose sidebar + filter bar + three labelled sections
10. Wire category sidebar clicks → Redux `selectedCategory` → filter displayed books
11. Wire search bar input → Redux `searchQuery` → filter displayed books
12. Wire filter dropdowns → Redux `filters` → sort/filter books

**Relevant Context:** Screenshot shows categories: All, Romance, Mystery, Science Fiction, Fantasy, Historical, Biography, Self-help, Memoir, Travel, Cooking, Children's, Young Adult, Comics & Graphic Novels, Poetry, Drama, Science, Philosophy, Religion, Language Learning.

**Status:** [x] complete — `npm run build` and `npx tsc --noEmit` pass with zero errors.

---

### Milestone 3 — Product Detail Page

**Intent:** Implement the Product Detail page (reference: `ProductDetailpageScreen.png`) including breadcrumb navigation, dual book cover display, book metadata, Add to Cart / Add to Wishlist buttons, language/rating/sells info row, About the Writer section, Reviews section, and Related Reads sidebar.

**Expected Outcomes:**
- Breadcrumb shows Home / Category / Sub-category
- Left panel shows front and back cover with synopsis preview
- Right panel shows title, author (linked), publisher, format, categories, price, delivery date
- "Add to Cart" adds to Redux cart and localStorage
- "Add to Wishlist" adds to Redux wishlist/localStorage
- About the Writer section with author photo and bio
- Review form: textarea (0/100 counter), star rating selector, Submit button
- Existing reviews listed below
- Related Reads sidebar (right column) with 3 RelatedBookCard entries
- Navigating to a related read loads that book's detail page

**Todo List:**
1. Create `src/pages/ProductDetailPage.tsx` — layout: breadcrumb, main content (two-col on desktop), related sidebar
2. Create `src/components/Breadcrumb/` — Home / Category / Sub-category links
3. Implement book cover dual-panel display (front + back/synopsis)
4. Implement book metadata section (right of covers)
5. Create `src/components/QuantityControl/` — minus/plus spinner (used in cart too)
6. Implement "Add to Cart" → dispatch to `cartSlice`
7. Implement "Add to Wishlist" → dispatch to `wishlistSlice` or local storage
8. Implement language/rating/sells info row with `StarRating` component
9. Create `src/components/StarRating/` — interactive (for input) and static (for display)
10. Create `src/features/books/WriterProfile.tsx` — author photo, name, bio
11. Create `src/features/books/ReviewSection.tsx` — review textarea with char counter, star picker, submit, review list
12. Create `src/features/books/RelatedBooks.tsx` — right sidebar with 3 compact BookCards
13. Connect `useParams` → look up book in Redux catalogue → render

**Relevant Context:** Product Detail screenshot shows two-column layout. Left is wide (covers+synopsis). Right is narrower (metadata+actions). Far right is a fixed-width sidebar (`~280px`) for Related Reads. Below main cols: About the Writer, Reviews.

**Status:** [x] complete — `npm run build` and `npx tsc --noEmit` pass with zero errors.

---

### Milestone 4 — Authentication

**Intent:** Implement a dedicated `/login` page and `ProtectedRoute` guard. Authentication is required before any transactional or account-level feature. Public pages (Homepage, Product Detail) remain browsable without login.

**Auth-gated routes (full list):**
- `/cart` — address entry requires knowing who the customer is
- `/payment` — payment requires an authenticated session
- `/confirmation` — confirmation belongs to an authenticated order
- `/orders` — order history is per-user
- `/orders/:id` — order detail is per-user
- `/wishlist` — wishlist is per-user
- `/writers` — followed authors are per-user
- Gift points display and redemption — per-user balance

**Public routes (no auth required):**
- `/` — Homepage / Catalogue
- `/books/:id` — Product Detail (Add to Cart / Add to Wishlist prompt login if not authenticated)

**Expected Outcomes:**
- Navigating to `/login` (or clicking the user icon when unauthenticated) renders the Login page
- Login page: centred card with Book Worm branding, email + password fields, "Login" button
- Mock credential validation — any non-empty email/password succeeds for demo
- Authenticated user stored in Redux `auth` slice and `bw_user` localStorage
- User icon shows initials/avatar when logged in; clicking it shows a dropdown with "My Profile" and "Logout"
- Logout clears session and redirects to `/login`
- All auth-gated routes redirect to `/login` (with `state.from`) when unauthenticated
- After login, user is redirected back to the originally requested page (or `/`)
- "Add to Cart" and "Add to Wishlist" on Product Detail redirect to `/login` when unauthenticated

**Todo List:**
1. Create `src/types/user.ts` — `User`, `AuthState` types
2. Create `src/features/authentication/authSlice.ts` — `user`, `isAuthenticated`, `giftPoints`
3. Create `src/features/authentication/authService.ts` — mock login/logout, localStorage persistence
4. Create `src/pages/LoginPage.tsx` — full dedicated page with dark background, centred login card (email, password, Login button)
5. Update React Router — add `/login` route (public)
6. Update Header user icon — when authenticated show avatar/initials + dropdown; when unauthenticated navigate to `/login`
7. Implement `ProtectedRoute` component — redirects unauthenticated users to `/login` with `state.from` preserved
8. Apply `ProtectedRoute` to: `/cart`, `/payment`, `/confirmation`, `/orders`, `/orders/:id`, `/wishlist`, `/writers`
9. On ProductDetailPage: "Add to Cart" and "Add to Wishlist" buttons check `isAuthenticated` — if false, navigate to `/login` with `state.from = /books/:id`
10. Rehydrate auth state from `bw_user` on app start

**Relevant Context:** No login screenshot supplied — Bob designs the page using the established dark colour tokens (`#111827` background, `#1f2937` card, white text, blue button). The centred card layout is consistent with the floating panels on Payment and Confirmation pages.

**Status:** [x] complete — `npm run build` and `npx tsc --noEmit` pass with zero errors.

---

### Milestone 5 — Shopping Cart and Address

**Intent:** Implement the Shopping Cart page (reference: `CartpageScreen.png`) — auth-gated. Includes cart item list with quantity controls, delivery address form with "Use Saved Address" toggle, and the Grand Total summary panel with coupon application.

**Expected Outcomes:**
- Route `/cart` is protected — unauthenticated users are redirected to `/login`
- Cart items list with cover, title, author, format, categories, price, delivery date, quantity +/−
- Address form: First Name, Last Name, Address, e-mail, City, Pin, Phone (with country code +91), State, Country (India default)
- "Use Saved Address" checkbox pre-fills from `bw_address` localStorage (scoped to authenticated user)
- Grand Total panel: price subtotal, tax (12%), delivery (Free), coupon Apply button, discount line, Total Amount
- "Pay Now" button validates address and navigates to `/payment`
- Empty cart shows empty state message with "Browse Books" link

**Todo List:**
1. Create `src/types/cart.ts` — `CartItem`, `CartState`, `Address` types
2. Create `src/features/cart/cartSlice.ts` — items, coupon, discount, address
3. Create `src/features/cart/CartItem.tsx` — single cart item row matching screenshot
4. Create `src/components/QuantityControl/` (if not done in M3) — reusable +/− control
5. Create `src/features/cart/AddressForm.tsx` — full address form with "Use Saved Address"
6. Create `src/features/cart/CartSummary.tsx` — Grand Total panel with coupon input
7. Persist cart to `bw_cart` localStorage on every change
8. Persist address to `bw_address` localStorage on save
9. Create `src/pages/CartPage.tsx` — compose CartItem list + AddressForm + CartSummary
10. Wire "Pay Now" → validate address → navigate to `/payment`

**Relevant Context:** CartpageScreen shows the address form inside the cart page (not a separate page). The Grand Total panel is a right-aligned card with a book-illustration image at the top of the card.

**Status:** [ ] pending

---

### Milestone 6 — Payment

**Intent:** Implement the Payment page (reference: `PaymentpageScreen.png`) — auth-gated. Dark book-illustration full-screen background with a centred payment modal panel. Supports Credit Card, Debit Card, UPI, and Wallet payment method tabs.

**Expected Outcomes:**
- Route `/payment` is protected — unauthenticated users are redirected to `/login`
- Full-screen dark book-illustration background (matching screenshot)
- Centred modal panel: "Complete Payment" title, "Payable Amount: ₹XXX" right-aligned
- Left tab selector: Credit Card (active), Debit card, UPI, Wallet
- Credit Card / Debit Card form: Card Number, Name on Card, CVV, Date of Expiry
- UPI form: UPI ID input
- Wallet form: wallet selection
- Gift points redemption row — only visible to authenticated users with a positive balance; shows "Redeem Gift Points (₹XX available)", apply button deducts from payable amount
- "Pay Now" button → mock payment processing → navigate to `/confirmation`
- Store completed order (linked to authenticated user ID) in Redux `orders` slice and `bw_orders` localStorage

**Todo List:**
1. Create `src/types/payment.ts` — `PaymentMethod`, `PaymentState`, `OrderSummary`
2. Create `src/features/payment/paymentSlice.ts` — selectedMethod, status, lastConfirmedOrderId
3. Create `src/features/payment/PaymentMethodSelector.tsx` — left tab list
4. Create `src/features/payment/CreditCardForm.tsx` — card number, name, CVV, expiry fields
5. Create `src/features/payment/GiftPointsRedemption.tsx` — show points balance, apply button
6. Create `src/pages/PaymentPage.tsx` — full-screen background + centred modal + method selector + form
7. On "Pay Now": create order object, dispatch to `ordersSlice`, persist to `bw_orders`, clear cart, navigate to `/confirmation`
8. Read payable amount from cart Redux state

**Relevant Context:** PaymentpageScreen uses the same dark blue book-illustration background as ConfirmationpageScreen. These two pages share a background component. Payment modal is NOT full page — it floats centred over the background.

**Status:** [x] complete — `npm run build`, `npx tsc --noEmit`, and `npm run lint` pass with zero errors/warnings.

---

### Milestone 7 — Payment Confirmation

**Intent:** Implement the Payment Confirmation page (reference: `PaymentConfirmationpageScreen.png`) — auth-gated. Same book-illustration background, centred panel with green checkmark, success message, purchased book list, gift points awarded, "Continue your Shopping" button.

**Expected Outcomes:**
- Route `/confirmation` is protected — unauthenticated users are redirected to `/login`
- Same dark book-illustration background as Payment page
- Centred modal panel: green checkmark icon, "Your purchase of the following reads is successful"
- List of purchased books (cover thumbnail, title, author, format, categories, price, delivery date)
- Gift points awarded on confirmation: 1% of total order value added to `auth.giftPoints` and `bw_gift_points` localStorage
- "Continue your Shopping" button → navigates to `/`
- Confirmation reads from the last confirmed order in Redux (scoped to authenticated user)
- Direct navigation to `/confirmation` with no pending order → redirect to `/`

**Todo List:**
1. Create `src/pages/ConfirmationPage.tsx` — reuse `BookIllustrationBackground` component from M6
2. Implement green checkmark icon (SVG or Heroicons)
3. Read `lastConfirmedOrderId` from Redux → find order items → render purchased book list
4. Award gift points: dispatch `addGiftPoints` to `authSlice`, persist to `bw_gift_points` localStorage
5. Implement "Continue your Shopping" button → navigate to `/`
6. Handle edge case: direct navigation to `/confirmation` with no pending order → redirect to `/`

**Relevant Context:** ConfirmationpageScreen book items show mini BookCard layout (smaller cover, title, author, format, category links, price, delivery). Same card style as CartpageScreen items.

**Status:** [x] complete — `npm run build`, `npx tsc --noEmit`, and `npm run lint` pass with zero errors/warnings.

---

### Milestone 8 — Order History, Order Detail, Buy Again, Recommendations, Wishlist, Writers

**Intent:** Implement all additional screens that complete the capstone user journey — all auth-gated. These are Bob-designed screens following the established visual language.

**Expected Outcomes:**
- All routes (`/orders`, `/orders/:id`, `/wishlist`, `/writers`) are protected — unauthenticated users redirected to `/login`
- `/orders` — My Orders page: list of past orders for the authenticated user; order number, date, total, status badge, "View Details" and "Buy Again" actions
- `/orders/:id` — Order Detail page: order metadata, book list, "Cancel Order" button (only if within 48 hours of order creation AND order belongs to authenticated user), "Buy Again" button
- "Cancel Order" dispatches cancel action → updates order status to "Cancelled" in Redux + `bw_orders` localStorage
- "Buy Again" (already auth-gated) adds all order items to cart → navigates to `/cart`
- Gift points balance displayed in Header dropdown for authenticated users (earned from M7 confirmation)
- `/wishlist` — My Wishlist page: grid of saved books for authenticated user; "Add to Cart" and "Remove from Wishlist" actions
- `/writers` — My Writers page: followed authors list with their books; "Follow/Unfollow" toggle
- Recommendation section on Homepage: "Recommended for You" uses authenticated user's order history categories; falls back to featured/popular books for unauthenticated users

**Todo List:**
1. Create `src/types/order.ts` — `Order`, `OrderItem`, `OrderStatus` types
2. Create `src/features/orders/ordersSlice.ts` — orders array, cancel action, buy-again action; all filtered by `auth.user.id`
3. Create `src/features/orders/OrderCard.tsx` — order summary card for list view
4. Create `src/pages/OrdersPage.tsx` — list of OrderCards, empty state (wrapped in ProtectedRoute)
5. Create `src/pages/OrderDetailPage.tsx` — order metadata, book list, Cancel/Buy Again buttons, 48h + ownership check
6. Implement 48-hour cancellation: `Date.now() < order.createdAt + 48 * 60 * 60 * 1000`
7. Implement Buy Again: dispatch all order items to `cartSlice` → navigate to `/cart`
8. Create `src/types/wishlist.ts` — `WishlistState`
9. Add wishlist state to Redux + `bw_wishlist` localStorage (scoped to user ID)
10. Create `src/pages/WishlistPage.tsx` — grid of wishlist BookCards (wrapped in ProtectedRoute)
11. Create `src/pages/WritersPage.tsx` — followed authors with Follow/Unfollow (wrapped in ProtectedRoute)
12. Display gift points balance in Header user dropdown (read from `auth.giftPoints`)
13. Update `booksSlice` recommendation logic — when authenticated, filter by user's past order categories

**Relevant Context:** "My Orders", "My Wishlist", "My Writers" all appear in the Header nav of every supplied screenshot, confirming these are core navigation destinations.

**Status:** [x] complete — `npm run build`, `npx tsc --noEmit`, and `npm run lint` pass with zero errors/warnings.

---

### Milestone 9 — Responsive Design, Accessibility, Validation, and UI Consistency

**Intent:** Apply responsive breakpoints across all pages, audit accessibility (ARIA labels, keyboard navigation, contrast), add form validation with inline error messages, and ensure UI consistency.

**Expected Outcomes:**
- All pages usable at mobile (375px), tablet (768px), and desktop (1280px)
- Sidebar collapses to a dropdown/drawer on mobile
- Header nav collapses to hamburger on mobile
- All form fields show inline validation errors
- Loading spinners on async operations
- Empty state components for empty cart, empty orders, empty wishlist
- All interactive elements accessible via keyboard
- ARIA roles on navigation, modals, and cart count badge
- No obvious Tailwind class conflicts or visual regressions

**Todo List:**
1. Audit all page layouts for mobile responsiveness — add `sm:`, `md:`, `lg:` breakpoints
2. Implement mobile sidebar drawer for category navigation on HomePage
3. Implement mobile hamburger menu in Header
4. Add form validation to: AddressForm, LoginPage, ReviewSection, CreditCardForm
5. Add inline error messages below invalid fields
6. Add ARIA labels to: Header icons, modal close buttons, cart badge, navigation
7. Add `role="status"` to loading spinners
8. Implement empty states: EmptyCart, EmptyOrders, EmptyWishlist components
9. Run `npm run build` and resolve all TypeScript errors
10. Run `npm run lint` and resolve lint warnings
11. Manual review: walk entire user journey from Login → Home → Product → Cart → Payment → Confirmation → Orders

**Status:** [x] complete — `npm run build`, `npx tsc --noEmit`, and `npm run lint` pass with zero errors/warnings.

---

### Milestone 10 — Final Review and Cleanup

**Intent:** Final pass to align pixel-level UI details with screenshots, clean up dead code, ensure all imports resolve, and confirm the application is demo-ready.

**Expected Outcomes:**
- All supplied screenshots match the implemented screens closely
- No unused imports or components
- All TypeScript strict errors resolved
- Console free of errors and warnings
- Application deployable with `npm run build`

**Todo List:**
1. Side-by-side review of each implemented page against its reference screenshot
2. Fix any spacing, typography, or color discrepancies
3. Remove all `TODO` and `FIXME` comments
4. Remove any dead/unused code
5. Verify all routes navigate correctly
6. Verify localStorage persistence across browser refreshes
7. Verify cart badge updates on add/remove
8. Verify order cancellation 48h window logic
9. Run final `npm run build` — zero errors

**Status:** [ ] pending

---

## Page-by-Page Specification

### Page 1 — Homepage (`/`)
- **Reference:** `HomepageScreen.png` ✅
- **Purpose:** Entry point; browse catalogue by category, search, filter, and discover books
- **Layout:** Header | Left sidebar (categories) | Main area (filter bar + 3 book sections)
- **Components:** `Header`, `CategorySidebar`, `SearchBar`, `FilterBar`, `BookGrid` ×3, `BookCard`, `Footer`
- **Redux:** `books.catalogue`, `books.selectedCategory`, `books.searchQuery`, `books.filters`
- **localStorage:** none directly (catalogue is mock data)
- **Interactions:** Click category → filter, type search → filter, change dropdowns → sort/filter, click book card → navigate to `/books/:id`
- **Responsive:** Sidebar collapses to drawer at mobile; cards wrap to 1 column

### Page 2 — Product Detail (`/books/:id`)
- **Reference:** `ProductDetailpageScreen.png` ✅
- **Purpose:** Display full book information, enable Add to Cart / Add to Wishlist, show related reads
- **Auth:** Public — browsable without login. "Add to Cart" and "Add to Wishlist" redirect to `/login` if unauthenticated.
- **Layout:** Header | Breadcrumb | Main (covers + metadata) | About Writer | Reviews | Right sidebar (Related Reads) | Footer
- **Components:** `Header`, `Breadcrumb`, `StarRating`, `QuantityControl`, `WriterProfile`, `ReviewSection`, `RelatedBooks`, `BookCard` (compact)
- **Redux:** `books.catalogue` (lookup), `cart.items` (add), `auth.isAuthenticated` (gate)
- **localStorage:** `bw_cart`, `bw_wishlist`
- **Interactions:** Add to Cart (auth-gated), Add to Wishlist (auth-gated), submit review, click related book, click category/author links

### Page 3 — Shopping Cart (`/cart`)
- **Reference:** `CartpageScreen.png` ✅
- **Purpose:** Review cart, enter delivery address, see total, proceed to payment
- **Auth:** 🔒 Protected — redirects to `/login` if unauthenticated
- **Layout:** Header | Breadcrumb | Cart items grid | Address form | Grand Total panel | Footer
- **Components:** `Header`, `Breadcrumb`, `CartItem`, `QuantityControl`, `AddressForm`, `CartSummary`
- **Redux:** `cart.items`, `cart.coupon`, `cart.discount`, `auth.user` (for saved address lookup)
- **localStorage:** `bw_cart`, `bw_address`
- **Interactions:** +/− quantity, remove item, fill address, "Use Saved Address", apply coupon, "Pay Now"

### Page 4 — Payment (`/payment`)
- **Reference:** `PaymentpageScreen.png` ✅
- **Purpose:** Select payment method and complete mock payment
- **Auth:** 🔒 Protected — redirects to `/login` if unauthenticated
- **Layout:** Full-screen book-illustration background | Centred modal panel
- **Components:** `BookIllustrationBackground`, `PaymentMethodSelector`, `CreditCardForm`, `GiftPointsRedemption`
- **Redux:** `payment.selectedMethod`, `cart` (total), `auth.giftPoints`, `auth.isAuthenticated`
- **localStorage:** none directly
- **Interactions:** Tab between payment methods, fill card form, redeem gift points (only if authenticated and balance > 0), "Pay Now"

### Page 5 — Payment Confirmation (`/confirmation`)
- **Reference:** `PaymentConfirmationpageScreen.png` ✅
- **Purpose:** Confirm successful purchase, show purchased books, award gift points, invite continued shopping
- **Auth:** 🔒 Protected — redirects to `/login` if unauthenticated
- **Layout:** Full-screen book-illustration background | Centred confirmation modal
- **Components:** `BookIllustrationBackground`, `ConfirmationPanel`, `BookCard` (mini)
- **Redux:** `orders` (last order), `payment.lastConfirmedOrderId`, `auth.giftPoints` (updated)
- **localStorage:** `bw_orders`, `bw_gift_points`
- **Interactions:** Award gift points on first render, "Continue your Shopping" → `/`

### Page 6 — Login (`/login`)
- **Reference:** Bob designs ✏️
- **Purpose:** Authenticate user for all protected features
- **Auth:** Public — this is the auth entry point
- **Design:** Dedicated full page — dark `#111827` background, centred `#1f2937` card panel with Book Worm branding, email + password fields, blue "Login" button. Visual language matches the floating panels on Payment and Confirmation pages.
- **Components:** `LoginPage`, email + password `Input` components, `Button`, inline `ErrorMessage`
- **Redux:** `auth.user`, `auth.isAuthenticated`
- **localStorage:** `bw_user`
- **Interactions:** Submit login form → mock validate → store user → redirect to `state.from` or `/`; unauthenticated Header user-icon click → navigate to `/login`

### Page 7 — My Orders (`/orders`)
- **Reference:** Bob designs ✏️
- **Auth:** 🔒 Protected — redirects to `/login` if unauthenticated
- **Purpose:** View order history, Buy Again, cancel eligible orders
- **Design:** Consistent dark theme, order cards in a list, same Header
- **Components:** `Header`, `OrderCard` (order#, date, status badge, total, book covers thumbnails), `EmptyOrders`
- **Redux:** `orders.orders` (filtered by authenticated user ID)
- **localStorage:** `bw_orders`

### Page 8 — Order Detail (`/orders/:id`)
- **Reference:** Bob designs ✏️
- **Auth:** 🔒 Protected — redirects to `/login` if unauthenticated
- **Purpose:** Full order view with cancellation and Buy Again
- **Components:** `Header`, `Breadcrumb`, `OrderDetail`, `CartItem` (read-only), "Cancel Order" (conditional on 48h + ownership), "Buy Again"
- **Redux:** `orders` (ownership check: `order.userId === auth.user.id`)
- **localStorage:** `bw_orders`

### Page 9 — Wishlist (`/wishlist`)
- **Reference:** Bob designs ✏️
- **Auth:** 🔒 Protected — redirects to `/login` if unauthenticated
- **Purpose:** View saved books, add to cart or remove
- **Components:** `Header`, `BookCard` with Wishlist action buttons, `EmptyWishlist`
- **Redux:** `books.wishlist` or separate slice (scoped to authenticated user)
- **localStorage:** `bw_wishlist`

### Page 10 — My Writers (`/writers`)
- **Reference:** Bob designs ✏️
- **Auth:** 🔒 Protected — redirects to `/login` if unauthenticated
- **Purpose:** View followed authors and their books
- **Components:** `Header`, `WriterCard`, `BookCard` (compact)
- **Redux:** `auth` or books (scoped to authenticated user)
- **localStorage:** `bw_writers`

### Page 11 — 404 Not Found (`*`)
- **Reference:** Bob designs ✏️
- **Purpose:** Graceful handling of invalid routes
- **Components:** Minimal page with Book Worm branding and "Go Home" button

---

## Auth Gate Summary

| Route | Auth Required | Behaviour when unauthenticated |
|---|---|---|
| `/` | No | Public |
| `/books/:id` | No (browse) | Add to Cart / Add to Wishlist → redirect to `/login` |
| `/cart` | **Yes** | Redirect to `/login` |
| `/payment` | **Yes** | Redirect to `/login` |
| `/confirmation` | **Yes** | Redirect to `/login` |
| `/orders` | **Yes** | Redirect to `/login` |
| `/orders/:id` | **Yes** | Redirect to `/login` |
| `/wishlist` | **Yes** | Redirect to `/login` |
| `/writers` | **Yes** | Redirect to `/login` |
| Gift points | **Yes** | Hidden until authenticated |

---

## Dependency Order

```
M1 (Foundation + ProtectedRoute scaffold)
  └── M2 (Homepage + Catalogue)
        └── M3 (Product Detail — auth-gated Add to Cart/Wishlist)
              └── M4 (Authentication — LoginPage, ProtectedRoute wired to all protected routes)
                    └── M5 (Cart page + Address — auth-gated)
                          └── M6 (Payment — auth-gated, gift points)
                                └── M7 (Confirmation — auth-gated, award gift points)
                                      └── M8 (Orders, Wishlist, Writers — all auth-gated)
                                            └── M9 (Responsive + Accessibility)
                                                  └── M10 (Final review)
```

---

## Mock Data Requirements

- 25–30 books spanning all visible categories
- Each book: `id`, `title`, `author`, `authorId`, `publisher`, `format`, `categories[]`, `price`, `coverImage` (use placeholder service), `synopsis`, `backCoverText`, `language`, `rating`, `sells`, `deliveryDate`, `isbn`
- 5–8 authors with name, photo, bio, books[]
- 3 mock user accounts (with distinct IDs for user-scoped data isolation)

---

## Notes on Design Decisions

1. **Cart page includes address form** — the CartpageScreen reference shows delivery address directly on the cart page, not a separate page. Bob follows this layout.
2. **Payment page is full-screen background** — matching the screenshot, payment is NOT inside the standard Header/sidebar layout. It uses a full-page illustrated background.
3. **Confirmation page matches Payment page layout** — same illustrated background, centered modal panel.
4. **Gift points redemption** — shown as a row within the Payment modal. Only visible when authenticated and balance > 0. Points earned at ~1% of order total, awarded at confirmation.
5. **Reviews persist locally** — reviews submitted on the Product Detail page persist to localStorage under a `bw_reviews` key.
6. **QuantityControl is shared** — used in both ProductDetailPage and CartPage.
7. **BookIllustrationBackground is shared** — used in both PaymentPage and ConfirmationPage.
8. **Authentication scope** — `/` and `/books/:id` are intentionally public to allow browsing. Every transactional route (`/cart` onward) and every account route (`/orders`, `/wishlist`, `/writers`) requires authentication. The `ProtectedRoute` component handles redirection uniformly with `state.from` preservation.
9. **User-scoped data** — orders, wishlist, saved address, gift points, and followed writers are stored scoped to the authenticated user's ID, preventing data leakage between demo accounts.
10. **Add to Cart / Add to Wishlist auth check** — these buttons on ProductDetailPage check `isAuthenticated` inline and navigate to `/login` with `state.from` if false, giving a smooth re-entry experience after login.
