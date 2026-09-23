"""Payment service — deterministic mock payment processor.

Card 4000000000000002 always fails; all other card numbers succeed.
Non-card payment methods (upi, netbanking, wallet, cod) always succeed.
"""
import uuid

from sqlalchemy.orm import Session

from app.models.payment import Payment


FAILING_CARD = "4000000000000002"


def process_payment(
    db: Session,
    order_id: str,
    method: str,
    amount: float,
    card_number: str | None = None,
) -> Payment:
    """Create a Payment row and return it. Raises ValueError on failure."""
    # Determine outcome
    if method == "card" and card_number and card_number.replace(" ", "") == FAILING_CARD:
        # Record the failure row then raise
        payment = Payment(
            id=str(uuid.uuid4()),
            order_id=order_id,
            method=method,
            status="failed",
            transaction_id=None,
            amount=amount,
        )
        db.add(payment)
        db.flush()
        raise ValueError("Card payment declined")

    payment = Payment(
        id=str(uuid.uuid4()),
        order_id=order_id,
        method=method,
        status="success",
        transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
        amount=amount,
    )
    db.add(payment)
    db.flush()
    return payment
