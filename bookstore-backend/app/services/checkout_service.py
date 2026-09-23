"""Checkout service — atomic orchestrator.

Steps (all in one transaction):
1. Load the user's cart with items
2. Validate cart is not empty
3. Calculate totals (cart_service logic)
4. If redeem_points: deduct from user balance
5. Create Order row with id = "ORD-{unix_ms}"
6. Create OrderItem snapshot rows
7. Process payment (mock)
8. Award gift points (1% of total)
9. Mark order.points_awarded = True
10. Clear cart
11. Commit
"""
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.checkout import CheckoutRequest, CheckoutResponse
from app.services import cart_service, gift_points_service, payment_service
from app.services.order_service import _delivery_date, _delivery_date_string


def execute(db: Session, user_id: str, request: CheckoutRequest) -> CheckoutResponse:
    # ── 1. Load cart ──────────────────────────────────────────────────────────
    cart = (
        db.query(Cart)
        .options(
            joinedload(Cart.items).joinedload(CartItem.book),
            joinedload(Cart.coupon),
        )
        .filter(Cart.user_id == user_id)
        .first()
    )

    if cart is None or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    # ── 2. Calculate totals ───────────────────────────────────────────────────
    cart_resp = cart_service._calculate_totals(cart)
    subtotal = cart_resp.subtotal
    tax = cart_resp.tax
    coupon_discount = cart_resp.discount
    coupon_code = cart_resp.coupon_code

    # ── 3. Redeem gift points ─────────────────────────────────────────────────
    redeemed_amount = 0
    if request.redeem_points:
        balance = gift_points_service.get_balance(db, user_id)
        # Points are whole rupees; cannot exceed total-after-coupon
        max_redeemable = max(0, round(subtotal + tax - coupon_discount))
        to_redeem = min(balance, max_redeemable)
        # We do the actual deduction after order creation (inside the transaction)
        redeemed_amount = to_redeem

    total = max(0.0, round(subtotal + tax - coupon_discount - redeemed_amount, 2))

    # ── 4. Generate order id ──────────────────────────────────────────────────
    now_utc = datetime.now(tz=timezone.utc)
    unix_ms = int(now_utc.timestamp() * 1000)
    order_id = f"ORD-{unix_ms}"

    delivery_d = _delivery_date(now_utc.date())
    delivery_str = _delivery_date_string(delivery_d)

    # ── 5–11. All writes inside a SAVEPOINT ──────────────────────────────────
    # Using begin_nested() means a payment failure rolls back only the Order /
    # OrderItems / Payment rows, not the outer transaction (preserving the
    # caller's session scope and test fixtures).
    savepoint = db.begin_nested()
    try:
        # 5. Create Order row
        order = Order(
            id=order_id,
            user_id=user_id,
            subtotal=subtotal,
            tax=tax,
            discount=coupon_discount,
            redeemed_points_amount=redeemed_amount,
            total=total,
            status="Processing",
            payment_method=request.payment_method,
            coupon_code=coupon_code,
            address_id=request.address_id,
            delivery_date=delivery_d,
            points_awarded=False,
        )
        db.add(order)
        db.flush()

        # 6. Create OrderItem snapshot rows
        for cart_item in cart.items:
            book = cart_item.book
            db.add(OrderItem(
                id=str(uuid.uuid4()),
                order_id=order_id,
                book_id=book.id,
                book_title=book.title,
                author_name=book.author.name if book.author else "",
                price_at_purchase=book.price,
                quantity=cart_item.quantity,
                format=book.format or "Paperback",
                cover_image=book.cover_image,
                delivery_date=delivery_str,
            ))
        db.flush()

        # 7. Process payment
        payment_service.process_payment(
            db,
            order_id=order_id,
            method=request.payment_method,
            amount=total,
            card_number=request.card_number,
        )

        # 8. Deduct redeemed points (if any)
        if redeemed_amount > 0:
            gift_points_service.redeem_points(db, user_id, order_id, redeemed_amount)

        # 9. Award gift points (1% of total)
        points_awarded = gift_points_service.award_points(db, user_id, order_id, total)
        order.points_awarded = True
        db.flush()

        # 10. Clear cart
        for item in list(cart.items):
            db.delete(item)
        cart.coupon_code = None
        db.flush()

        savepoint.commit()

    except ValueError as exc:
        savepoint.rollback()
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=str(exc))

    # ── 11. Commit outer transaction ──────────────────────────────────────────
    db.commit()

    return CheckoutResponse(
        order_id=order_id,
        status="Processing",
        subtotal=subtotal,
        tax=tax,
        discount=coupon_discount,
        redeemed_points_amount=redeemed_amount,
        total=total,
        points_awarded=points_awarded,
        delivery_date=delivery_str,
        payment_method=request.payment_method,
    )
