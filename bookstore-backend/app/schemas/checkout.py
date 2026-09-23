"""Pydantic schemas for the Checkout API."""
from typing import Optional

from pydantic import BaseModel, Field


# ── Request ───────────────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    payment_method: str = Field(..., description="'card', 'upi', 'netbanking', 'wallet', 'cod'")
    card_number: Optional[str] = Field(default=None, description="Last-16-digit card number for card payments")
    address_id: Optional[str] = None
    redeem_points: bool = False


# ── Response ──────────────────────────────────────────────────────────────────

class CheckoutResponse(BaseModel):
    order_id: str
    status: str
    subtotal: float
    tax: float
    discount: float
    redeemed_points_amount: int
    total: float
    points_awarded: int
    delivery_date: str
    payment_method: str
