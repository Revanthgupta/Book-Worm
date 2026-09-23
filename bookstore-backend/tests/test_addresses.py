"""Tests for B6 — Addresses API."""
import uuid

import pytest

from app.core.security import create_access_token, hash_password
from app.models.user import User


# ── Fixtures ──────────────────────────────────────────────────────────────────

VALID_ADDRESS = {
    "first_name": "Priya",
    "last_name": "Sharma",
    "address_line": "12, MG Road, Bangalore",
    "email": "priya@test.com",
    "city": "Bangalore",
    "pin": "560001",
    "phone": "9876543210",
    "state": "Karnataka",
}


@pytest.fixture
def user_a(db_session):
    u = User(
        id=str(uuid.uuid4()),
        name="Addr User A",
        email=f"addr_a_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("pw"),
    )
    db_session.add(u)
    db_session.flush()
    return u


@pytest.fixture
def user_b(db_session):
    u = User(
        id=str(uuid.uuid4()),
        name="Addr User B",
        email=f"addr_b_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("pw"),
    )
    db_session.add(u)
    db_session.flush()
    return u


def auth_header(user: User) -> dict:
    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestListAddresses:
    def test_empty_list(self, client, user_a):
        r = client.get("/api/addresses", headers=auth_header(user_a))
        assert r.status_code == 200
        assert r.json() == []

    def test_unauthenticated_returns_401(self, client):
        r = client.get("/api/addresses")
        assert r.status_code == 401


class TestCreateAddress:
    def test_create_valid_address(self, client, user_a):
        r = client.post("/api/addresses", json=VALID_ADDRESS, headers=auth_header(user_a))
        assert r.status_code == 201
        data = r.json()
        assert data["first_name"] == "Priya"
        assert data["city"] == "Bangalore"
        assert data["pin"] == "560001"
        assert "id" in data

    def test_created_address_appears_in_list(self, client, user_a):
        client.post("/api/addresses", json=VALID_ADDRESS, headers=auth_header(user_a))
        r = client.get("/api/addresses", headers=auth_header(user_a))
        assert len(r.json()) == 1

    def test_invalid_email_rejected(self, client, user_a):
        bad = {**VALID_ADDRESS, "email": "not-an-email"}
        r = client.post("/api/addresses", json=bad, headers=auth_header(user_a))
        assert r.status_code == 422

    def test_invalid_pin_rejected(self, client, user_a):
        bad = {**VALID_ADDRESS, "pin": "12345"}  # 5 digits instead of 6
        r = client.post("/api/addresses", json=bad, headers=auth_header(user_a))
        assert r.status_code == 422

    def test_pin_with_letters_rejected(self, client, user_a):
        bad = {**VALID_ADDRESS, "pin": "56000A"}
        r = client.post("/api/addresses", json=bad, headers=auth_header(user_a))
        assert r.status_code == 422

    def test_missing_required_field_rejected(self, client, user_a):
        bad = {k: v for k, v in VALID_ADDRESS.items() if k != "city"}
        r = client.post("/api/addresses", json=bad, headers=auth_header(user_a))
        assert r.status_code == 422

    def test_unauthenticated_returns_401(self, client):
        r = client.post("/api/addresses", json=VALID_ADDRESS)
        assert r.status_code == 401

    def test_set_as_default_clears_previous_default(self, client, user_a):
        r1 = client.post("/api/addresses", json={**VALID_ADDRESS, "is_default": True}, headers=auth_header(user_a))
        id1 = r1.json()["id"]
        r2 = client.post("/api/addresses", json={**VALID_ADDRESS, "is_default": True}, headers=auth_header(user_a))
        id2 = r2.json()["id"]
        # Only the second should be default
        r_list = client.get("/api/addresses", headers=auth_header(user_a))
        addresses = {a["id"]: a for a in r_list.json()}
        assert addresses[id1]["is_default"] is False
        assert addresses[id2]["is_default"] is True


class TestGetAddress:
    def test_get_own_address(self, client, user_a):
        create_r = client.post("/api/addresses", json=VALID_ADDRESS, headers=auth_header(user_a))
        addr_id = create_r.json()["id"]
        r = client.get(f"/api/addresses/{addr_id}", headers=auth_header(user_a))
        assert r.status_code == 200
        assert r.json()["id"] == addr_id

    def test_get_nonexistent_returns_404(self, client, user_a):
        r = client.get(f"/api/addresses/{uuid.uuid4()}", headers=auth_header(user_a))
        assert r.status_code == 404

    def test_get_other_user_address_returns_403(self, client, user_a, user_b):
        r = client.post("/api/addresses", json=VALID_ADDRESS, headers=auth_header(user_b))
        addr_id = r.json()["id"]
        r2 = client.get(f"/api/addresses/{addr_id}", headers=auth_header(user_a))
        assert r2.status_code == 403


class TestUpdateAddress:
    def test_update_own_address(self, client, user_a):
        r = client.post("/api/addresses", json=VALID_ADDRESS, headers=auth_header(user_a))
        addr_id = r.json()["id"]
        updated = {**VALID_ADDRESS, "city": "Mumbai"}
        r2 = client.put(f"/api/addresses/{addr_id}", json=updated, headers=auth_header(user_a))
        assert r2.status_code == 200
        assert r2.json()["city"] == "Mumbai"

    def test_update_nonexistent_returns_404(self, client, user_a):
        r = client.put(f"/api/addresses/{uuid.uuid4()}", json=VALID_ADDRESS, headers=auth_header(user_a))
        assert r.status_code == 404

    def test_update_other_user_address_returns_403(self, client, user_a, user_b):
        r = client.post("/api/addresses", json=VALID_ADDRESS, headers=auth_header(user_b))
        addr_id = r.json()["id"]
        r2 = client.put(f"/api/addresses/{addr_id}", json=VALID_ADDRESS, headers=auth_header(user_a))
        assert r2.status_code == 403


class TestDeleteAddress:
    def test_delete_own_address(self, client, user_a):
        r = client.post("/api/addresses", json=VALID_ADDRESS, headers=auth_header(user_a))
        addr_id = r.json()["id"]
        r2 = client.delete(f"/api/addresses/{addr_id}", headers=auth_header(user_a))
        assert r2.status_code == 204
        # Confirm gone
        r3 = client.get(f"/api/addresses/{addr_id}", headers=auth_header(user_a))
        assert r3.status_code == 404

    def test_delete_nonexistent_returns_404(self, client, user_a):
        r = client.delete(f"/api/addresses/{uuid.uuid4()}", headers=auth_header(user_a))
        assert r.status_code == 404

    def test_delete_other_user_address_returns_403(self, client, user_a, user_b):
        r = client.post("/api/addresses", json=VALID_ADDRESS, headers=auth_header(user_b))
        addr_id = r.json()["id"]
        r2 = client.delete(f"/api/addresses/{addr_id}", headers=auth_header(user_a))
        assert r2.status_code == 403

    def test_unauthenticated_returns_401(self, client):
        r = client.delete(f"/api/addresses/{uuid.uuid4()}")
        assert r.status_code == 401
