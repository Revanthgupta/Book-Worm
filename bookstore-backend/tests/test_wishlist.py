"""Tests for B7 — Wishlist API."""
import uuid

import pytest

from app.core.security import create_access_token, hash_password
from app.models.book import Book
from app.models.user import User


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def user_a(db_session):
    u = User(
        id=str(uuid.uuid4()),
        name="Wishlist User A",
        email=f"wl_a_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("pw"),
    )
    db_session.add(u)
    db_session.flush()
    return u


@pytest.fixture
def user_b(db_session):
    u = User(
        id=str(uuid.uuid4()),
        name="Wishlist User B",
        email=f"wl_b_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("pw"),
    )
    db_session.add(u)
    db_session.flush()
    return u


@pytest.fixture
def book1(db_session):
    from app.models.author import Author
    aid = f"a_{uuid.uuid4().hex[:6]}"
    db_session.add(Author(id=aid, name="WL Author", bio=""))
    b = Book(id=f"978-wl-{uuid.uuid4().hex[:6]}-1", title="WL Book One", author_id=aid, price=300, format="Paperback")
    db_session.add(b)
    db_session.flush()
    return b


@pytest.fixture
def book2(db_session):
    from app.models.author import Author
    aid = f"a_{uuid.uuid4().hex[:6]}"
    db_session.add(Author(id=aid, name="WL Author 2", bio=""))
    b = Book(id=f"978-wl-{uuid.uuid4().hex[:6]}-2", title="WL Book Two", author_id=aid, price=199, format="Paperback")
    db_session.add(b)
    db_session.flush()
    return b


def auth_header(user: User) -> dict:
    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestListWishlist:
    def test_empty_wishlist(self, client, user_a):
        r = client.get("/api/wishlist", headers=auth_header(user_a))
        assert r.status_code == 200
        assert r.json() == []

    def test_unauthenticated_returns_401(self, client):
        r = client.get("/api/wishlist")
        assert r.status_code == 401


class TestAddToWishlist:
    def test_add_book(self, client, user_a, book1):
        r = client.post(f"/api/wishlist/{book1.id}", headers=auth_header(user_a))
        assert r.status_code == 201
        data = r.json()
        assert data["book_id"] == book1.id
        assert data["title"] == "WL Book One"
        assert data["price"] == 300.0

    def test_added_book_appears_in_list(self, client, user_a, book1):
        client.post(f"/api/wishlist/{book1.id}", headers=auth_header(user_a))
        r = client.get("/api/wishlist", headers=auth_header(user_a))
        assert len(r.json()) == 1
        assert r.json()[0]["book_id"] == book1.id

    def test_add_unknown_book_returns_404(self, client, user_a):
        r = client.post("/api/wishlist/978-00-000000-0-0", headers=auth_header(user_a))
        assert r.status_code == 404

    def test_add_duplicate_returns_409(self, client, user_a, book1):
        client.post(f"/api/wishlist/{book1.id}", headers=auth_header(user_a))
        r = client.post(f"/api/wishlist/{book1.id}", headers=auth_header(user_a))
        assert r.status_code == 409

    def test_unauthenticated_returns_401(self, client, book1):
        r = client.post(f"/api/wishlist/{book1.id}")
        assert r.status_code == 401


class TestRemoveFromWishlist:
    def test_remove_book(self, client, user_a, book1):
        client.post(f"/api/wishlist/{book1.id}", headers=auth_header(user_a))
        r = client.delete(f"/api/wishlist/{book1.id}", headers=auth_header(user_a))
        assert r.status_code == 204
        r2 = client.get("/api/wishlist", headers=auth_header(user_a))
        assert r2.json() == []

    def test_remove_not_wishlisted_returns_404(self, client, user_a, book1):
        r = client.delete(f"/api/wishlist/{book1.id}", headers=auth_header(user_a))
        assert r.status_code == 404

    def test_unauthenticated_returns_401(self, client, book1):
        r = client.delete(f"/api/wishlist/{book1.id}")
        assert r.status_code == 401


class TestWishlistIsolation:
    def test_user_a_cannot_see_user_b_wishlist(self, client, user_a, user_b, book1):
        client.post(f"/api/wishlist/{book1.id}", headers=auth_header(user_b))
        r = client.get("/api/wishlist", headers=auth_header(user_a))
        assert r.json() == []

    def test_multiple_books(self, client, user_a, book1, book2):
        client.post(f"/api/wishlist/{book1.id}", headers=auth_header(user_a))
        client.post(f"/api/wishlist/{book2.id}", headers=auth_header(user_a))
        r = client.get("/api/wishlist", headers=auth_header(user_a))
        assert len(r.json()) == 2
