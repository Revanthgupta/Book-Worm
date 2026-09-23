"""Tests for POST /api/auth/register, POST /api/auth/login,
GET /api/auth/me, PUT /api/auth/me, POST /api/auth/logout.

Requires TEST_DATABASE_URL to point at a running PostgreSQL instance.
Each test runs inside a rolled-back transaction (see conftest.py).
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def existing_user(db_session: Session) -> User:
    """A pre-existing user seeded directly into the test DB."""
    user = User(
        id="test-u1",
        name="Priya Sharma",
        email="priya@bookworm.com",
        hashed_password=hash_password("password123"),
    )
    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture
def auth_headers(existing_user: User, client: TestClient) -> dict:
    """Login and return Bearer headers for subsequent requests."""
    resp = client.post("/api/auth/login", json={
        "email": "priya@bookworm.com",
        "password": "password123",
    })
    assert resp.status_code == 200
    token = resp.json()["token"]
    return {"Authorization": f"Bearer {token}"}


# ── POST /api/auth/register ───────────────────────────────────────────────────

class TestRegister:
    def test_register_new_user_returns_201_with_user_shape(self, client: TestClient):
        resp = client.post("/api/auth/register", json={
            "name": "New User",
            "email": "new@example.com",
            "password": "secret123",
        })
        assert resp.status_code == 201
        body = resp.json()
        assert body["email"] == "new@example.com"
        assert body["name"] == "New User"
        assert "token" in body and body["token"]
        assert "id" in body and body["id"]
        assert "gift_points" in body and body["gift_points"] == 0

    def test_register_normalises_email_to_lowercase(self, client: TestClient):
        resp = client.post("/api/auth/register", json={
            "name": "Test",
            "email": "UPPER@EXAMPLE.COM",
            "password": "secret123",
        })
        assert resp.status_code == 201
        assert resp.json()["email"] == "upper@example.com"

    def test_register_duplicate_email_returns_409(
        self, client: TestClient, existing_user: User
    ):
        resp = client.post("/api/auth/register", json={
            "name": "Duplicate",
            "email": "priya@bookworm.com",
            "password": "secret123",
        })
        assert resp.status_code == 409

    def test_register_short_password_returns_422(self, client: TestClient):
        resp = client.post("/api/auth/register", json={
            "name": "Test",
            "email": "short@example.com",
            "password": "abc",
        })
        assert resp.status_code == 422

    def test_register_empty_name_returns_422(self, client: TestClient):
        resp = client.post("/api/auth/register", json={
            "name": "   ",
            "email": "test@example.com",
            "password": "secret123",
        })
        assert resp.status_code == 422

    def test_register_missing_fields_returns_422(self, client: TestClient):
        resp = client.post("/api/auth/register", json={"email": "x@x.com"})
        assert resp.status_code == 422


# ── POST /api/auth/login ──────────────────────────────────────────────────────

class TestLogin:
    def test_login_correct_credentials_returns_user_shape(
        self, client: TestClient, existing_user: User
    ):
        resp = client.post("/api/auth/login", json={
            "email": "priya@bookworm.com",
            "password": "password123",
        })
        assert resp.status_code == 200
        body = resp.json()
        # Must match frontend User type exactly
        assert body["id"] == "test-u1"
        assert body["name"] == "Priya Sharma"
        assert body["email"] == "priya@bookworm.com"
        assert body["token"] and len(body["token"]) > 20
        assert body["gift_points"] == 0

    def test_login_email_is_case_insensitive(
        self, client: TestClient, existing_user: User
    ):
        resp = client.post("/api/auth/login", json={
            "email": "PRIYA@BOOKWORM.COM",
            "password": "password123",
        })
        assert resp.status_code == 200

    def test_login_wrong_password_returns_401(
        self, client: TestClient, existing_user: User
    ):
        resp = client.post("/api/auth/login", json={
            "email": "priya@bookworm.com",
            "password": "wrongpassword",
        })
        assert resp.status_code == 401

    def test_login_unknown_email_returns_401(self, client: TestClient):
        resp = client.post("/api/auth/login", json={
            "email": "nobody@example.com",
            "password": "password123",
        })
        assert resp.status_code == 401

    def test_login_error_message_does_not_reveal_email_existence(
        self, client: TestClient, existing_user: User
    ):
        """Both wrong-email and wrong-password must return the same message."""
        resp_bad_pw = client.post("/api/auth/login", json={
            "email": "priya@bookworm.com",
            "password": "wrong",
        })
        resp_bad_email = client.post("/api/auth/login", json={
            "email": "nobody@example.com",
            "password": "wrong",
        })
        assert resp_bad_pw.json()["detail"] == resp_bad_email.json()["detail"]

    def test_login_missing_fields_returns_422(self, client: TestClient):
        resp = client.post("/api/auth/login", json={"email": "x@x.com"})
        assert resp.status_code == 422


# ── GET /api/auth/me ──────────────────────────────────────────────────────────

class TestMe:
    def test_me_with_valid_token_returns_user(
        self, client: TestClient, existing_user: User, auth_headers: dict
    ):
        resp = client.get("/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        body = resp.json()
        assert body["id"] == "test-u1"
        assert body["email"] == "priya@bookworm.com"
        assert body["name"] == "Priya Sharma"
        assert "gift_points" in body

    def test_me_without_token_returns_401(self, client: TestClient):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401

    def test_me_with_invalid_token_returns_401(self, client: TestClient):
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer not.a.real.token"},
        )
        assert resp.status_code == 401

    def test_me_with_malformed_bearer_returns_401_or_403(self, client: TestClient):
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": "NotBearer token"},
        )
        assert resp.status_code in (401, 403)


# ── PUT /api/auth/me ──────────────────────────────────────────────────────────

class TestUpdateMe:
    def test_update_name(
        self, client: TestClient, existing_user: User, auth_headers: dict
    ):
        resp = client.put(
            "/api/auth/me",
            json={"name": "Priya Updated"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Priya Updated"

    def test_update_password_allows_login_with_new_password(
        self, client: TestClient, existing_user: User, auth_headers: dict
    ):
        client.put(
            "/api/auth/me",
            json={"password": "newpassword456"},
            headers=auth_headers,
        )
        # Old password should fail
        resp = client.post("/api/auth/login", json={
            "email": "priya@bookworm.com",
            "password": "password123",
        })
        assert resp.status_code == 401
        # New password should succeed
        resp = client.post("/api/auth/login", json={
            "email": "priya@bookworm.com",
            "password": "newpassword456",
        })
        assert resp.status_code == 200

    def test_update_me_without_token_returns_401(self, client: TestClient):
        resp = client.put("/api/auth/me", json={"name": "X"})
        assert resp.status_code == 401

    def test_update_empty_name_returns_422(
        self, client: TestClient, existing_user: User, auth_headers: dict
    ):
        resp = client.put(
            "/api/auth/me",
            json={"name": "   "},
            headers=auth_headers,
        )
        assert resp.status_code == 422

    def test_update_short_password_returns_422(
        self, client: TestClient, existing_user: User, auth_headers: dict
    ):
        resp = client.put(
            "/api/auth/me",
            json={"password": "abc"},
            headers=auth_headers,
        )
        assert resp.status_code == 422


# ── POST /api/auth/logout ─────────────────────────────────────────────────────

class TestLogout:
    def test_logout_returns_200(self, client: TestClient):
        """Logout is stateless — no token required, always succeeds."""
        resp = client.post("/api/auth/logout")
        assert resp.status_code == 200
        assert resp.json() == {"message": "ok"}

    def test_logout_with_token_also_returns_200(
        self, client: TestClient, existing_user: User, auth_headers: dict
    ):
        resp = client.post("/api/auth/logout", headers=auth_headers)
        assert resp.status_code == 200

    def test_token_still_valid_after_logout(
        self, client: TestClient, existing_user: User, auth_headers: dict
    ):
        """JWT is stateless — /me still works after logout (client clears token)."""
        client.post("/api/auth/logout", headers=auth_headers)
        resp = client.get("/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200


# ── Protected-route enforcement ───────────────────────────────────────────────

class TestProtectedRouteEnforcement:
    def test_any_protected_route_without_token_returns_401(self, client: TestClient):
        """Sanity check that the Bearer dependency rejects missing credentials."""
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401

    def test_expired_token_returns_401(self, client: TestClient):
        """A known-expired JWT must be rejected."""
        # HS256 token with exp=1 (1970-01-01, always expired), signed with 'change-me'
        expired = (
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
            ".eyJzdWIiOiJ1MSIsImV4cCI6MX0"
            ".Mfbp5Gua8mVkFQhY0MvZ64yKETuOEI4hX9F8g0BaBLA"
        )
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {expired}"},
        )
        assert resp.status_code == 401
