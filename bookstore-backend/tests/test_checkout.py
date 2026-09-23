"""Tests for B8 — Checkout, Orders, Gift Points, and Cancellation."""
import uuid
from datetime import datetime, timedelta, timezone
from math import floor

import pytest

from app.core.security import create_access_token, hash_password
from app.models.book import Book
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.coupon import Coupon
from app.models.order import Order
from app.models.user import User


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def user(db_session):
    u = User(
        id=str(uuid.uuid4()),
        name="Checkout User",
        email=f"checkout_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("pw"),
        gift_points=200,
    )
    db_session.add(u)
    db_session.flush()
    return u


@pytest.fixture
def user_b(db_session):
    u = User(
        id=str(uuid.uuid4()),
        name="Other User",
        email=f"other_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("pw"),
    )
    db_session.add(u)
    db_session.flush()
    return u


@pytest.fixture
def book1(db_session):
    from app.models.author import Author
    aid = f"a_{uuid.uuid4().hex[:6]}"
    db_session.add(Author(id=aid, name="Checkout Author", bio=""))
    b = Book(
        id=f"978-co-{uuid.uuid4().hex[:6]}-1",
        title="Checkout Book One",
        author_id=aid,
        price=400,
        format="Paperback",
    )
    db_session.add(b)
    db_session.flush()
    return b


@pytest.fixture
def book2(db_session):
    from app.models.author import Author
    aid = f"a_{uuid.uuid4().hex[:6]}"
    db_session.add(Author(id=aid, name="Checkout Author 2", bio=""))
    b = Book(
        id=f"978-co-{uuid.uuid4().hex[:6]}-2",
        title="Checkout Book Two",
        author_id=aid,
        price=600,
        format="Hard Cover",
    )
    db_session.add(b)
    db_session.flush()
    return b


@pytest.fixture
def coupon(db_session):
    c = Coupon(code=f"CO{uuid.uuid4().hex[:4].upper()}", discount_amount=50, is_active=True)
    db_session.add(c)
    db_session.flush()
    return c


def auth_header(user: User) -> dict:
    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}


def add_to_cart(client, user, book, qty=1):
    return client.put(f"/api/cart/items/{book.id}", json={"quantity": qty}, headers=auth_header(user))


# ── Checkout Tests ─────────────────────────────────────────────────────────────

class TestCheckout:
    def test_successful_checkout(self, client, user, book1):
        add_to_cart(client, user, book1, qty=2)
        r = client.post("/api/checkout", json={"payment_method": "upi"}, headers=auth_header(user))
        assert r.status_code == 200
        data = r.json()
        assert data["order_id"].startswith("ORD-")
        assert data["status"] == "Processing"
        # book1=400*2=800, tax=round(800*0.12)=96, total=896
        assert data["subtotal"] == 800.0
        assert data["tax"] == 96.0
        assert data["total"] == 896.0
        assert data["discount"] == 0.0
        assert data["payment_method"] == "upi"
        # Gift points = floor(896 * 0.01) = 8
        assert data["points_awarded"] == 8

    def test_checkout_clears_cart(self, client, user, book1):
        add_to_cart(client, user, book1, qty=1)
        client.post("/api/checkout", json={"payment_method": "cod"}, headers=auth_header(user))
        cart_r = client.get("/api/cart", headers=auth_header(user))
        assert cart_r.json()["items"] == []

    def test_checkout_empty_cart_returns_400(self, client, user):
        r = client.post("/api/checkout", json={"payment_method": "upi"}, headers=auth_header(user))
        assert r.status_code == 400

    def test_checkout_failing_card_returns_402(self, client, user, book1):
        add_to_cart(client, user, book1, qty=1)
        r = client.post(
            "/api/checkout",
            json={"payment_method": "card", "card_number": "4000000000000002"},
            headers=auth_header(user),
        )
        assert r.status_code == 402

    def test_failed_payment_does_not_create_order(self, client, user, book1):
        # Capture user_id before any rollback can detach the ORM object
        user_id = user.id
        add_to_cart(client, user, book1, qty=1)
        client.post(
            "/api/checkout",
            json={"payment_method": "card", "card_number": "4000000000000002"},
            headers={"Authorization": f"Bearer {create_access_token(user_id)}"},
        )
        orders_r = client.get(
            "/api/orders",
            headers={"Authorization": f"Bearer {create_access_token(user_id)}"},
        )
        assert orders_r.json() == []

    def test_checkout_with_coupon(self, client, user, book1, coupon):
        add_to_cart(client, user, book1, qty=1)
        client.post("/api/cart/coupon", json={"code": coupon.code}, headers=auth_header(user))
        r = client.post("/api/checkout", json={"payment_method": "upi"}, headers=auth_header(user))
        assert r.status_code == 200
        data = r.json()
        # book1=400, tax=48, coupon=50 → total=398
        assert data["discount"] == 50.0
        assert data["total"] == 398.0

    def test_checkout_with_gift_points(self, client, user, book1):
        # user has 200 gift points
        add_to_cart(client, user, book1, qty=1)
        r = client.post(
            "/api/checkout",
            json={"payment_method": "upi", "redeem_points": True},
            headers=auth_header(user),
        )
        assert r.status_code == 200
        data = r.json()
        # book1=400, tax=48, total_before_points=448, redeem 200 → total=248
        assert data["redeemed_points_amount"] == 200
        assert data["total"] == 248.0

    def test_checkout_awards_gift_points_correctly(self, client, user, book1, db_session):
        add_to_cart(client, user, book1, qty=2)  # total=896
        client.post("/api/checkout", json={"payment_method": "upi"}, headers=auth_header(user))
        db_session.refresh(user)
        # user started with 200, awarded floor(896*0.01)=8 → 208
        assert user.gift_points == 208

    def test_checkout_unauthenticated_returns_401(self, client):
        r = client.post("/api/checkout", json={"payment_method": "upi"})
        assert r.status_code == 401

    def test_delivery_date_format(self, client, user, book1):
        add_to_cart(client, user, book1, qty=1)
        r = client.post("/api/checkout", json={"payment_method": "cod"}, headers=auth_header(user))
        data = r.json()
        # delivery_date should look like "Mon, 5 Aug"
        delivery = data["delivery_date"]
        assert "," in delivery
        parts = delivery.split(", ")
        assert len(parts) == 2
        assert len(parts[0]) == 3  # 3-letter day abbreviation

    def test_checkout_with_address(self, client, user, book1):
        # Create an address first
        addr_r = client.post("/api/addresses", json={
            "first_name": "Test", "last_name": "User", "address_line": "123 Main St",
            "email": "t@test.com", "city": "Mumbai", "pin": "400001",
            "phone": "9999999999", "state": "Maharashtra",
        }, headers=auth_header(user))
        addr_id = addr_r.json()["id"]
        add_to_cart(client, user, book1, qty=1)
        r = client.post(
            "/api/checkout",
            json={"payment_method": "upi", "address_id": addr_id},
            headers=auth_header(user),
        )
        assert r.status_code == 200


# ── Orders Tests ───────────────────────────────────────────────────────────────

class TestOrders:
    def test_list_orders_empty(self, client, user):
        r = client.get("/api/orders", headers=auth_header(user))
        assert r.status_code == 200
        assert r.json() == []

    def test_list_orders_after_checkout(self, client, user, book1):
        add_to_cart(client, user, book1, qty=1)
        client.post("/api/checkout", json={"payment_method": "cod"}, headers=auth_header(user))
        r = client.get("/api/orders", headers=auth_header(user))
        data = r.json()
        assert len(data) == 1
        assert data[0]["status"] == "Processing"
        assert data[0]["user_id"] == user.id

    def test_get_order_by_id(self, client, user, book1):
        add_to_cart(client, user, book1, qty=1)
        co_r = client.post("/api/checkout", json={"payment_method": "cod"}, headers=auth_header(user))
        order_id = co_r.json()["order_id"]
        r = client.get(f"/api/orders/{order_id}", headers=auth_header(user))
        assert r.status_code == 200
        assert r.json()["id"] == order_id

    def test_order_contains_items(self, client, user, book1, book2):
        add_to_cart(client, user, book1, qty=1)
        add_to_cart(client, user, book2, qty=2)
        co_r = client.post("/api/checkout", json={"payment_method": "cod"}, headers=auth_header(user))
        order_id = co_r.json()["order_id"]
        r = client.get(f"/api/orders/{order_id}", headers=auth_header(user))
        items = r.json()["items"]
        assert len(items) == 2

    def test_get_order_not_found(self, client, user):
        r = client.get("/api/orders/ORD-999999", headers=auth_header(user))
        assert r.status_code == 404

    def test_get_other_user_order_returns_403(self, client, user, user_b, book1):
        add_to_cart(client, user, book1, qty=1)
        co_r = client.post("/api/checkout", json={"payment_method": "cod"}, headers=auth_header(user))
        order_id = co_r.json()["order_id"]
        r = client.get(f"/api/orders/{order_id}", headers=auth_header(user_b))
        assert r.status_code == 403

    def test_user_isolation(self, client, user, user_b, book1):
        # user places an order; user_b's order list should be empty
        add_to_cart(client, user, book1, qty=1)
        client.post("/api/checkout", json={"payment_method": "cod"}, headers=auth_header(user))
        r = client.get("/api/orders", headers=auth_header(user_b))
        assert r.json() == []

    def test_unauthenticated_returns_401(self, client):
        r = client.get("/api/orders")
        assert r.status_code == 401


# ── Cancellation Tests ────────────────────────────────────────────────────────

class TestCancelOrder:
    def test_cancel_processing_order(self, client, user, book1):
        add_to_cart(client, user, book1, qty=1)
        co_r = client.post("/api/checkout", json={"payment_method": "upi"}, headers=auth_header(user))
        order_id = co_r.json()["order_id"]
        r = client.post(f"/api/orders/{order_id}/cancel", headers=auth_header(user))
        assert r.status_code == 200
        assert r.json()["status"] == "Cancelled"

    def test_cancel_reverses_gift_points(self, client, user, book1, db_session):
        # user starts with 200 points
        add_to_cart(client, user, book1, qty=1)
        co_r = client.post("/api/checkout", json={"payment_method": "upi"}, headers=auth_header(user))
        order_id = co_r.json()["order_id"]
        points_awarded = co_r.json()["points_awarded"]
        db_session.refresh(user)
        balance_after_checkout = user.gift_points  # 200 + points_awarded
        client.post(f"/api/orders/{order_id}/cancel", headers=auth_header(user))
        db_session.refresh(user)
        # Should have reverted the awarded points
        assert user.gift_points == balance_after_checkout - points_awarded

    def test_cancel_already_cancelled_returns_409(self, client, user, book1):
        add_to_cart(client, user, book1, qty=1)
        co_r = client.post("/api/checkout", json={"payment_method": "upi"}, headers=auth_header(user))
        order_id = co_r.json()["order_id"]
        client.post(f"/api/orders/{order_id}/cancel", headers=auth_header(user))
        r = client.post(f"/api/orders/{order_id}/cancel", headers=auth_header(user))
        assert r.status_code == 409

    def test_cancel_other_user_order_returns_403(self, client, user, user_b, book1):
        add_to_cart(client, user, book1, qty=1)
        co_r = client.post("/api/checkout", json={"payment_method": "upi"}, headers=auth_header(user))
        order_id = co_r.json()["order_id"]
        r = client.post(f"/api/orders/{order_id}/cancel", headers=auth_header(user_b))
        assert r.status_code == 403

    def test_cancel_nonexistent_order_returns_404(self, client, user):
        r = client.post("/api/orders/ORD-000000/cancel", headers=auth_header(user))
        assert r.status_code == 404

    def test_cancel_reverses_redeemed_points(self, client, user, book1, db_session):
        # user has 200 points; redeem them at checkout
        add_to_cart(client, user, book1, qty=1)
        co_r = client.post(
            "/api/checkout",
            json={"payment_method": "upi", "redeem_points": True},
            headers=auth_header(user),
        )
        order_id = co_r.json()["order_id"]
        db_session.refresh(user)
        points_after_checkout = user.gift_points  # 200 - 200 (redeemed) + awarded
        client.post(f"/api/orders/{order_id}/cancel", headers=auth_header(user))
        db_session.refresh(user)
        # After cancel: redeemed 200 refunded, awarded points removed → back to 200
        assert user.gift_points == 200


# ── Buy Again Tests ────────────────────────────────────────────────────────────

class TestBuyAgain:
    def test_buy_again_adds_to_cart(self, client, user, book1):
        add_to_cart(client, user, book1, qty=3)
        co_r = client.post("/api/checkout", json={"payment_method": "cod"}, headers=auth_header(user))
        order_id = co_r.json()["order_id"]
        # Cart should now be empty after checkout
        assert client.get("/api/cart", headers=auth_header(user)).json()["items"] == []
        # Buy again
        r = client.post(f"/api/orders/{order_id}/buy-again", headers=auth_header(user))
        assert r.status_code == 200
        cart_r = client.get("/api/cart", headers=auth_header(user))
        items = cart_r.json()["items"]
        assert len(items) == 1
        assert items[0]["book_id"] == book1.id
        assert items[0]["quantity"] == 3

    def test_buy_again_other_user_returns_403(self, client, user, user_b, book1):
        add_to_cart(client, user, book1, qty=1)
        co_r = client.post("/api/checkout", json={"payment_method": "cod"}, headers=auth_header(user))
        order_id = co_r.json()["order_id"]
        r = client.post(f"/api/orders/{order_id}/buy-again", headers=auth_header(user_b))
        assert r.status_code == 403

    def test_buy_again_nonexistent_order_returns_404(self, client, user):
        r = client.post("/api/orders/ORD-000000/buy-again", headers=auth_header(user))
        assert r.status_code == 404


# ── Gift Points Balance Tests ──────────────────────────────────────────────────

class TestGiftPointsBalance:
    def test_get_balance(self, client, user):
        r = client.get("/api/gift-points/balance", headers=auth_header(user))
        assert r.status_code == 200
        assert r.json()["balance"] == 200  # seeded with 200

    def test_balance_increases_after_checkout(self, client, user, book1, db_session):
        add_to_cart(client, user, book1, qty=2)  # subtotal=800, tax=96, total=896
        client.post("/api/checkout", json={"payment_method": "upi"}, headers=auth_header(user))
        r = client.get("/api/gift-points/balance", headers=auth_header(user))
        # 200 initial + floor(896 * 0.01) = 200 + 8 = 208
        assert r.json()["balance"] == 208

    def test_unauthenticated_returns_401(self, client):
        r = client.get("/api/gift-points/balance")
        assert r.status_code == 401
