"""Gift points service — award, redeem, reverse, get balance."""
import uuid
from math import floor

from sqlalchemy.orm import Session

from app.models.gift_point_ledger import GiftPointLedger
from app.models.user import User


def get_balance(db: Session, user_id: str) -> int:
    user = db.get(User, user_id)
    return user.gift_points if user else 0


def award_points(db: Session, user_id: str, order_id: str, order_total: float) -> int:
    """Award 1% of order total as gift points. Returns points awarded."""
    points = floor(order_total * 0.01)
    if points <= 0:
        return 0
    user = db.get(User, user_id)
    user.gift_points += points
    db.add(GiftPointLedger(
        id=str(uuid.uuid4()),
        user_id=user_id,
        amount=points,
        reason="order_award",
        order_id=order_id,
    ))
    db.flush()
    return points


def redeem_points(db: Session, user_id: str, order_id: str, points: int) -> int:
    """Deduct `points` from user balance. Returns amount deducted.
    If balance < points, deducts only what is available.
    """
    user = db.get(User, user_id)
    actual = min(user.gift_points, points)
    if actual <= 0:
        return 0
    user.gift_points -= actual
    db.add(GiftPointLedger(
        id=str(uuid.uuid4()),
        user_id=user_id,
        amount=-actual,
        reason="order_redeem",
        order_id=order_id,
    ))
    db.flush()
    return actual


def reverse_points_for_order(db: Session, user_id: str, order_id: str) -> None:
    """Reverse all gift-point transactions for this order (cancellation)."""
    ledger_rows = (
        db.query(GiftPointLedger)
        .filter(GiftPointLedger.order_id == order_id)
        .all()
    )
    user = db.get(User, user_id)
    for row in ledger_rows:
        # Reverse: if award (+N) was given, remove it; if redeem (-N) was charged, refund it
        user.gift_points -= row.amount
        db.add(GiftPointLedger(
            id=str(uuid.uuid4()),
            user_id=user_id,
            amount=-row.amount,
            reason="order_cancel_reversal",
            order_id=order_id,
        ))
    # Clamp at zero — should not go negative in practice
    if user.gift_points < 0:
        user.gift_points = 0
    db.flush()
