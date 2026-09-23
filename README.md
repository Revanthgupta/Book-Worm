# Book Worm — Online Bookstore

A full-stack Online Bookstore application built as an IBM BOB capstone project.

![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20TypeScript-blue)
![Backend](https://img.shields.io/badge/backend-FastAPI%20%2B%20PostgreSQL-green)
![Tests](https://img.shields.io/badge/tests-175%20passed-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Frontend](#frontend)
  - [Tech Stack](#frontend-tech-stack)
  - [Prerequisites](#frontend-prerequisites)
  - [Setup & Running](#frontend-setup--running)
  - [Available Scripts](#available-scripts)
  - [Project Structure](#frontend-project-structure)
  - [Route Reference](#route-reference)
- [Backend](#backend)
  - [Tech Stack](#backend-tech-stack)
  - [Prerequisites](#backend-prerequisites)
  - [Setup & Running](#backend-setup--running)
  - [Running Tests](#running-tests)
  - [Project Structure](#backend-project-structure)
  - [API Reference](#api-reference)
  - [Mock Payment Rules](#mock-payment-rules)
- [Demo Data](#demo-data)
- [Environment Variables](#environment-variables)

---

## Overview

Book Worm lets customers browse books, manage a shopping cart, complete a simulated checkout, view order history, maintain a wishlist, and follow favourite authors — all from a responsive React frontend backed by a FastAPI REST API.

---

## Architecture

```
Browser (React + Vite)
      │  HTTP / REST
      ▼
FastAPI  (localhost:8000)
      │  SQLAlchemy ORM
      ▼
PostgreSQL  (localhost:5432)
```

- **Frontend** — React 19, TypeScript, Tailwind CSS, Redux Toolkit, React Router, Axios. Runs on `http://localhost:5173`.
- **Backend** — FastAPI, SQLAlchemy, Alembic, bcrypt, JWT. Runs on `http://localhost:8000`.
- **Database** — PostgreSQL 15 with 15 tables and Alembic-managed migrations.

---

## Frontend

### Frontend Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 |
| State management | Redux Toolkit + React Redux |
| Routing | React Router v7 |
| HTTP client | Axios |
| Bundler | Vite 8 |
| Linter | oxlint |
| Persistence | localStorage (via `storageService`) |

### Frontend Prerequisites

- Node.js 18+
- npm 9+

### Frontend Setup & Running

```bash
# 1 — Install dependencies
npm install

# 2 — (Optional) connect to the local backend
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env

# 3 — Start development server
npm run dev
```

The app is available at **http://localhost:5173**.

> Without `VITE_API_BASE_URL`, the Axios client defaults to `/api` (proxy mode). The app runs on mock/localStorage data without a running backend.

### Available Scripts

```bash
npm run dev        # Vite dev server with HMR
npm run build      # TypeScript check + production build  (tsc -b && vite build)
npm run lint       # oxlint static analysis
npm run preview    # Preview the production build locally
npx tsc -b --noEmit  # Standalone TypeScript type check
```

### Frontend Project Structure

```
src/
├── components/          # Global reusable components (Header, Footer, BookCard, …)
├── features/
│   ├── authentication/  # Login logic, auth slice, auth service
│   ├── books/           # Books service, books slice, search/filter hooks
│   ├── cart/            # Cart slice, cart service, cart components
│   ├── orders/          # Orders slice, orders service, order components
│   └── payment/         # Payment service, payment components
├── hooks/               # Shared custom React hooks
├── pages/               # Route-level page components
│   ├── HomePage.tsx
│   ├── ProductDetailPage.tsx
│   ├── CartPage.tsx
│   ├── PaymentPage.tsx
│   ├── ConfirmationPage.tsx
│   ├── OrdersPage.tsx
│   ├── OrderDetailPage.tsx
│   ├── WishlistPage.tsx
│   ├── WritersPage.tsx
│   ├── LoginPage.tsx
│   └── NotFoundPage.tsx
├── services/
│   └── axiosClient.ts   # Axios instance — reads VITE_API_BASE_URL, injects Bearer token
├── storage/
│   ├── storageKeys.ts   # Typed bw_* localStorage key constants
│   └── storageService.ts # Centralised localStorage read/write abstraction
├── store/               # Redux store configuration and root reducer
├── types/               # Shared TypeScript interfaces and types
├── App.tsx              # Router setup and route definitions
└── main.tsx             # React root render
```

### Route Reference

| Path | Access | Page |
|---|---|---|
| `/` | Public | Home |
| `/books/:id` | Public | Product Detail |
| `/cart` | Protected | Shopping Cart |
| `/payment` | Protected | Payment |
| `/confirmation` | Protected | Order Confirmation |
| `/orders` | Protected | Order History |
| `/orders/:id` | Protected | Order Detail |
| `/wishlist` | Protected | Wishlist |
| `/writers` | Protected | Followed Authors |
| `/login` | Public | Login / Register |

> **Inline auth gate:** "Add to Cart" and "Add to Wishlist" on `/books/:id` redirect unauthenticated users to `/login` with `state: { from: location }`.

---

## Backend

### Backend Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Language | Python 3.11+ |
| ORM | SQLAlchemy 2 |
| Migrations | Alembic |
| Database | PostgreSQL 15 |
| Auth | JWT (python-jose) + bcrypt |
| Testing | pytest + pytest-cov |

### Backend Prerequisites

- Python 3.11+
- PostgreSQL 15+ running locally

### Backend Setup & Running

```bash
cd bookstore-backend

# 1 — Create databases
psql -U postgres -c "CREATE DATABASE bookstore;"
psql -U postgres -c "CREATE DATABASE bookstore_test;"

# 2 — Configure environment
cp .env.example .env
# Edit .env — see Environment Variables section below

# 3 — Create virtual environment and install dependencies
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt

# 4 — Run database migrations
alembic upgrade head

# 5 — Seed demo data
python -m seed.seed

# 6 — Start the API server
uvicorn app.main:app --reload
```

| Endpoint | URL |
|---|---|
| API base | http://localhost:8000/api |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Health check | http://localhost:8000/api/health |

### Running Tests

```bash
cd bookstore-backend

# Run all 175 tests
pytest -v

# Run with coverage report
pytest --cov=app --cov-report=term-missing

# Run a single test file
pytest tests/test_auth.py -v

# Run a single test method
pytest tests/test_auth.py::test_login_success -v
```

**Current results:** 175 passed · 98% coverage

Tests use `TEST_DATABASE_URL` and roll back every transaction — no test data persists between runs.

### Backend Project Structure

```
bookstore-backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, health check
│   ├── config.py            # Settings loaded from .env
│   ├── database.py          # SQLAlchemy engine + declarative Base
│   ├── dependencies.py      # get_db, get_current_user
│   ├── core/
│   │   └── security.py      # JWT creation/verification + bcrypt hashing
│   ├── models/              # 15 SQLAlchemy ORM models
│   ├── schemas/             # Pydantic request/response schemas
│   ├── routers/             # FastAPI route handlers (one file per domain)
│   └── services/            # Business logic (one file per domain)
├── alembic/                 # Alembic migration environment
│   └── versions/            # Individual migration scripts
├── seed/
│   └── seed.py              # Demo data seed (categories, authors, books, users, coupons)
├── tests/                   # pytest suite (175 tests, 98% coverage)
│   ├── conftest.py
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

### API Reference

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <token>`.

#### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account; returns user + JWT |
| POST | `/auth/login` | — | Sign in; returns user + JWT |
| GET | `/auth/me` | ✓ | Current user profile + gift-points balance |
| PATCH | `/auth/me` | ✓ | Update name or password |
| POST | `/auth/logout` | — | No-op (stateless JWT) |

#### Books & Catalogue

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/books` | — | List / search / filter books (paginated) |
| GET | `/books/featured` | — | Featured books |
| GET | `/books/bestsellers` | — | Bestseller books |
| GET | `/books/new-launches` | — | New-launch books |
| GET | `/books/recommended` | ✓ | Personalised recommendations |
| GET | `/books/{isbn}` | — | Single book detail |
| GET | `/books/{isbn}/related` | — | Related books (same category, max 3) |
| GET | `/books/{isbn}/reviews` | — | Reviews for a book |
| POST | `/books/{isbn}/reviews` | ✓ | Submit a review (one per user per book) |

#### Categories & Authors

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/categories` | — | All categories |
| GET | `/categories/{id}` | — | Single category |
| GET | `/categories/{id}/books` | — | Books in a category |
| GET | `/authors` | — | All authors |
| GET | `/authors/{id}` | — | Single author |
| GET | `/authors/{id}/books` | — | Books by an author |

#### Cart

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/cart` | ✓ | View cart with totals |
| PUT | `/cart/items/{isbn}` | ✓ | Add / update item quantity |
| DELETE | `/cart/items/{isbn}` | ✓ | Remove item |
| DELETE | `/cart` | ✓ | Clear cart |
| POST | `/cart/coupon` | ✓ | Apply coupon code |
| DELETE | `/cart/coupon` | ✓ | Remove coupon |

#### Addresses

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/addresses` | ✓ | List saved addresses |
| POST | `/addresses` | ✓ | Create address |
| GET | `/addresses/{id}` | ✓ | Get address |
| PUT | `/addresses/{id}` | ✓ | Update address |
| DELETE | `/addresses/{id}` | ✓ | Delete address |

#### Wishlist

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/wishlist` | ✓ | List wishlisted books |
| POST | `/wishlist/{isbn}` | ✓ | Add book to wishlist |
| DELETE | `/wishlist/{isbn}` | ✓ | Remove book from wishlist |

#### Checkout & Orders

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/checkout` | ✓ | Complete purchase; clears cart, awards points |
| GET | `/orders` | ✓ | Order history |
| GET | `/orders/{order_id}` | ✓ | Order detail |
| POST | `/orders/{order_id}/cancel` | ✓ | Cancel within 48 hours |
| POST | `/orders/{order_id}/buy-again` | ✓ | Re-add order items to cart |

#### Gift Points & Followed Authors

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/gift-points` | ✓ | Current points balance |
| GET | `/followed-authors` | ✓ | List followed authors |
| POST | `/followed-authors/{author_id}` | ✓ | Follow an author |
| DELETE | `/followed-authors/{author_id}` | ✓ | Unfollow an author |

### Mock Payment Rules

`payment_service.simulate()` returns deterministic results without a real gateway:

| Trigger | Result |
|---|---|
| Card number ends in `0000` | Payment fails → HTTP 402 |
| Any other card number | Payment succeeds |
| UPI / Wallet / Net Banking / COD | Always succeeds |

---

## Demo Data

Seeded by `python -m seed.seed`:

- 25 categories · 9 authors · 25 books (ISBN as primary key) · 4 coupons · 3 demo users

### Demo Accounts

| Email | Password |
|---|---|
| priya@bookworm.com | password123 |
| rahul@bookworm.com | password123 |
| ananya@bookworm.com | password123 |

### Demo Coupons

| Code | Discount |
|---|---|
| BOOK10 | ₹10 |
| SAVE50 | ₹50 |
| READ100 | ₹100 |
| WORM20 | ₹20 |

---

## Environment Variables

### Frontend — `.env` (project root)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Backend API base URL |

### Backend — `bookstore-backend/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | PostgreSQL connection string for production DB |
| `TEST_DATABASE_URL` | ✓ | PostgreSQL connection string for test DB |
| `SECRET_KEY` | ✓ | JWT signing secret — generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ACCESS_TOKEN_EXPIRE_DAYS` | — | JWT lifetime in days (default: `7`) |
| `FRONTEND_ORIGIN` | — | CORS allowed origin (default: `http://localhost:5173`) |

Example `bookstore-backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/bookstore
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/bookstore_test
SECRET_KEY=<generate with the command above>
ACCESS_TOKEN_EXPIRE_DAYS=7
FRONTEND_ORIGIN=http://localhost:5173
```
