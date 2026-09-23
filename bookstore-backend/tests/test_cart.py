"""Tests for B5 — Cart API."""
import uuid

import pytest

from app.core.security import create_access_token, hash_password
from app.models.book import Book
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.coupon import Coupon
from app.models.user import User


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def user_a(db_session):
    u = User(
        id=str(uuid.uuid4()),
        name="Cart User A",
        email=f"cart_a_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("pw"),
    )
    db_session.add(u)
    db_session.flush()
    return u


@pytest.fixture
def user_b(db_session):
    u = User(
        id=str(uuid.uuid4()),
        name="Cart User B",
        email=f"cart_b_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("pw"),
    )
    db_session.add(u)
    db_session.flush()
    return u


@pytest.fixture
def book1(db_session):
    from app.models.author import Author
    author_id = f"a_{uuid.uuid4().hex[:6]}"
    author = Author(id=author_id, name="Test Author", bio="Bio")
    db_session.add(author)
    b = Book(
        id=f"978-99-{uuid.uuid4().hex[:6]}-0-1",
        title="Test Book One",
        author_id=author_id,
        price=200,
        format="Paperback",
    )
    db_session.add(b)
    db_session.flush()
    return b


@pytest.fixture
def book2(db_session):
    from app.models.author import Author
    author_id = f"a_{uuid.uuid4().hex[:6]}"
    author = Author(id=author_id, name="Test Author 2", bio="Bio")
    db_session.add(author)
    b = Book(
        id=f"978-99-{uuid.uuid4().hex[:6]}-0-2",
        title="Test Book Two",
        author_id=author_id,
        price=500,
        format="Paperback",
    )
    db_session.add(b)
    db_session.flush()
    return b


@pytest.fixture
def coupon(db_session):
    c = Coupon(code=f"TEST{uuid.uuid4().hex[:4].upper()}", discount_amount=50, is_active=True)
    db_session.add(c)
    db_session.flush()
    return c


@pytest.fixture
def inactive_coupon(db_session):
    c = Coupon(code=f"OFF{uuid.uuid4().hex[:4].upper()}", discount_amount=30, is_active=False)
    db_session.add(c)
    db_session.flush()
    return c


def auth_header(user: User) -> dict:
    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestGetCart:
    def test_empty_cart_returns_zeroes(self, client, user_a):
        r = client.get("/api/cart", headers=auth_header(user_a))
        assert r.status_code == 200
        data = r.json()
        assert data["items"] == []
        assert data["subtotal"] == 0.0
        assert data["tax"] == 0.0
        assert data["total"] == 0.0
        assert data["discount"] == 0.0
        assert data["coupon_code"] is None

    def test_unauthenticated_returns_401(self, client):
        r = client.get("/api/cart")
        assert r.status_code == 401


class TestUpsertItem:
    def test_add_new_item(self, client, user_a, book1):
        r = client.put(f"/api/cart/items/{book1.id}", json={"quantity": 2}, headers=auth_header(user_a))
        assert r.status_code == 200
        data = r.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["book_id"] == book1.id
        assert data["items"][0]["quantity"] == 2
        assert data["items"][0]["price"] == 200.0
        assert data["items"][0]["line_total"] == 400.0

    def test_update_existing_item_quantity(self, client, user_a, book1):
        client.put(f"/api/cart/items/{book1.id}", json={"quantity": 1}, headers=auth_header(user_a))
        r = client.put(f"/api/cart/items/{book1.id}", json={"quantity": 3}, headers=auth_header(user_a))
        assert r.status_code == 200
        data = r.json()
        assert data["items"][0]["quantity"] == 3

    def test_add_unknown_isbn_returns_404(self, client, user_a):
        r = client.put("/api/cart/items/978-00-000000-0-0", json={"quantity": 1}, headers=auth_header(user_a))
        assert r.status_code == 404

    def test_quantity_zero_rejected(self, client, user_a, book1):
        r = client.put(f"/api/cart/items/{book1.id}", json={"quantity": 0}, headers=auth_header(user_a))
        assert r.status_code == 422

    def test_multiple_items(self, client, user_a, book1, book2):
        client.put(f"/api/cart/items/{book1.id}", json={"quantity": 1}, headers=auth_header(user_a))
        client.put(f"/api/cart/items/{book2.id}", json={"quantity": 2}, headers=auth_header(user_a))
        r = client.get("/api/cart", headers=auth_header(user_a))
        data = r.json()
        assert len(data["items"]) == 2

    def test_unauthenticated_returns_401(self, client, book1):
        r = client.put(f"/api/cart/items/{book1.id}", json={"quantity": 1})
        assert r.status_code == 401


class TestTotalCalculations:
    def test_subtotal_and_tax(self, client, user_a, book1):
        # book1 price = 200, quantity = 3 → subtotal = 600, tax = round(600*0.12) = 72
        client.put(f"/api/cart/items/{book1.id}", json={"quantity": 3}, headers=auth_header(user_a))
        r = client.get("/api/cart", headers=auth_header(user_a))
        data = r.json()
        assert data["subtotal"] == 600.0
        assert data["tax"] == 72.0
        assert data["total"] == 672.0
        assert data["discount"] == 0.0

    def test_two_items_totals(self, client, user_a, book1, book2):
        # book1=200*1=200, book2=500*2=1000, subtotal=1200, tax=round(1200*0.12)=144
        client.put(f"/api/cart/items/{book1.id}", json={"quantity": 1}, headers=auth_header(user_a))
        client.put(f"/api/cart/items/{book2.id}", json={"quantity": 2}, headers=auth_header(user_a))
        r = client.get("/api/cart", headers=auth_header(user_a))
        data = r.json()
        assert data["subtotal"] == 1200.0
        assert data["tax"] == 144.0
        assert data["total"] == 1344.0


class TestRemoveItem:
    def test_remove_existing_item(self, client, user_a, book1, book2):
        client.put(f"/api/cart/items/{book1.id}", json={"quantity": 1}, headers=auth_header(user_a))
        client.put(f"/api/cart/items/{book2.id}", json={"quantity": 1}, headers=auth_header(user_a))
        r = client.delete(f"/api/cart/items/{book1.id}", headers=auth_header(user_a))
        assert r.status_code == 200
        data = r.json()
        book_ids = [i["book_id"] for i in data["items"]]
        assert book1.id not in book_ids
        assert book2.id in book_ids

    def test_remove_nonexistent_item_returns_404(self, client, user_a):
        r = client.delete("/api/cart/items/978-00-000000-0-0", headers=auth_header(user_a))
        assert r.status_code == 404

    def test_unauthenticated_returns_401(self, client, book1):
        r = client.delete(f"/api/cart/items/{book1.id}")
        assert r.status_code == 401


class TestClearCart:
    def test_clear_empties_cart(self, client, user_a, book1, book2):
        client.put(f"/api/cart/items/{book1.id}", json={"quantity": 2}, headers=auth_header(user_a))
        client.put(f"/api/cart/items/{book2.id}", json={"quantity": 1}, headers=auth_header(user_a))
        r = client.delete("/api/cart", headers=auth_header(user_a))
        assert r.status_code == 200
        data = r.json()
        assert data["items"] == []
        assert data["total"] == 0.0

    def test_clear_empty_cart_is_ok(self, client, user_a):
        r = client.delete("/api/cart", headers=auth_header(user_a))
        assert r.status_code == 200
        assert r.json()["items"] == []


class TestApplyCoupon:
    def test_apply_valid_coupon(self, client, user_a, book1, coupon):
        # book1=200 qty=2 → subtotal=400 tax=48 → total=448; coupon discount=50
        client.put(f"/api/cart/items/{book1.id}", json={"quantity": 2}, headers=auth_header(user_a))
        r = client.post("/api/cart/coupon", json={"code": coupon.code}, headers=auth_header(user_a))
        assert r.status_code == 200
        data = r.json()
        assert data["coupon_code"] == coupon.code
        assert data["discount"] == 50.0
        assert data["total"] == 448.0 - 50.0

    def test_apply_inactive_coupon_returns_400(self, client, user_a, inactive_coupon):
        r = client.post("/api/cart/coupon", json={"code": inactive_coupon.code}, headers=auth_header(user_a))
        assert r.status_code == 400

    def test_apply_unknown_coupon_returns_400(self, client, user_a):
        r = client.post("/api/cart/coupon", json={"code": "NOTREAL"}, headers=auth_header(user_a))
        assert r.status_code == 400

    def test_discount_capped_at_subtotal_plus_tax(self, client, user_a, book1, db_session):
        # book1=200 qty=1 → subtotal=200 tax=24 → total_before_discount=224
        # Use a coupon with discount 999 — should be capped to 224
        big_coupon = Coupon(code=f"BIG{uuid.uuid4().hex[:4].upper()}", discount_amount=999, is_active=True)
        db_session.add(big_coupon)
        db_session.flush()
        client.put(f"/api/cart/items/{book1.id}", json={"quantity": 1}, headers=auth_header(user_a))
        r = client.post("/api/cart/coupon", json={"code": big_coupon.code}, headers=auth_header(user_a))
        assert r.status_code == 200
        data = r.json()
        assert data["discount"] == 224.0
        assert data["total"] == 0.0

    def test_coupon_case_insensitive(self, client, user_a, coupon):
        r = client.post("/api/cart/coupon", json={"code": coupon.code.lower()}, headers=auth_header(user_a))
        assert r.status_code == 200
        assert r.json()["coupon_code"] == coupon.code

    def test_unauthenticated_returns_401(self, client, coupon):
        r = client.post("/api/cart/coupon", json={"code": coupon.code})
        assert r.status_code == 401


class TestRemoveCoupon:
    def test_remove_coupon(self, client, user_a, book1, coupon):
        client.put(f"/api/cart/items/{book1.id}", json={"quantity": 1}, headers=auth_header(user_a))
        client.post("/api/cart/coupon", json={"code": coupon.code}, headers=auth_header(user_a))
        r = client.delete("/api/cart/coupon", headers=auth_header(user_a))
        assert r.status_code == 200
        data = r.json()
        assert data["coupon_code"] is None
        assert data["discount"] == 0.0


class TestUserIsolation:
    def test_user_a_cannot_see_user_b_cart(self, client, user_a, user_b, book1):
        # user_b adds to their cart; user_a's cart must still be empty
        client.put(f"/api/cart/items/{book1.id}", json={"quantity": 5}, headers=auth_header(user_b))
        r = client.get("/api/cart", headers=auth_header(user_a))
        assert r.json()["items"] == []

    def test_user_b_cart_unaffected_by_user_a_clear(self, client, user_a, user_b, book1):
        client.put(f"/api/cart/items/{book1.id}", json={"quantity": 2}, headers=auth_header(user_b))
        client.delete("/api/cart", headers=auth_header(user_a))  # A clears own (empty) cart
        r = client.get("/api/cart", headers=auth_header(user_b))
        assert len(r.json()["items"]) == 1
