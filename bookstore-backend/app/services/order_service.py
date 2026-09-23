"""Order service — create, list, get, cancel, buy-again."""
import uuid
from datetime import date, datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderItemResponse, OrderResponse


# ── Delivery date helpers ─────────────────────────────────────────────────────

def _delivery_date_string(d: date) -> str:
    """Format date as 'Mon, 21 Jul' — cross-platform (no %-d on Windows)."""
    return d.strftime("%a, ") + str(d.day) + d.strftime(" %b")


def _delivery_date(order_date: date) -> date:
    return order_date + timedelta(days=7)


# ── Serialisation ─────────────────────────────────────────────────────────────

def _order_to_response(order: Order) -> OrderResponse:
    items = [
        OrderItemResponse(
            id=item.id,
            book_id=item.book_id,
            book_title=item.book_title,
            author_name=item.author_name,
            price_at_purchase=float(item.price_at_purchase),
            quantity=item.quantity,
            format=item.format,
            cover_image=item.cover_image,
            delivery_date=item.delivery_date,
        )
        for item in order.items
    ]
    delivery_str = _delivery_date_string(order.delivery_date) if order.delivery_date else ""
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        subtotal=float(order.subtotal),
        tax=float(order.tax),
        discount=float(order.discount),
        redeemed_points_amount=order.redeemed_points_amount,
        total=float(order.total),
        status=order.status,
        payment_method=order.payment_method,
        coupon_code=order.coupon_code,
        address_id=order.address_id,
        delivery_date=delivery_str,
        points_awarded=order.points_awarded,
        created_at=order.created_at.isoformat() if order.created_at else "",
        items=items,
    )


def _load_order(db: Session, order_id: str) -> Order:
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )


# ── Public API ────────────────────────────────────────────────────────────────

def list_orders(db: Session, user_id: str) -> list[OrderResponse]:
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [_order_to_response(o) for o in orders]


def get_order(db: Session, user_id: str, order_id: str) -> OrderResponse:
    order = _load_order(db, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return _order_to_response(order)


def cancel_order(db: Session, user_id: str, order_id: str) -> OrderResponse:
    from app.services import gift_points_service  # local import to avoid circular

    order = _load_order(db, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if order.status == "Cancelled":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Order is already cancelled")
    if order.status not in ("Processing", "Shipped"):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Order cannot be cancelled")

    # 48-hour window — use UTC-aware comparison
    created_utc = order.created_at
    now_utc = datetime.now(tz=timezone.utc)
    if created_utc.tzinfo is None:
        created_utc = created_utc.replace(tzinfo=timezone.utc)
    if now_utc > created_utc + timedelta(hours=48):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cancellation window has expired (48 hours)",
        )

    # Safe conditional UPDATE — only update if still cancellable
    updated = (
        db.query(Order)
        .filter(Order.id == order_id, Order.status.in_(["Processing", "Shipped"]))
        .update({"status": "Cancelled"}, synchronize_session="fetch")
    )
    if updated == 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Order cannot be cancelled")

    # Reverse gift points
    gift_points_service.reverse_points_for_order(db, user_id, order_id)
    db.commit()

    return get_order(db, user_id, order_id)


def buy_again(db: Session, user_id: str, order_id: str) -> dict:
    """Add all items from an order back into the cart."""
    from app.services import cart_service  # local import

    order = _load_order(db, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    for item in order.items:
        if item.book_id:  # book may have been deleted
            cart_service.upsert_item(db, user_id, item.book_id, item.quantity)

    return {"message": "Items added to cart"}
