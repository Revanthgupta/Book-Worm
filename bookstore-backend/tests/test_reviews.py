"""Tests for B7 — Reviews API."""
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
        name="Reviewer A",
        email=f"rev_a_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("pw"),
    )
    db_session.add(u)
    db_session.flush()
    return u


@pytest.fixture
def user_b(db_session):
    u = User(
        id=str(uuid.uuid4()),
        name="Reviewer B",
        email=f"rev_b_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("pw"),
    )
    db_session.add(u)
    db_session.flush()
    return u


@pytest.fixture
def book1(db_session):
    from app.models.author import Author
    aid = f"a_{uuid.uuid4().hex[:6]}"
    db_session.add(Author(id=aid, name="Rev Author", bio=""))
    b = Book(id=f"978-rv-{uuid.uuid4().hex[:6]}-1", title="Reviewable Book", author_id=aid, price=250, format="Paperback")
    db_session.add(b)
    db_session.flush()
    return b


def auth_header(user: User) -> dict:
    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestListReviews:
    def test_empty_reviews(self, client, book1):
        r = client.get(f"/api/books/{book1.id}/reviews")
        assert r.status_code == 200
        assert r.json() == []

    def test_list_reviews_public(self, client, book1, user_a):
        client.post(f"/api/books/{book1.id}/reviews", json={"rating": 4, "text": "Great book!"}, headers=auth_header(user_a))
        r = client.get(f"/api/books/{book1.id}/reviews")
        assert r.status_code == 200
        assert len(r.json()) == 1


class TestCreateReview:
    def test_create_valid_review(self, client, user_a, book1):
        r = client.post(
            f"/api/books/{book1.id}/reviews",
            json={"rating": 5, "text": "Excellent read!"},
            headers=auth_header(user_a),
        )
        assert r.status_code == 201
        data = r.json()
        assert data["rating"] == 5
        assert data["text"] == "Excellent read!"
        assert data["user_id"] == user_a.id
        assert data["user_name"] == "Reviewer A"
        assert data["book_id"] == book1.id

    def test_rating_below_1_rejected(self, client, user_a, book1):
        r = client.post(f"/api/books/{book1.id}/reviews", json={"rating": 0, "text": "Bad"}, headers=auth_header(user_a))
        assert r.status_code == 422

    def test_rating_above_5_rejected(self, client, user_a, book1):
        r = client.post(f"/api/books/{book1.id}/reviews", json={"rating": 6, "text": "Great"}, headers=auth_header(user_a))
        assert r.status_code == 422

    def test_empty_text_rejected(self, client, user_a, book1):
        r = client.post(f"/api/books/{book1.id}/reviews", json={"rating": 3, "text": ""}, headers=auth_header(user_a))
        assert r.status_code == 422

    def test_review_unknown_book_returns_404(self, client, user_a):
        r = client.post("/api/books/978-00-000000-0-0/reviews", json={"rating": 3, "text": "OK"}, headers=auth_header(user_a))
        assert r.status_code == 404

    def test_duplicate_review_returns_409(self, client, user_a, book1):
        client.post(f"/api/books/{book1.id}/reviews", json={"rating": 4, "text": "Nice"}, headers=auth_header(user_a))
        r = client.post(f"/api/books/{book1.id}/reviews", json={"rating": 3, "text": "Changed"}, headers=auth_header(user_a))
        assert r.status_code == 409

    def test_two_users_can_review_same_book(self, client, user_a, user_b, book1):
        r1 = client.post(f"/api/books/{book1.id}/reviews", json={"rating": 5, "text": "Loved it"}, headers=auth_header(user_a))
        r2 = client.post(f"/api/books/{book1.id}/reviews", json={"rating": 3, "text": "It was ok"}, headers=auth_header(user_b))
        assert r1.status_code == 201
        assert r2.status_code == 201
        r_list = client.get(f"/api/books/{book1.id}/reviews")
        assert len(r_list.json()) == 2

    def test_unauthenticated_returns_401(self, client, book1):
        r = client.post(f"/api/books/{book1.id}/reviews", json={"rating": 4, "text": "Nice"})
        assert r.status_code == 401
