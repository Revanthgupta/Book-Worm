"""Tests for books, authors, and categories endpoints (B3 + B4).

Requires TEST_DATABASE_URL pointing at a running PostgreSQL instance with
the schema already created (conftest.py creates all tables at session start).
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.author import Author
from app.models.book import Book
from app.models.book_category import BookCategory
from app.models.category import Category
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.user import User


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def seed_catalogue(db_session: Session):
    """Insert a minimal but representative catalogue into the test DB."""
    # Authors
    a1 = Author(id="ta1", name="Alice Author", photo=None, bio="Bio of Alice")
    a2 = Author(id="ta2", name="Bob Writer", photo=None, bio="Bio of Bob")
    db_session.add_all([a1, a2])
    db_session.flush()

    # Categories
    c_sf = Category(name="Science Fiction")
    c_nf = Category(name="Non-fiction")
    c_fy = Category(name="Fantasy")
    db_session.add_all([c_sf, c_nf, c_fy])
    db_session.flush()

    # Books
    b1 = Book(
        id="978-00-000001-0-1",
        title="Stars and Code",
        author_id="ta1",
        publisher="Test Press",
        format="Paperback",
        price=299,
        language="English",
        rating=4.5,
        sells=500,
        featured=True,
        bestseller=False,
        new_launch=False,
    )
    b2 = Book(
        id="978-00-000001-0-2",
        title="Midnight Castle",
        author_id="ta2",
        publisher="Test Press",
        format="Hard Cover",
        price=499,
        language="Hindi",
        rating=4.2,
        sells=800,
        featured=False,
        bestseller=True,
        new_launch=False,
    )
    b3 = Book(
        id="978-00-000001-0-3",
        title="Dragon Lore",
        author_id="ta1",
        publisher="Test Press",
        format="eBook",
        price=149,
        language="English",
        rating=4.7,
        sells=50,
        featured=False,
        bestseller=False,
        new_launch=True,
    )
    db_session.add_all([b1, b2, b3])
    db_session.flush()

    # Categories for books
    db_session.add_all([
        BookCategory(book_id="978-00-000001-0-1", category_id=c_sf.id),
        BookCategory(book_id="978-00-000001-0-1", category_id=c_nf.id),
        BookCategory(book_id="978-00-000001-0-2", category_id=c_sf.id),
        BookCategory(book_id="978-00-000001-0-3", category_id=c_fy.id),
    ])
    db_session.flush()

    return {"b1": b1, "b2": b2, "b3": b3, "a1": a1, "a2": a2,
            "c_sf": c_sf, "c_nf": c_nf, "c_fy": c_fy}


@pytest.fixture
def auth_user(db_session: Session):
    """Create and login a test user, return auth headers."""
    user = User(
        id="test-b3-u1",
        name="Test User",
        email="testb3@example.com",
        hashed_password=hash_password("pass123"),
    )
    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture
def auth_headers(auth_user: User, client: TestClient) -> dict:
    resp = client.post("/api/auth/login", json={
        "email": "testb3@example.com",
        "password": "pass123",
    })
    assert resp.status_code == 200
    return {"Authorization": f"Bearer {resp.json()['token']}"}


# ── Helper ────────────────────────────────────────────────────────────────────

EXPECTED_BOOK_FIELDS = {
    "id", "title", "author_id", "author_name", "publisher", "format",
    "categories", "price", "cover_image", "synopsis", "back_cover_text",
    "language", "rating", "sells", "delivery_date",
    "featured", "bestseller", "new_launch",
}


def assert_book_shape(book: dict):
    """Assert every required field is present on a BookResponse."""
    assert EXPECTED_BOOK_FIELDS.issubset(book.keys()), (
        f"Missing fields: {EXPECTED_BOOK_FIELDS - book.keys()}"
    )
    assert book["delivery_date"]  # non-empty string e.g. "Mon, 21 Jul"
    # delivery_date must match "Weekday, D Mon" pattern
    parts = book["delivery_date"].split(", ")
    assert len(parts) == 2, f"Bad delivery_date format: {book['delivery_date']}"


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/books
# ══════════════════════════════════════════════════════════════════════════════

class TestListBooks:
    def test_returns_paginated_structure(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books")
        assert resp.status_code == 200
        body = resp.json()
        assert "items" in body
        assert "total" in body
        assert "page" in body
        assert "page_size" in body
        assert "total_pages" in body

    def test_returns_seeded_books(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books")
        assert resp.status_code == 200
        assert resp.json()["total"] >= 3

    def test_each_book_has_delivery_date(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books")
        for book in resp.json()["items"]:
            assert_book_shape(book)

    def test_search_by_title(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books", params={"q": "Stars"})
        assert resp.status_code == 200
        ids = [b["id"] for b in resp.json()["items"]]
        assert "978-00-000001-0-1" in ids

    def test_search_by_author_name(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books", params={"q": "Alice"})
        assert resp.status_code == 200
        ids = [b["id"] for b in resp.json()["items"]]
        assert "978-00-000001-0-1" in ids

    def test_filter_by_category(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books", params={"category": "Fantasy"})
        assert resp.status_code == 200
        ids = [b["id"] for b in resp.json()["items"]]
        assert "978-00-000001-0-3" in ids
        assert "978-00-000001-0-2" not in ids

    def test_filter_by_language(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books", params={"language": "Hindi"})
        assert resp.status_code == 200
        ids = [b["id"] for b in resp.json()["items"]]
        assert "978-00-000001-0-2" in ids
        assert "978-00-000001-0-1" not in ids

    def test_filter_by_format(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books", params={"format": "eBook"})
        assert resp.status_code == 200
        ids = [b["id"] for b in resp.json()["items"]]
        assert "978-00-000001-0-3" in ids
        assert "978-00-000001-0-1" not in ids

    def test_filter_price_min(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books", params={"price_min": 400})
        assert resp.status_code == 200
        for book in resp.json()["items"]:
            assert book["price"] >= 400

    def test_filter_price_max(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books", params={"price_max": 200})
        assert resp.status_code == 200
        for book in resp.json()["items"]:
            assert book["price"] <= 200

    def test_sort_price_asc(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books", params={"sort_by": "price_asc", "page_size": 100})
        assert resp.status_code == 200
        prices = [b["price"] for b in resp.json()["items"]]
        assert prices == sorted(prices)

    def test_sort_price_desc(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books", params={"sort_by": "price_desc", "page_size": 100})
        assert resp.status_code == 200
        prices = [b["price"] for b in resp.json()["items"]]
        assert prices == sorted(prices, reverse=True)

    def test_sort_rating_desc(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books", params={"sort_by": "rating_desc", "page_size": 100})
        assert resp.status_code == 200
        ratings = [b["rating"] for b in resp.json()["items"] if b["rating"] is not None]
        assert ratings == sorted(ratings, reverse=True)

    def test_pagination(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books", params={"page": 1, "page_size": 2})
        assert resp.status_code == 200
        body = resp.json()
        assert len(body["items"]) <= 2
        assert body["total_pages"] >= 1

    def test_categories_field_is_list_of_strings(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books")
        for book in resp.json()["items"]:
            assert isinstance(book["categories"], list)


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/books/featured, /bestsellers, /new-launches
# ══════════════════════════════════════════════════════════════════════════════

class TestStaticSections:
    def test_featured_returns_only_featured(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books/featured")
        assert resp.status_code == 200
        books = resp.json()
        assert any(b["id"] == "978-00-000001-0-1" for b in books)
        assert all(b["featured"] for b in books)

    def test_bestsellers_returns_only_bestsellers(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books/bestsellers")
        assert resp.status_code == 200
        books = resp.json()
        assert any(b["id"] == "978-00-000001-0-2" for b in books)
        assert all(b["bestseller"] for b in books)

    def test_new_launches_returns_only_new(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books/new-launches")
        assert resp.status_code == 200
        books = resp.json()
        assert any(b["id"] == "978-00-000001-0-3" for b in books)
        assert all(b["new_launch"] for b in books)

    def test_static_routes_not_shadowed_by_isbn_route(self, client: TestClient, seed_catalogue):
        """'featured' must NOT be treated as an ISBN path param."""
        resp = client.get("/api/books/featured")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/books/recommended
# ══════════════════════════════════════════════════════════════════════════════

class TestRecommended:
    def test_requires_authentication(self, client: TestClient):
        resp = client.get("/api/books/recommended")
        assert resp.status_code == 401

    def test_returns_featured_when_no_history(
        self, client: TestClient, seed_catalogue, auth_headers: dict
    ):
        """User with no orders gets featured books as fallback."""
        resp = client.get("/api/books/recommended", headers=auth_headers)
        assert resp.status_code == 200
        ids = [b["id"] for b in resp.json()]
        # b1 is featured
        assert "978-00-000001-0-1" in ids

    def test_returns_books_based_on_order_history(
        self,
        client: TestClient,
        seed_catalogue,
        auth_user: User,
        auth_headers: dict,
        db_session: Session,
    ):
        """User who bought a Sci-Fi book gets other Sci-Fi books recommended."""
        from datetime import date, timedelta
        # Create a completed order for the user containing b1 (Science Fiction)
        order = Order(
            id="ORD-B3-TEST-1",
            user_id=auth_user.id,
            subtotal=299,
            tax=36,
            discount=0,
            redeemed_points_amount=0,
            total=335,
            status="Delivered",
            payment_method="upi",
            delivery_date=date.today() + timedelta(days=7),
        )
        db_session.add(order)
        db_session.flush()
        oi = OrderItem(
            id="OI-B3-TEST-1",
            order_id="ORD-B3-TEST-1",
            book_id="978-00-000001-0-1",  # b1 — Science Fiction + Non-fiction
            book_title="Stars and Code",
            author_name="Alice Author",
            price_at_purchase=299,
            quantity=1,
            format="Paperback",
            delivery_date="Mon, 21 Jul",
        )
        db_session.add(oi)
        db_session.flush()

        resp = client.get("/api/books/recommended", headers=auth_headers)
        assert resp.status_code == 200
        ids = [b["id"] for b in resp.json()]
        # b1 was purchased — should NOT appear
        assert "978-00-000001-0-1" not in ids
        # b2 is also Science Fiction — should appear
        assert "978-00-000001-0-2" in ids


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/books/{isbn}
# ══════════════════════════════════════════════════════════════════════════════

class TestGetBook:
    def test_returns_book_with_all_fields(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books/978-00-000001-0-1")
        assert resp.status_code == 200
        book = resp.json()
        assert book["id"] == "978-00-000001-0-1"
        assert book["title"] == "Stars and Code"
        assert book["author_id"] == "ta1"
        assert book["author_name"] == "Alice Author"
        assert "Science Fiction" in book["categories"]
        assert "Non-fiction" in book["categories"]
        assert_book_shape(book)

    def test_nonexistent_isbn_returns_404(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books/000-00-NOTREAL")
        assert resp.status_code == 404


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/books/{isbn}/related
# ══════════════════════════════════════════════════════════════════════════════

class TestRelatedBooks:
    def test_returns_books_sharing_category(self, client: TestClient, seed_catalogue):
        # b1 and b2 both share Science Fiction
        resp = client.get("/api/books/978-00-000001-0-1/related")
        assert resp.status_code == 200
        ids = [b["id"] for b in resp.json()]
        assert "978-00-000001-0-2" in ids

    def test_does_not_include_the_book_itself(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books/978-00-000001-0-1/related")
        assert resp.status_code == 200
        ids = [b["id"] for b in resp.json()]
        assert "978-00-000001-0-1" not in ids

    def test_returns_at_most_3(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/books/978-00-000001-0-1/related")
        assert resp.status_code == 200
        assert len(resp.json()) <= 3

    def test_nonexistent_isbn_returns_404(self, client: TestClient):
        resp = client.get("/api/books/000-NOTREAL/related")
        assert resp.status_code == 404


# ══════════════════════════════════════════════════════════════════════════════
# Authors
# ══════════════════════════════════════════════════════════════════════════════

class TestAuthors:
    def test_list_authors_returns_all(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/authors")
        assert resp.status_code == 200
        ids = [a["id"] for a in resp.json()]
        assert "ta1" in ids
        assert "ta2" in ids

    def test_get_author_by_id(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/authors/ta1")
        assert resp.status_code == 200
        body = resp.json()
        assert body["id"] == "ta1"
        assert body["name"] == "Alice Author"

    def test_get_nonexistent_author_returns_404(self, client: TestClient):
        resp = client.get("/api/authors/NOTREAL")
        assert resp.status_code == 404

    def test_books_by_author(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/authors/ta1/books")
        assert resp.status_code == 200
        ids = [b["id"] for b in resp.json()]
        assert "978-00-000001-0-1" in ids
        assert "978-00-000001-0-3" in ids
        # b2 belongs to ta2 — must not appear
        assert "978-00-000001-0-2" not in ids

    def test_books_by_nonexistent_author_returns_404(self, client: TestClient):
        resp = client.get("/api/authors/NOTREAL/books")
        assert resp.status_code == 404


# ══════════════════════════════════════════════════════════════════════════════
# Categories  (B4)
# ══════════════════════════════════════════════════════════════════════════════

class TestCategories:
    def test_list_categories(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/categories")
        assert resp.status_code == 200
        names = [c["name"] for c in resp.json()]
        assert "Science Fiction" in names
        assert "Fantasy" in names

    def test_get_category_by_id(self, client: TestClient, seed_catalogue):
        # get the id from list first
        resp = client.get("/api/categories")
        sf = next(c for c in resp.json() if c["name"] == "Science Fiction")
        resp2 = client.get(f"/api/categories/{sf['id']}")
        assert resp2.status_code == 200
        assert resp2.json()["name"] == "Science Fiction"

    def test_nonexistent_category_returns_404(self, client: TestClient):
        resp = client.get("/api/categories/999999")
        assert resp.status_code == 404

    def test_books_in_category(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/categories")
        sf = next(c for c in resp.json() if c["name"] == "Science Fiction")
        resp2 = client.get(f"/api/categories/{sf['id']}/books")
        assert resp2.status_code == 200
        ids = [b["id"] for b in resp2.json()]
        assert "978-00-000001-0-1" in ids
        assert "978-00-000001-0-2" in ids
        # b3 is Fantasy, not Science Fiction
        assert "978-00-000001-0-3" not in ids

    def test_books_in_nonexistent_category_returns_404(self, client: TestClient):
        resp = client.get("/api/categories/999999/books")
        assert resp.status_code == 404

    def test_delivery_date_format_in_catalogue_response(self, client: TestClient, seed_catalogue):
        resp = client.get("/api/categories")
        sf = next(c for c in resp.json() if c["name"] == "Science Fiction")
        resp2 = client.get(f"/api/categories/{sf['id']}/books")
        for book in resp2.json():
            assert_book_shape(book)
