# Book Worm — Backend

FastAPI + PostgreSQL backend for the Book Worm Online Bookstore.

![Tests](https://img.shields.io/badge/tests-175%20passed-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen)
![Python](https://img.shields.io/badge/python-3.11%2B-blue)

## Prerequisites

- Python 3.11+
- PostgreSQL 15+ running locally
- Node.js 18+ (for the frontend, separate)

## Setup

### 1 — Create databases

```sql
CREATE DATABASE bookstore;
CREATE DATABASE bookstore_test;
```

### 2 — Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your actual values:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/bookstore
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/bookstore_test
SECRET_KEY=<run: python -c "import secrets; print(secrets.token_hex(32))">
ACCESS_TOKEN_EXPIRE_DAYS=7
FRONTEND_ORIGIN=http://localhost:5173
```

### 3 — Create virtual environment and install dependencies

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 4 — Run database migration

```bash
alembic upgrade head
```

This creates all 15 tables in `bookstore`.

### 5 — Seed demo data

```bash
python -m seed.seed
```

Populates: 25 categories, 9 authors, 25 books (ISBN as PK), 4 coupons, 3 demo users.

**Demo accounts:**

| Email | Password |
|---|---|
| priya@bookworm.com | password123 |
| rahul@bookworm.com | password123 |
| ananya@bookworm.com | password123 |

**Demo coupons:**

| Code | Discount |
|---|---|
| BOOK10 | ₹10 |
| SAVE50 | ₹50 |
| READ100 | ₹100 |
| WORM20 | ₹20 |

### 6 — Run the server

```bash
uvicorn app.main:app --reload
```

- API base: `http://localhost:8000/api`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/api/health`

## Running Tests

```bash
# Run all tests (175 tests, ~42 s)
pytest -v

# Run with coverage report
pytest --cov=app --cov-report=term-missing

# Run a specific test file
pytest tests/test_auth.py -v
```

Tests use `TEST_DATABASE_URL` and roll back each test transaction — no test data persists between tests.

**Current results:** 175 passed · 98% coverage

## API Reference

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account; returns user + JWT |
| POST | `/auth/login` | — | Sign in; returns user + JWT |
| GET | `/auth/me` | ✓ | Current user profile + gift-points balance |
| PATCH | `/auth/me` | ✓ | Update name or password |
| POST | `/auth/logout` | — | No-op (stateless JWT) |

### Books & Catalogue

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/books` | — | List/search/filter books (paginated) |
| GET | `/books/featured` | — | Featured books |
| GET | `/books/bestsellers` | — | Bestseller books |
| GET | `/books/new-launches` | — | New-launch books |
| GET | `/books/recommended` | ✓ | Personalised recommendations |
| GET | `/books/{isbn}` | — | Single book detail |
| GET | `/books/{isbn}/related` | — | Related books (same category, max 3) |
| GET | `/books/{isbn}/reviews` | — | Reviews for a book |
| POST | `/books/{isbn}/reviews` | ✓ | Submit a review (one per user per book) |

### Categories & Authors

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/categories` | — | All categories |
| GET | `/categories/{id}` | — | Single category |
| GET | `/categories/{id}/books` | — | Books in a category |
| GET | `/authors` | — | All authors |
| GET | `/authors/{id}` | — | Single author |
| GET | `/authors/{id}/books` | — | Books by an author |

### Cart

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/cart` | ✓ | View cart with totals |
| PUT | `/cart/items/{isbn}` | ✓ | Add / update item quantity |
| DELETE | `/cart/items/{isbn}` | ✓ | Remove item |
| DELETE | `/cart` | ✓ | Clear cart |
| POST | `/cart/coupon` | ✓ | Apply coupon code |
| DELETE | `/cart/coupon` | ✓ | Remove coupon |

### Addresses

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/addresses` | ✓ | List saved addresses |
| POST | `/addresses` | ✓ | Create address |
| GET | `/addresses/{id}` | ✓ | Get address |
| PUT | `/addresses/{id}` | ✓ | Update address |
| DELETE | `/addresses/{id}` | ✓ | Delete address |

### Wishlist

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/wishlist` | ✓ | List wishlisted books |
| POST | `/wishlist/{isbn}` | ✓ | Add book to wishlist |
| DELETE | `/wishlist/{isbn}` | ✓ | Remove book from wishlist |

### Checkout & Orders

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/checkout` | ✓ | Complete purchase; clears cart, awards points |
| GET | `/orders` | ✓ | Order history |
| GET | `/orders/{order_id}` | ✓ | Order detail |
| POST | `/orders/{order_id}/cancel` | ✓ | Cancel within 48 hours |
| POST | `/orders/{order_id}/buy-again` | ✓ | Re-add order items to cart |

### Gift Points & Followed Authors

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/gift-points` | ✓ | Current points balance |
| GET | `/followed-authors` | ✓ | List followed authors |
| POST | `/followed-authors/{author_id}` | ✓ | Follow an author |
| DELETE | `/followed-authors/{author_id}` | ✓ | Unfollow an author |

## Mock Payment — Deterministic Rules

`payment_service.simulate()` returns predictable results without hitting a real gateway:

| Trigger | Result |
|---|---|
| Card number ends in `0000` | Payment fails → HTTP 402 |
| Any other card number | Payment succeeds |
| UPI / Wallet / Net Banking / COD | Always succeeds |

## Frontend Integration

The frontend Vite dev server is configured with:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Add this to `.env` at the project root (`Online_Bookstore/`).

## Project Structure

```
bookstore-backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, health check
│   ├── config.py            # Settings from .env
│   ├── database.py          # SQLAlchemy engine + Base
│   ├── dependencies.py      # get_db, get_current_user
│   ├── core/
│   │   └── security.py      # JWT creation/verification + bcrypt hashing
│   ├── models/              # 15 SQLAlchemy ORM models
│   ├── schemas/             # Pydantic request/response models
│   ├── routers/             # FastAPI route handlers (one file per domain)
│   └── services/            # Business logic (one file per domain)
├── alembic/                 # Database migrations
│   └── versions/            # Migration scripts
├── seed/                    # Demo data seed script
│   └── seed.py
├── tests/                   # pytest test suite (175 tests, 98% coverage)
│   ├── conftest.py          # In-memory test DB + fixtures
│   ├── test_auth.py
│   ├── test_books.py
│   ├── test_cart.py
│   ├── test_checkout.py
│   ├── test_addresses.py
│   ├── test_wishlist.py
│   ├── test_reviews.py
│   └── test_followed_authors.py
├── .env.example
├── alembic.ini
└── requirements.txt
```
