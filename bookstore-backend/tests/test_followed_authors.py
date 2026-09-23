"""Tests for B9 — Followed Authors API."""
import uuid

import pytest

from app.core.security import create_access_token, hash_password
from app.models.author import Author
from app.models.user import User


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def user_a(db_session):
    u = User(
        id=str(uuid.uuid4()),
        name="Follow User A",
        email=f"fa_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("pw"),
    )
    db_session.add(u)
    db_session.flush()
    return u


@pytest.fixture
def user_b(db_session):
    u = User(
        id=str(uuid.uuid4()),
        name="Follow User B",
        email=f"fb_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("pw"),
    )
    db_session.add(u)
    db_session.flush()
    return u


@pytest.fixture
def author1(db_session):
    a = Author(id=f"a_{uuid.uuid4().hex[:6]}", name="Follow Author One", bio="Bio 1")
    db_session.add(a)
    db_session.flush()
    return a


@pytest.fixture
def author2(db_session):
    a = Author(id=f"a_{uuid.uuid4().hex[:6]}", name="Follow Author Two", bio="Bio 2")
    db_session.add(a)
    db_session.flush()
    return a


def auth_header(user: User) -> dict:
    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestListFollowed:
    def test_empty_list(self, client, user_a):
        r = client.get("/api/authors/followed", headers=auth_header(user_a))
        assert r.status_code == 200
        assert r.json() == []

    def test_unauthenticated_returns_401(self, client):
        r = client.get("/api/authors/followed")
        assert r.status_code == 401


class TestFollowAuthor:
    def test_follow_author(self, client, user_a, author1):
        r = client.post(f"/api/authors/followed/{author1.id}", headers=auth_header(user_a))
        assert r.status_code == 201
        data = r.json()
        assert data["author_id"] == author1.id
        assert data["name"] == "Follow Author One"

    def test_followed_appears_in_list(self, client, user_a, author1):
        client.post(f"/api/authors/followed/{author1.id}", headers=auth_header(user_a))
        r = client.get("/api/authors/followed", headers=auth_header(user_a))
        assert len(r.json()) == 1
        assert r.json()[0]["author_id"] == author1.id

    def test_follow_unknown_author_returns_404(self, client, user_a):
        r = client.post("/api/authors/followed/a_notexist", headers=auth_header(user_a))
        assert r.status_code == 404

    def test_follow_duplicate_returns_409(self, client, user_a, author1):
        client.post(f"/api/authors/followed/{author1.id}", headers=auth_header(user_a))
        r = client.post(f"/api/authors/followed/{author1.id}", headers=auth_header(user_a))
        assert r.status_code == 409

    def test_follow_multiple_authors(self, client, user_a, author1, author2):
        client.post(f"/api/authors/followed/{author1.id}", headers=auth_header(user_a))
        client.post(f"/api/authors/followed/{author2.id}", headers=auth_header(user_a))
        r = client.get("/api/authors/followed", headers=auth_header(user_a))
        assert len(r.json()) == 2

    def test_unauthenticated_returns_401(self, client, author1):
        r = client.post(f"/api/authors/followed/{author1.id}")
        assert r.status_code == 401


class TestUnfollowAuthor:
    def test_unfollow_author(self, client, user_a, author1):
        client.post(f"/api/authors/followed/{author1.id}", headers=auth_header(user_a))
        r = client.delete(f"/api/authors/followed/{author1.id}", headers=auth_header(user_a))
        assert r.status_code == 204
        r2 = client.get("/api/authors/followed", headers=auth_header(user_a))
        assert r2.json() == []

    def test_unfollow_not_followed_returns_404(self, client, user_a, author1):
        r = client.delete(f"/api/authors/followed/{author1.id}", headers=auth_header(user_a))
        assert r.status_code == 404

    def test_unauthenticated_returns_401(self, client, author1):
        r = client.delete(f"/api/authors/followed/{author1.id}")
        assert r.status_code == 401


class TestFollowedAuthorIsolation:
    def test_user_a_cannot_see_user_b_follows(self, client, user_a, user_b, author1):
        client.post(f"/api/authors/followed/{author1.id}", headers=auth_header(user_b))
        r = client.get("/api/authors/followed", headers=auth_header(user_a))
        assert r.json() == []

    def test_unfollow_does_not_affect_other_user(self, client, user_a, user_b, author1):
        client.post(f"/api/authors/followed/{author1.id}", headers=auth_header(user_a))
        client.post(f"/api/authors/followed/{author1.id}", headers=auth_header(user_b))
        client.delete(f"/api/authors/followed/{author1.id}", headers=auth_header(user_a))
        r = client.get("/api/authors/followed", headers=auth_header(user_b))
        assert len(r.json()) == 1
