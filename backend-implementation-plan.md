# Online Bookstore Backend — Implementation Plan (Corrected)

## Top-Level Overview

Build a Python + FastAPI + PostgreSQL backend that replaces every localStorage and mock-data
dependency in the existing frontend **without modifying frontend UI, layout, routing, or visual
design**. Minimal frontend changes are limited to wiring Axios calls in service files and Redux
slices only — no page or component changes unless absolutely required.

The frontend already has a future-ready Axios client (`src/services/axiosClient.ts`) that attaches
`Authorization: Bearer <token>` to every request and reads `VITE_API_BASE_URL` (defaults to `/api`).
The migration strategy is: implement real API endpoints → replace each mock/localStorage call
feature-by-feature → verify with TypeScript build after each migration.

**Scope boundary — in scope:**
- Python + FastAPI + PostgreSQL backend
- JWT authentication matching the existing frontend `User` shape
- All API endpoints required by the current frontend
- Seed data matching existing mock books and demo users exactly (ids `b1`–`b25`, `a1`–`a9`, `u1`–`u3`)
- pytest test suite using PostgreSQL (not SQLite)
- Minimal frontend Axios migration (service files and slices only)

**Scope boundary — out of scope:**
- Java, Node.js, or any non-Python backend
- Frontend UI, layout, routing, visual design, page components
- Real payment gateway
- Production deployment

---

## Backend Architecture

```
bookstore-backend/
├── app/
│   ├── main.py                   # FastAPI app, CORS, router mounts, global exception handler
│   ├── config.py                 # Settings via pydantic-settings (reads .env)
│   ├── database.py               # SQLAlchemy engine, SessionLocal, Base
│   ├── dependencies.py           # get_db, get_current_user
│   │
│   ├── models/                   # SQLAlchemy ORM models (one file per table)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── author.py
│   │   ├── book.py
│   │   ├── category.py
│   │   ├── book_category.py
│   │   ├── cart.py
│   │   ├── cart_item.py
│   │   ├── address.py
│   │   ├── wishlist.py
│   │   ├── review.py
│   │   ├── order.py
│   │   ├── order_item.py
│   │   ├── payment.py
│   │   ├── gift_point_ledger.py
│   │   └── followed_author.py
│   │
│   ├── schemas/                  # Pydantic v2 request/response models
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── author.py
│   │   ├── book.py
│   │   ├── category.py
│   │   ├── cart.py
│   │   ├── address.py
│   │   ├── wishlist.py
│   │   ├── review.py
│   │   ├── order.py
│   │   └── payment.py
│   │
│   ├── routers/                  # FastAPI routers (thin — delegate to services)
│   │   ├── auth.py
│   │   ├── books.py
│   │   ├── categories.py
│   │   ├── authors.py
│   │   ├── cart.py
│   │   ├── addresses.py
│   │   ├── wishlist.py
│   │   ├── reviews.py
│   │   ├── orders.py
│   │   ├── checkout.py
│   │   ├── gift_points.py
│   │   └── followed_authors.py
│   │
│   ├── services/                 # Business logic
│   │   ├── auth_service.py
│   │   ├── book_service.py
│   │   ├── cart_service.py
│   │   ├── address_service.py
│   │   ├── wishlist_service.py
│   │   ├── review_service.py
│   │   ├── order_service.py
│   │   ├── payment_service.py
│   │   ├── gift_points_service.py
│   │   ├── followed_author_service.py
│   │   └── checkout_service.py   # Orchestrator — coordinates all checkout steps
│   │
│   └── core/
│       ├── security.py           # hash_password, verify_password, create_access_token, decode_access_token
│       └── exceptions.py         # Typed HTTPException helpers (raise_401, raise_403, raise_404, raise_409)
│
├── alembic/
│   ├── env.py                    # Imports all models so autogenerate sees them
│   ├── script.py.mako
│   └── versions/
│       └── 001_initial_schema.py
│
├── tests/
│   ├── conftest.py               # pytest fixtures — test DB (PostgreSQL), session rollback, test_user, authenticated_client
│   ├── test_auth.py
│   ├── test_books.py
│   ├── test_categories.py
│   ├── test_cart.py
│   ├── test_addresses.py
│   ├── test_wishlist.py
│   ├── test_reviews.py
│   ├── test_checkout.py
│   ├── test_payments.py
│   ├── test_orders.py
│   └── test_gift_points.py
│
├── seed/
│   ├── seed.py                   # Idempotent entry point — runs all seed modules in order
│   ├── categories.py
│   ├── authors.py
│   ├── books.py
│   └── users.py
│
├── .env.example
├── .gitignore                    # Must include .env
├── requirements.txt              # Pinned latest stable versions
├── alembic.ini
└── README.md
```

---

## Database Schema (15 tables)

### Table: `users`
| Column | Type | Constraints |
|---|---|---|
| `id` | VARCHAR(10) | PK — matches frontend ids `u1`, `u2`, `u3`; UUID for new users |
| `name` | VARCHAR(200) | NOT NULL |
| `email` | VARCHAR(320) | NOT NULL, UNIQUE |
| `hashed_password` | VARCHAR(255) | NOT NULL |
| `gift_points` | INTEGER | NOT NULL, DEFAULT 0, CHECK ≥ 0 — cached balance |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() |

> `gift_points` is the live running balance. `gift_point_ledger` is the audit trail.
> Every balance-changing operation must update both in the same transaction.

### Table: `authors`
| Column | Type | Constraints |
|---|---|---|
| `id` | VARCHAR(10) | PK — matches frontend ids `a1`–`a9` |
| `name` | VARCHAR(200) | NOT NULL |
| `photo` | TEXT | — matches frontend `Author.photo` field name |
| `bio` | TEXT | |

### Table: `books`
| Column | Type | Constraints |
|---|---|---|
| `id` | VARCHAR(25) | PK — ISBN, e.g. `978-81-000001-0-1`. This is the canonical book identifier used in all FKs and API paths. No separate `isbn` column. |
| `title` | VARCHAR(300) | NOT NULL |
| `author_id` | VARCHAR(10) | FK → authors.id |
| `publisher` | VARCHAR(200) | |
| `format` | VARCHAR(20) | CHECK IN ('Paperback', 'Hard Cover', 'eBook') |
| `price` | NUMERIC(10,2) | NOT NULL |
| `cover_image` | TEXT | — matches frontend `Book.coverImage` field name |
| `synopsis` | TEXT | |
| `back_cover_text` | TEXT | |
| `language` | VARCHAR(30) | |
| `rating` | NUMERIC(3,2) | CHECK 1.0–5.0 |
| `sells` | INTEGER | DEFAULT 0 |
| `featured` | BOOLEAN | DEFAULT false — matches frontend `Book.featured` |
| `bestseller` | BOOLEAN | DEFAULT false — matches frontend `Book.bestseller` |
| `new_launch` | BOOLEAN | DEFAULT false — matches frontend `Book.newLaunch` |

> **`id` is the ISBN.** There is no separate `isbn` column — the ISBN *is* the primary key.
> **No `delivery_days` column.** Delivery date is calculated at order creation time as
> `order_date + 7 calendar days` and stored on the `orders` table. Books do not own delivery dates.

### Table: `categories`
| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PK |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE |

Seed with all 25 non-'All' Category values from `src/types/book.ts`.

### Table: `book_categories` (join)
| Column | Type | Constraints |
|---|---|---|
| `book_id` | VARCHAR(25) | FK → books.id (ISBN), ON DELETE CASCADE |
| `category_id` | INTEGER | FK → categories.id, ON DELETE CASCADE |
| PK | (book_id, category_id) | |

### Table: `coupons`
| Column | Type | Constraints |
|---|---|---|
| `code` | VARCHAR(20) | PK |
| `discount_amount` | NUMERIC(10,2) | NOT NULL — fixed-amount discount |
| `is_active` | BOOLEAN | DEFAULT true |

Seed: `BOOK10=10`, `SAVE50=50`, `READ100=100`, `WORM20=20`.

> Coupon discount is applied before gift-point redemption.
> Discount cannot exceed the cart subtotal + tax (total cannot go below 0).
> Only coupons with `is_active = true` can be applied.

### Table: `carts`
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() |
| `user_id` | VARCHAR(10) or UUID | FK → users.id, UNIQUE — one cart per user |
| `coupon_code` | VARCHAR(20) | FK → coupons.code, nullable |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() |

### Table: `cart_items`
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `cart_id` | UUID | FK → carts.id, ON DELETE CASCADE |
| `book_id` | VARCHAR(25) | FK → books.id (ISBN) |
| `quantity` | INTEGER | NOT NULL, CHECK ≥ 1 |
| UNIQUE | (cart_id, book_id) | — one row per book per cart |

### Table: `addresses`
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() |
| `user_id` | FK | → users.id |
| `first_name` | VARCHAR(100) | NOT NULL |
| `last_name` | VARCHAR(100) | NOT NULL |
| `address_line` | TEXT | NOT NULL |
| `email` | VARCHAR(320) | NOT NULL |
| `city` | VARCHAR(100) | NOT NULL |
| `pin` | CHAR(6) | NOT NULL — exactly 6 digits |
| `phone_country_code` | VARCHAR(10) | NOT NULL, DEFAULT '+91' |
| `phone` | VARCHAR(20) | NOT NULL |
| `state` | VARCHAR(100) | NOT NULL |
| `country` | VARCHAR(100) | NOT NULL, DEFAULT 'India' |
| `is_default` | BOOLEAN | DEFAULT false |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() |

### Table: `wishlists`
| Column | Type | Constraints |
|---|---|---|
| `user_id` | FK | → users.id |
| `book_id` | VARCHAR(25) | FK → books.id (ISBN) |
| `added_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() |
| PK | (user_id, book_id) | |

### Table: `reviews`
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() |
| `book_id` | VARCHAR(25) | FK → books.id (ISBN) |
| `user_id` | FK | → users.id |
| `rating` | SMALLINT | NOT NULL, CHECK 1–5 |
| `text` | VARCHAR(100) | NOT NULL, CHECK length ≥ 1 |
| `user_name` | VARCHAR(200) | NOT NULL — snapshot at write time from `user.name` |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() |
| UNIQUE | (user_id, book_id) | — one review per user per book |

> Any authenticated user may submit a review. Purchase verification is not required because
> the existing frontend does not implement it.

### Table: `orders`
| Column | Type | Constraints |
|---|---|---|
| `id` | VARCHAR(30) | PK — format `ORD-{unix_ms}` matching frontend pattern |
| `user_id` | FK | → users.id |
| `subtotal` | NUMERIC(10,2) | NOT NULL |
| `tax` | NUMERIC(10,2) | NOT NULL |
| `discount` | NUMERIC(10,2) | NOT NULL, DEFAULT 0 |
| `redeemed_points_amount` | INTEGER | NOT NULL, DEFAULT 0 |
| `total` | NUMERIC(10,2) | NOT NULL |
| `status` | VARCHAR(20) | CHECK IN ('Processing', 'Shipped', 'Delivered', 'Cancelled') |
| `payment_method` | VARCHAR(20) | NOT NULL |
| `coupon_code` | VARCHAR(20) | nullable |
| `address_id` | UUID | FK → addresses.id, nullable |
| `delivery_date` | DATE | NOT NULL — order_date + 7 calendar days |
| `points_awarded` | BOOLEAN | NOT NULL, DEFAULT false |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() |

> `id` format: `ORD-{unix_milliseconds}` — generated server-side using
> `f"ORD-{int(datetime.utcnow().timestamp() * 1000)}"`. This matches the frontend pattern
> `ORD-${Date.now()}` exactly.

### Table: `order_items`
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() |
| `order_id` | VARCHAR(30) | FK → orders.id, ON DELETE CASCADE |
| `book_id` | VARCHAR(25) | FK → books.id (ISBN) |
| `book_title` | VARCHAR(300) | NOT NULL — snapshot |
| `author_name` | VARCHAR(200) | NOT NULL — snapshot |
| `price_at_purchase` | NUMERIC(10,2) | NOT NULL — snapshot |
| `quantity` | INTEGER | NOT NULL, CHECK ≥ 1 |
| `format` | VARCHAR(20) | NOT NULL — snapshot |
| `cover_image` | TEXT | — snapshot |
| `delivery_date` | VARCHAR(20) | NOT NULL — formatted string e.g. "Mon, 21 Jul", computed from orders.delivery_date |

> Snapshots preserve historical state. `delivery_date` is the formatted string matching
> `Book.deliveryDate` in the frontend type, computed once at order creation.

### Table: `payments`
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() |
| `order_id` | VARCHAR(30) | FK → orders.id, UNIQUE |
| `method` | VARCHAR(20) | NOT NULL |
| `status` | VARCHAR(20) | CHECK IN ('success', 'failed') |
| `transaction_id` | VARCHAR(50) | — mock value |
| `amount` | NUMERIC(10,2) | NOT NULL |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() |

### Table: `gift_point_ledger`
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() |
| `user_id` | FK | → users.id |
| `amount` | INTEGER | NOT NULL — positive = award, negative = deduction |
| `reason` | VARCHAR(50) | NOT NULL — one of: `'order_award'`, `'order_redemption'`, `'cancel_award_reversal'`, `'cancel_redemption_reversal'` |
| `order_id` | VARCHAR(30) | FK → orders.id, nullable |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() |

### Table: `followed_authors`
| Column | Type | Constraints |
|---|---|---|
| `user_id` | FK | → users.id |
| `author_id` | VARCHAR(10) | FK → authors.id |
| `followed_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() |
| PK | (user_id, author_id) | |

---

## Calculation Rules

### Tax
Exact match to frontend `selectCartTax`:
```
tax = round(subtotal * 0.12)
```
Python: `int(round(subtotal * Decimal('0.12')))`

### Total
```
total = max(0, subtotal + tax - discount - redeemed_points_amount)
```

### Coupon discount
- Only `is_active` coupons accepted.
- `discount = coupon.discount_amount`
- `discount` cannot exceed `subtotal + tax` (total cannot go negative).
- Applied before gift-point redemption.

### Gift-point redemption
- `redeemable = min(user.gift_points, cart_total_after_coupon)`
- `cart_total_after_coupon = subtotal + tax - discount`
- Redeemed amount is stored as `redeemed_points_amount` on the order.

### Gift-point award
- `pts = floor(order.total * 0.01)`
- Award only when `pts > 0` and `order.points_awarded is False`.
- Guard is idempotent: if `points_awarded` is already `True`, skip.

### Order ID
Server-side: `f"ORD-{int(datetime.utcnow().timestamp() * 1000)}"` — same shape as frontend
`ORD-${Date.now()}`.

### Delivery date
- Computed at order creation: `delivery_date = order.created_at.date() + timedelta(days=7)`.
- Handles month/year boundaries correctly (Python `datetime.date` arithmetic).
- Formatted for display as `delivery_date.strftime("%-d %b").lstrip()` → e.g. `"21 Jul"`, then
  prepend weekday: `delivery_date.strftime("%a, %-d %b")` → e.g. `"Mon, 21 Jul"`.
- Stored on `orders.delivery_date` (DATE) and on `order_items.delivery_date` (VARCHAR — formatted string).
- Frontend displays `order_items[*].delivery_date` as-is. No frontend date arithmetic.

> **Windows note:** `%-d` (no zero-pad) is Linux-only. Use `%#d` on Windows or strip leading zero
> with `.lstrip('0')` after `%d` for cross-platform compatibility.

---

## REST API Contract

All routes are prefixed with `/api`. Authentication uses `Authorization: Bearer <JWT>`.

### Static book routes must be registered BEFORE `/{book_id}`
```
GET /api/books/featured
GET /api/books/bestsellers
GET /api/books/new-launches
GET /api/books/recommended
GET /api/books/{book_id}
```

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account; return User + JWT |
| POST | `/api/auth/login` | No | Authenticate; return User + JWT |
| GET | `/api/auth/me` | Yes | Current user + gift_points |
| PUT | `/api/auth/me` | Yes | Update profile (name, password) |
| POST | `/api/auth/logout` | No | Client-side only — no server state. Returns `{"message": "ok"}` |

> JWT is stateless. Logout is implemented by the client removing the token from localStorage.
> No token blacklist is implemented.

**Login / Register response shape** (matches frontend `User` object):
```json
{
  "id": "u1",
  "name": "Priya Sharma",
  "email": "priya@bookworm.com",
  "token": "eyJ...",
  "gift_points": 0
}
```

### Books
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/books` | No | List with filters/search/sort/pagination |
| GET | `/api/books/featured` | No | `featured = true` |
| GET | `/api/books/bestsellers` | No | `bestseller = true` |
| GET | `/api/books/new-launches` | No | `new_launch = true` |
| GET | `/api/books/recommended` | Yes | Order-history based; fallback to featured |
| GET | `/api/books/{isbn}` | No | Single book detail + author + categories |
| GET | `/api/books/{isbn}/related` | No | Up to 3 books sharing categories |
| GET | `/api/books/{isbn}/reviews` | No | Reviews for this book |
| POST | `/api/books/{isbn}/reviews` | Yes | Submit a review |

> `{isbn}` is the book's ISBN primary key, e.g. `978-81-000001-0-1`.
> All path parameters and FK columns named `book_id` hold the ISBN value.

**Query params for `GET /api/books`:**
- `q` — full-text search (title, author_name)
- `category` — exact category name
- `language` — language filter
- `format` — format filter
- `price_min`, `price_max` — numeric price range
- `sort_by` — `relevance | price_asc | price_desc | rating_desc`
- `page`, `page_size` — pagination

**Book response** must include a `deliveryDate` string field computed as `"Mon, 21 Jul"` style.
For catalogue/list endpoints, `deliveryDate` is computed as today + 7 days per-request.
For order item display, `delivery_date` is the stored snapshot on `order_items`.

### Categories
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | No | List all categories |
| GET | `/api/categories/{category_id}` | No | Single category |
| GET | `/api/categories/{category_id}/books` | No | Books in category |

### Authors
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/authors` | No | List all authors |
| GET | `/api/authors/{author_id}` | No | Author profile |
| GET | `/api/authors/{author_id}/books` | No | Books by this author |

### Cart
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | Yes | Current user's cart with calculated totals |
| PUT | `/api/cart/items/{isbn}` | Yes | Upsert item quantity — `{isbn}` is the book's ISBN PK |
| DELETE | `/api/cart/items/{isbn}` | Yes | Remove item — `{isbn}` is the book's ISBN PK |
| DELETE | `/api/cart` | Yes | Clear all items |
| POST | `/api/cart/coupon` | Yes | Apply coupon; return updated totals |
| DELETE | `/api/cart/coupon` | Yes | Remove coupon |

**Cart response includes server-calculated:**
- `subtotal` = sum of `book.price * quantity`
- `tax` = `round(subtotal * 0.12)`
- `discount` = `coupon.discount_amount` if applied, else 0
- `total` = `max(0, subtotal + tax - discount)`

### Addresses
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/addresses` | Yes | List user's addresses |
| POST | `/api/addresses` | Yes | Create address |
| GET | `/api/addresses/{address_id}` | Yes | Get single address (owner only) |
| PUT | `/api/addresses/{address_id}` | Yes | Update address (owner only) |
| DELETE | `/api/addresses/{address_id}` | Yes | Delete address (owner only) |

Address ownership enforced on all operations.

### Wishlist
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/wishlist` | Yes | User's wishlist books (full Book objects) |
| POST | `/api/wishlist/{isbn}` | Yes | Add book; 409 if already present — `{isbn}` is the book's ISBN PK |
| DELETE | `/api/wishlist/{isbn}` | Yes | Remove book; 404 if not present — `{isbn}` is the book's ISBN PK |
| DELETE | `/api/wishlist` | Yes | Clear wishlist |

### Orders
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/orders` | Yes | User's orders only (filtered by user_id) |
| GET | `/api/orders/{order_id}` | Yes | Order detail (owner only) |
| POST | `/api/orders/{order_id}/cancel` | Yes | Cancel order (see rules below) |
| POST | `/api/orders/{order_id}/buy-again` | Yes | Add order items back to cart |

**Cancellation rules (all enforced server-side):**
1. `order.user_id == current_user.id` — ownership
2. `order.status not in ('Cancelled', 'Delivered')` — valid state
3. `datetime.utcnow() < order.created_at + timedelta(hours=48)` — within window

Use a safe conditional UPDATE inside a transaction:
```sql
UPDATE orders
SET status = 'Cancelled'
WHERE id = :order_id
  AND user_id = :user_id
  AND status NOT IN ('Cancelled', 'Delivered')
  AND created_at > NOW() - INTERVAL '48 hours'
```
If 0 rows affected, return 409 (already cancelled / window expired).

**Cancellation point reversal (inside same transaction):**
- If `order.points_awarded = true`: insert ledger entry `amount = -floor(order.total * 0.01)`, `reason = 'cancel_award_reversal'`; decrement `users.gift_points`.
- If `order.redeemed_points_amount > 0`: insert ledger entry `amount = +order.redeemed_points_amount`, `reason = 'cancel_redemption_reversal'`; increment `users.gift_points`.
- Both operations must happen atomically in the same transaction as the status update.

**Buy Again rules:**
1. Verify `order.user_id == current_user.id`.
2. For each item in `order_items` where the book still exists in `books`, upsert into the user's cart.
3. Return the updated cart response.

### Checkout
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/checkout` | Yes | Atomic checkout — see orchestration below |

**Checkout request body:**
```json
{
  "payment_method": "credit-card",
  "address_id": "uuid",
  "redeem_points": true,
  "card_number": "4111111111111111",
  "card_name": "Priya Sharma",
  "expiry": "12/26",
  "cvv": "123",
  "upi_id": "",
  "wallet": ""
}
```

**Checkout response:**
```json
{
  "order_id": "ORD-1720000000000",
  "status": "Processing",
  "total": 470.00,
  "points_awarded": 4,
  "delivery_date": "Mon, 21 Jul"
}
```

**Checkout orchestration (all inside one database transaction):**
1. Load user's cart; fail 400 if empty.
2. Validate address exists and belongs to user.
3. Calculate `subtotal`, `tax`, `discount` (coupon if applied), `redeemed_points_amount`.
4. If `redeem_points = true`: compute `redeemable = min(user.gift_points, total_after_coupon)`.
5. Compute final `total = max(0, subtotal + tax - discount - redeemed_points_amount)`.
6. Run mock payment via `payment_service.simulate(method, details, amount)`.
7. If payment fails: rollback, return 402 with `{"detail": "Payment failed"}`.
8. Compute `delivery_date = today + 7 days`; format as `"Mon, 21 Jul"`.
9. Create `orders` row with `id = f"ORD-{unix_ms}"`.
10. Create `order_items` rows (snapshots: title, author_name, price, format, cover_image, delivery_date string).
11. Create `payments` row with status `'success'`.
12. If `redeemed_points_amount > 0`: insert ledger `reason = 'order_redemption'`; decrement `users.gift_points`.
13. Calculate gift-point award: `pts = floor(order.total * 0.01)`.
14. If `pts > 0`: insert ledger `reason = 'order_award'`; increment `users.gift_points`; set `orders.points_awarded = true`.
15. Clear `cart_items` for the user's cart; remove coupon from cart.
16. Commit transaction.
17. Return checkout response.

### Gift Points
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/gift-points` | Yes | Current balance + recent ledger entries |

### Followed Authors
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/followed-authors` | Yes | List followed author profiles |
| POST | `/api/followed-authors/{author_id}` | Yes | Follow; 409 if already following |
| DELETE | `/api/followed-authors/{author_id}` | Yes | Unfollow; 404 if not following |

---

## Mock Payment — Deterministic Behavior

Payment simulation uses **deterministic test values**, not random success rates.
This ensures tests are never flaky.

### Deterministic rules in `payment_service.simulate()`:

**credit-card / debit-card:**
- `card_number == "4000000000000002"` → always fail (test decline card)
- Any other non-empty 16-digit number → success
- Returns `{"status": "success", "transaction_id": "MOCK-CC-{order_id}"}`

**upi:**
- `upi_id contains '@'` → success
- Otherwise → fail
- Returns `{"status": "success", "transaction_id": "MOCK-UPI-{order_id}"}`

**wallet:**
- `wallet in ['Paytm', 'PhonePe', 'Google Pay', 'Amazon Pay']` → success
- Otherwise → fail
- Returns `{"status": "success", "transaction_id": "MOCK-WALLET-{order_id}"}`

No randomness. Tests use known inputs to test both success and failure paths.

---

## Authentication and Security

### JWT
- HS256, signed with `SECRET_KEY` from environment variable (never hardcoded).
- Payload: `{ "sub": "<user_id>", "exp": <unix_ts>, "iat": <unix_ts> }`.
- Expiry: `ACCESS_TOKEN_EXPIRE_DAYS` (default 7 days).
- No refresh tokens (capstone scope).
- Frontend stores token in `bw_user` localStorage and sends as `Bearer`.
- `get_current_user` decodes JWT, fetches user from DB, raises 401 if invalid/expired.

### Passwords
- `passlib[bcrypt]`, rounds = 12.
- Never stored in plaintext, never logged.

### CORS
- `allow_origins: [FRONTEND_ORIGIN]` — from environment variable.
- `allow_credentials: true`.

### .gitignore
Must include `.env` and common Python build artifacts.

### Environment variables (`.env.example`)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/bookstore
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/bookstore_test
SECRET_KEY=<generated-random-256-bit-key>
ACCESS_TOKEN_EXPIRE_DAYS=7
FRONTEND_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Ownership and Isolation Rules

Every protected resource enforces ownership. The authenticated user's `id` is extracted from the
JWT on every request:

| Resource | Ownership check |
|---|---|
| Cart | `cart.user_id == current_user.id` |
| Addresses | `address.user_id == current_user.id` |
| Wishlist | Filter by `user_id = current_user.id` |
| Orders | `order.user_id == current_user.id` |
| Followed authors | Filter by `user_id = current_user.id` |
| Reviews | Any authenticated user may read/write |

---

## localStorage-to-API Migration Plan

Frontend changes are limited to service files and Redux slice thunks only.
No page components or UI changes.

| localStorage Key | Migration Endpoint | Frontend Change |
|---|---|---|
| `bw_user` | `POST /api/auth/login` | `authService.ts` — replace `mockLogin` with Axios call |
| `bw_cart` | `GET/PUT/DELETE /api/cart/*` | `cartSlice.ts` — add async thunks |
| `bw_orders` | `GET /api/orders` | `ordersSlice.ts` — add async thunks |
| `bw_gift_points` | `GET /api/auth/me` / `POST /api/checkout` | `authSlice.ts` — load from API |
| `bw_wishlist` | `GET/POST/DELETE /api/wishlist/*` | `wishlistSlice.ts` — add async thunks |
| `bw_address_<id>` | `GET/POST /api/addresses/*` | `AddressForm.tsx` service calls |
| `bw_writers_<id>` | `GET/POST/DELETE /api/followed-authors/*` | `WritersPage.tsx` service calls |
| `bw_reviews` | `GET/POST /api/books/{id}/reviews` | `ReviewSection.tsx` service calls |

---

## Error Handling

### HTTP Status Codes
| Code | Situation |
|---|---|
| 200 | Successful read or update |
| 201 | Successful create |
| 400 | Malformed body or business rule violation (empty cart, etc.) |
| 401 | Missing or invalid JWT |
| 402 | Payment failed |
| 403 | Authenticated but not authorised (wrong user's resource) |
| 404 | Resource not found |
| 409 | Conflict (duplicate review, already cancelled, already following) |
| 422 | Pydantic validation error |
| 500 | Unhandled server error (generic, no stack trace in response) |

### Error Response Shape
```json
{ "detail": "Human-readable error message" }
```

---

## Seed Data

`seed/seed.py` is idempotent (uses `INSERT ... ON CONFLICT DO NOTHING`) and runs in order:

1. **Categories** — all 25 non-'All' values from `src/types/book.ts`
2. **Authors** — 9 authors from `src/data/mockBooks.ts` with ids `a1`–`a9`
3. **Books** — 25 books; `books.id` = ISBN from mock data (e.g. `978-81-000001-0-1`). The legacy `b1`–`b25` short ids are **not** used in the database. The frontend's `Book.id` field in `src/data/mockBooks.ts` must be updated from `'b1'` to the corresponding ISBN during the frontend migration milestone.
4. **BookCategories** — join records
5. **Coupons** — `BOOK10`, `SAVE50`, `READ100`, `WORM20`
6. **Users** — 3 demo accounts with bcrypt-hashed passwords:
   - `priya@bookworm.com` / `password123` / id `u1`
   - `rahul@bookworm.com` / `password123` / id `u2`
   - `ananya@bookworm.com` / `password123` / id `u3`

---

## Testing

### Test Infrastructure (`tests/conftest.py`)
- Uses a dedicated PostgreSQL test database (`TEST_DATABASE_URL`).
- Each test runs inside a transaction that is rolled back on teardown (no state leakage).
- Fixtures: `db_session`, `test_user`, `test_user_2`, `authenticated_client`, `authenticated_client_2`,
  `test_book`, `test_order`, `test_cart`.
- FastAPI `TestClient` from `httpx`.

### Test Files and Coverage

**`test_auth.py`**
- Register new user → 201 + User shape returned
- Register duplicate email → 409
- Login with correct credentials → 200 + User shape with token
- Login with wrong password → 401
- Login with unknown email → 401
- `GET /api/auth/me` with valid token → 200
- `GET /api/auth/me` without token → 401
- `POST /api/auth/logout` → 200 (no state change on server)

**`test_books.py`**
- `GET /api/books` returns list
- `GET /api/books?q=focus` returns filtered results
- `GET /api/books?category=Self+Help` returns category results
- `GET /api/books?sort_by=price_asc` returns sorted results
- `GET /api/books/featured` returns only featured books
- `GET /api/books/bestsellers` returns only bestseller books
- `GET /api/books/new-launches` returns only new_launch books
- `GET /api/books/{isbn}` returns full book + author + categories (isbn = `978-81-000001-0-1`)
- `GET /api/books/{isbn}/related` returns up to 3 books
- `GET /api/books/recommended` (authenticated) returns recommendations
- `GET /api/books/recommended` (unauthenticated) → 401
- Response includes `deliveryDate` string field
- Non-existent ISBN → 404

**`test_categories.py`**
- `GET /api/categories` returns all 25 categories
- `GET /api/categories/{id}` returns single category
- `GET /api/categories/{id}/books` returns filtered books
- Non-existent category → 404

**`test_cart.py`**
- `GET /api/cart` returns empty cart for new user
- `PUT /api/cart/items/{isbn}` adds item; totals recalculate (isbn = book's ISBN PK)
- `PUT /api/cart/items/{isbn}` updates quantity of existing item
- `DELETE /api/cart/items/{isbn}` removes item
- `DELETE /api/cart` clears all items
- `POST /api/cart/coupon` with `BOOK10` → discount = 10; totals recalculate
- `POST /api/cart/coupon` with inactive/unknown code → 400
- `DELETE /api/cart/coupon` removes coupon; totals recalculate
- Tax calculation: `round(subtotal * 0.12)` — exact match to frontend
- Discount cannot exceed subtotal + tax
- Unauthenticated cart access → 401
- User A cannot read User B's cart

**`test_addresses.py`**
- Create address → 201 + address with id
- List addresses → user's own only
- Update address → 200
- Delete address → 204
- User A cannot read/update/delete User B's address → 403
- Invalid pin (not 6 digits) → 422
- Missing required fields → 422

**`test_wishlist.py`**
- Add book → 201
- Add duplicate book → 409
- List wishlist → user's books only
- Remove book → 204
- Remove non-present book → 404
- Clear wishlist → 204
- User A cannot read User B's wishlist → own data only

**`test_reviews.py`**
- Submit review (authenticated) → 201
- Submit duplicate review (same user, same book) → 409
- List reviews (unauthenticated) → 200
- Invalid rating (0 or 6) → 422
- Text over 100 chars → 422
- Empty text → 422
- Unauthenticated review submission → 401

**`test_checkout.py`**
- Checkout with credit card (valid) → 201, order created, cart cleared
- Checkout with debit card (valid) → 201
- Checkout with UPI (valid id with @) → 201
- Checkout with wallet (Paytm) → 201
- Checkout with card number `4000000000000002` → 402 payment failed, order NOT created
- Checkout with UPI without @ → 402
- Checkout with empty cart → 400
- Checkout with invalid address_id → 403
- Checkout applies coupon discount
- Checkout with `redeem_points=true` reduces total by redeemable amount
- `orders.points_awarded` is true after successful checkout (when pts > 0)
- `users.gift_points` incremented after checkout
- Cart is empty after successful checkout
- Unauthenticated checkout → 401

**`test_payments.py`**
- Payment row created for each successful checkout
- Payment row has `status = 'success'` and a `transaction_id`
- Failed payment does not create a `payments` row
- `payments.order_id` matches `orders.id`

**`test_orders.py`**
- List orders → only authenticated user's orders
- Get order detail (owner) → 200 with all fields including `delivery_date`
- Get order detail (non-owner) → 403
- Non-existent order → 404

**`test_orders.py` — Cancellation:**
- Cancel within 48h → 200, status = 'Cancelled'
- Cancel after 48h → 409
- Cancel already-cancelled order → 409
- Cancel delivered order → 409
- User A cannot cancel User B's order → 403
- Concurrent cancel requests (same order) — only one succeeds; second returns 409
- Cancellation reverses `points_awarded` (ledger + balance updated)
- Cancellation reverses `redeemed_points_amount` (ledger + balance updated)

**`test_orders.py` — Buy Again:**
- Buy Again (owner) → 200, cart contains order items
- Buy Again (non-owner) → 403
- Books still present in catalogue are added; deleted books are skipped
- Quantities from order are used

**`test_gift_points.py`**
- `GET /api/gift-points` returns current balance and recent ledger
- Award on checkout: `pts = floor(total * 0.01)`, balance updated
- Idempotency: points not awarded twice for the same order
- Redemption: balance decremented by redeemed amount
- Award reversal on cancellation: balance decremented by previously awarded pts
- Redemption reversal on cancellation: balance incremented by previously redeemed amount
- All ledger entries present with correct `reason` values

---

## Milestone-Based Implementation Plan

### Milestone B1 — Project Foundation

**Intent:** Bootstrap FastAPI project, configure PostgreSQL + SQLAlchemy + Alembic, create all 15
models, initial migration, JWT security, and health check endpoint.

**Expected Outcomes:**
- `uvicorn app.main:app --reload` starts without errors
- `GET /api/health` returns `{"status": "ok"}`
- `alembic upgrade head` creates all 15 tables
- `seed/seed.py` populates demo data
- All 15 models import without errors

**Todo List:**
1. Create `bookstore-backend/` directory
2. Create and activate Python virtual environment
3. Install all dependencies; write `requirements.txt` with pinned latest-stable versions
4. Create `.gitignore` (must include `.env`, `__pycache__`, `.venv`, `*.pyc`, `dist/`)
5. Create `.env.example` with all required variables
6. Create `app/config.py` using `pydantic-settings`
7. Create `app/database.py` — engine, `SessionLocal`, `Base`
8. Create all 15 SQLAlchemy model files in `app/models/` with correct column types and relationships
9. Create `app/core/security.py` — `hash_password`, `verify_password`, `create_access_token`, `decode_access_token`
10. Create `app/dependencies.py` — `get_db`, `get_current_user`
11. Create `app/main.py` — FastAPI app, CORS, global exception handler, `GET /api/health`
12. Initialise Alembic: configure `env.py` to import all models via `app/models/__init__.py`
13. Generate and verify initial migration
14. Write `seed/seed.py` and sub-modules with all seed data
15. Run migration and seed; verify all 15 tables populated

**Status:** [x] complete

---

### Milestone B2 — Authentication API

**Intent:** Implement register, login, me, logout. Login response must match the frontend
`User` shape exactly: `{ id, name, email, token, gift_points }`.

**Expected Outcomes:**
- `POST /api/auth/login` with `priya@bookworm.com` / `password123` returns correct User shape
- `GET /api/auth/me` with Bearer token returns current user
- Wrong password → 401
- Protected routes without token → 401
- `test_auth.py` passes

**Todo List:**
1. Create `app/schemas/auth.py` — `LoginRequest`, `RegisterRequest`, `UserResponse`
2. Create `app/services/auth_service.py` — `authenticate_user`, `create_user`, `get_user_by_id`
3. Create `app/routers/auth.py` — register, login, me, logout
4. Mount `auth` router in `main.py`
5. Write and run `tests/test_auth.py`

**Relevant Context:**
- Frontend `User` type: `{ id: string; name: string; email: string; token: string }`
- Frontend also reads `gift_points` from login response for initial balance
- `authService.ts` is the only frontend file that needs changing in migration

**Status:** [x] complete

---

### Milestone B3 — Books and Catalogue API

**Intent:** All book endpoints including filtered list, detail, related, section lists, and
recommendations. Response must include `deliveryDate` string.

**Expected Outcomes:**
- `GET /api/books` returns paginated list with correct fields
- All filter/sort/search params work
- `GET /api/books/featured` etc. return correct subsets
- `GET /api/books/{book_id}` includes author and categories
- `GET /api/books/{book_id}/related` returns up to 3 books
- `GET /api/books/recommended` returns history-based or featured fallback
- All responses include `deliveryDate` formatted string
- `test_books.py` passes

**Todo List:**
1. Create `app/schemas/book.py` — `BookResponse`, `BookListResponse`, `AuthorResponse`
2. Create `app/services/book_service.py` — all query functions
3. Create `app/routers/books.py` — register static routes before `/{book_id}`
4. Create `app/routers/authors.py`
5. Mount in `main.py`
6. Write and run `tests/test_books.py`

**Relevant Context:**
- Frontend `Book` type fields: `id`, `title`, `authorId`, `authorName`, `publisher`, `format`,
  `categories`, `price`, `coverImage`, `synopsis`, `backCoverText`, `language`, `rating`, `sells`,
  `deliveryDate`, `isbn`, `featured`, `bestseller`, `newLaunch`
- Static routes `/featured`, `/bestsellers`, `/new-launches`, `/recommended` must be registered
  before `/{book_id}` in the FastAPI router to prevent route shadowing

**Status:** [x] complete

---

### Milestone B4 — Categories API

**Intent:** Expose category listing and category-filtered book browsing.
The frontend `CategorySidebar` uses category names for filtering; these endpoints
support that pattern via API.

**Expected Outcomes:**
- `GET /api/categories` returns all 25 category names
- `GET /api/categories/{id}/books` returns correctly filtered books
- `test_categories.py` passes

**Todo List:**
1. Create `app/schemas/category.py`
2. Create `app/routers/categories.py`
3. Mount in `main.py`
4. Write and run `tests/test_categories.py`

**Status:** [x] complete

---

### Milestone B5 — Cart API

**Intent:** Server-side cart persistence with coupon support and server-calculated totals.
Replaces `bw_cart` localStorage.

**Expected Outcomes:**
- All cart CRUD endpoints work
- Tax calculation matches frontend exactly: `round(subtotal * 0.12)`
- Total = `max(0, subtotal + tax - discount)`
- Coupon discount never exceeds subtotal + tax
- Only active coupons accepted
- `test_cart.py` passes

**Todo List:**
1. Create `app/schemas/cart.py` — `CartItemRequest`, `CartResponse`, `CouponRequest`
2. Create `app/services/cart_service.py` — upsert, remove, clear, coupon, calculate totals
3. Create `app/routers/cart.py`
4. Mount in `main.py`
5. Write and run `tests/test_cart.py`

**Status:** [x] complete — 24/24 tests pass

---

### Milestone B6 — Addresses API

**Intent:** User-scoped address CRUD, server-side validation matching `validateAddress.ts`.

**Expected Outcomes:**
- All address CRUD endpoints work with ownership enforcement
- Backend validates same rules: required fields, email pattern, 6-digit pin
- `test_addresses.py` passes

**Todo List:**
1. Create `app/schemas/address.py` — `AddressRequest`, `AddressResponse`
2. Create `app/services/address_service.py`
3. Create `app/routers/addresses.py`
4. Mount in `main.py`
5. Write and run `tests/test_addresses.py`

**Relevant Context:**
- Validated fields from `validateAddress.ts`: `firstName`, `lastName`, `addressLine`, `email`, `city`, `pin`, `phone`, `state`
- Email pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Pin pattern: exactly 6 digits

**Status:** [x] complete — 20/20 tests pass

---

### Milestone B7 — Wishlist and Reviews APIs

**Intent:** User-scoped wishlist and book review creation/retrieval.

**Expected Outcomes:**
- Wishlist CRUD with user isolation works
- Review creation enforces UNIQUE(user_id, book_id)
- `test_wishlist.py` and `test_reviews.py` pass

**Todo List:**
1. Create `app/schemas/wishlist.py` and `app/schemas/review.py`
2. Create `app/services/wishlist_service.py` and `app/services/review_service.py`
3. Create `app/routers/wishlist.py` and add review routes to `books.py`
4. Mount in `main.py`
5. Write and run `tests/test_wishlist.py` and `tests/test_reviews.py`

**Status:** [x] complete — 22/22 tests pass

---

### Milestone B8 — Checkout, Orders, Gift Points, and Cancellation

**Intent:** The most complex milestone. Implements the atomic checkout orchestrator, order
endpoints, gift-point lifecycle, and order cancellation with point reversal.

**Expected Outcomes:**
- `POST /api/checkout` creates order with `id = "ORD-{unix_ms}"`, runs payment, awards points, clears cart — all atomically
- `payments` row created for every successful checkout
- Order `delivery_date` = order date + 7 days, formatted correctly
- `GET /api/orders` and `GET /api/orders/{id}` work with ownership
- Cancellation enforces all 3 conditions with safe conditional UPDATE
- Cancellation reverses points (both awarded and redeemed) atomically
- Buy Again adds items back to cart
- `test_checkout.py`, `test_payments.py`, `test_orders.py`, `test_gift_points.py` pass

**Todo List:**
1. Create `app/schemas/order.py` and `app/schemas/payment.py`
2. Create `app/services/payment_service.py` — deterministic mock with test card `4000000000000002`
3. Create `app/services/gift_points_service.py` — award, redeem, reverse, get_balance
4. Create `app/services/order_service.py` — create, list_by_user, get_by_id, cancel, buy_again
5. Create `app/services/checkout_service.py` — orchestrator coordinating all steps in one transaction
6. Create `app/routers/checkout.py` (thin router, delegates to `checkout_service`)
7. Create `app/routers/orders.py`
8. Create `app/routers/gift_points.py`
9. Mount all in `main.py`
10. Write and run all four test files

**Relevant Context:**
- Order ID: `f"ORD-{int(datetime.utcnow().timestamp() * 1000)}"` — matches frontend `ORD-${Date.now()}`
- Delivery date: `order_created_at.date() + timedelta(days=7)`, formatted as `"%a, %-d %b"` (handle Windows cross-platform)
- Checkout response shape must match what `PaymentPage.tsx` will use: `{ order_id, status, total, points_awarded, delivery_date }`
- Gift points calculation: `floor(order.total * 0.01)` matching `ConfirmationPage.tsx`
- Cancellation window: `created_at + 48h` matching `OrderDetailPage.tsx`

**Status:** [x] complete — 31/31 tests pass

---

### Milestone B9 — Followed Authors API

**Intent:** Follow/unfollow/list authors. Replaces `bw_writers_<userId>` localStorage.

**Expected Outcomes:**
- All endpoints work with user isolation
- Follow already-followed author → 409
- Unfollow not-followed author → 404
- Tests pass

**Todo List:**
1. Create `app/services/followed_author_service.py`
2. Create `app/routers/followed_authors.py`
3. Mount in `main.py`
4. Write and run tests (can be added to `test_orders.py` or a new file)

**Status:** [x] complete — 13/13 tests pass

---

### Milestone B10 — Frontend Axios Migration

**Intent:** Wire the existing frontend to the real backend, feature-by-feature. No UI component or
page layout changes. Only service files, Redux slices, and the mock data file change.
Validate with TypeScript build after each feature migration.

**Migration workflow per feature:**
1. Backend endpoint implemented and tested (previous milestones)
2. Add service function in frontend calling Axios client
3. Update Redux slice or component to call service instead of localStorage
4. Run `npm run build` and `npx tsc --noEmit` — must pass with zero errors
5. Manual regression test of the feature

**Critical prerequisite — update `src/data/mockBooks.ts` first:**
Each book's `id` field must change from its legacy short id (`'b1'`, `'b2'`, …) to its ISBN
(e.g. `'978-81-000001-0-1'`). This is a data-only change in one file. It also cascades to
`getBookById`, `getRelatedBooks`, and any comparisons using `book.id`. After this change,
frontend deep-link URLs become `/books/978-81-000001-0-1` — matching the backend API path
`GET /api/books/{isbn}`. This must be done before any API migration so the frontend and backend
use the same identifier throughout.

**Todo List:**
1. Update `src/data/mockBooks.ts` — change every book `id` field from `'b1'`…`'b25'` to the corresponding ISBN value; verify `getBookById` and `getRelatedBooks` still work; run `npx tsc --noEmit`
2. Migrate auth: replace `mockLogin` in `authService.ts` with `POST /api/auth/login`
3. Migrate books: add `fetchBooks` async thunk in `booksSlice.ts`; remove mock data source
4. Migrate cart: add cart thunks in `cartSlice.ts`
5. Migrate addresses: replace localStorage calls in `AddressForm.tsx`
6. Migrate wishlist: add wishlist thunks in `wishlistSlice.ts`
7. Migrate reviews: replace localStorage calls in `ReviewSection.tsx`
8. Migrate checkout: replace order creation in `PaymentPage.tsx` with `POST /api/checkout`
9. Migrate orders: add order thunks in `ordersSlice.ts`
10. Migrate gift points: load from `GET /api/auth/me` in `authSlice.ts`
11. Migrate followed authors: replace localStorage calls in `WritersPage.tsx`
12. Final `npm run build` + `npx tsc --noEmit` — zero errors required
13. Full end-to-end manual test: Login → Browse → Add to Cart → Checkout → Confirmation → Orders → Cancel

**Status:** [x] complete

---

### Milestone B11 — Final Validation and Documentation

**Intent:** Run complete test suite, verify coverage, write README.

**Expected Outcomes:**
- `pytest -v` — all tests pass
- `pytest --cov=app` — coverage ≥ 80%
- FastAPI `/docs` (Swagger UI) is complete and accurate
- `README.md` covers: prerequisites, env setup, DB migration, seeding, running server, running tests
- Frontend build clean: `npm run build` zero errors

**Todo List:**
1. Run `pytest -v` — fix any failures
2. Run `pytest --cov=app` — address any gaps below 80%
3. Confirm `/docs` auto-generated correctly
4. Write `README.md`
5. Final `npm run build` on frontend — zero errors

**Status:** [x] done

---

## Feature → Endpoint → Service → Table Mapping

| Frontend Feature | API Endpoint | Service | DB Tables |
|---|---|---|---|
| Login | `POST /api/auth/login` | `auth_service.authenticate_user` | `users` |
| Register | `POST /api/auth/register` | `auth_service.create_user` | `users` |
| Current user + points | `GET /api/auth/me` | `auth_service.get_user_by_id` | `users` |
| Book catalogue | `GET /api/books` | `book_service.list_books` | `books`, `book_categories`, `categories`, `authors` |
| Book detail | `GET /api/books/{isbn}` | `book_service.get_by_id` | `books`, `authors`, `categories` |
| Related books | `GET /api/books/{isbn}/related` | `book_service.get_related` | `books`, `book_categories` |
| Recommendations | `GET /api/books/recommended` | `book_service.get_recommendations` | `books`, `orders`, `order_items` |
| Category browse | `GET /api/categories/{id}/books` | `book_service.list_by_category` | `books`, `book_categories`, `categories` |
| Add to cart | `PUT /api/cart/items/{isbn}` | `cart_service.upsert_item` | `carts`, `cart_items` |
| View cart | `GET /api/cart` | `cart_service.get_cart` | `carts`, `cart_items`, `books`, `coupons` |
| Apply coupon | `POST /api/cart/coupon` | `cart_service.apply_coupon` | `coupons`, `carts` |
| Address CRUD | `GET/POST/PUT/DELETE /api/addresses/*` | `address_service` | `addresses` |
| Wishlist | `GET/POST/DELETE /api/wishlist/{isbn}` | `wishlist_service` | `wishlists`, `books` |
| Submit review | `POST /api/books/{isbn}/reviews` | `review_service.create` | `reviews` |
| List reviews | `GET /api/books/{isbn}/reviews` | `review_service.list_for_book` | `reviews`, `users` |
| Checkout | `POST /api/checkout` | `checkout_service.execute` | `orders`, `order_items`, `payments`, `carts`, `cart_items`, `users`, `gift_point_ledger` |
| Order history | `GET /api/orders` | `order_service.list_by_user` | `orders`, `order_items` |
| Order detail | `GET /api/orders/{order_id}` | `order_service.get_by_id` | `orders`, `order_items` |
| Cancel order | `POST /api/orders/{order_id}/cancel` | `order_service.cancel` | `orders`, `users`, `gift_point_ledger` |
| Buy Again | `POST /api/orders/{order_id}/buy-again` | `order_service.buy_again` | `orders`, `order_items`, `carts`, `cart_items` |
| Gift points balance | `GET /api/gift-points` | `gift_points_service.get_balance` | `users`, `gift_point_ledger` |
| Follow author | `POST /api/followed-authors/{author_id}` | `followed_author_service.follow` | `followed_authors` |
| Unfollow author | `DELETE /api/followed-authors/{author_id}` | `followed_author_service.unfollow` | `followed_authors` |
| List followed | `GET /api/followed-authors` | `followed_author_service.list` | `followed_authors`, `authors` |
