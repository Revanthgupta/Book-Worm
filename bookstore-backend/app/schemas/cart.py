"""Pydantic schemas for the Cart API."""
from typing import Optional

from pydantic import BaseModel, Field


# ── Requests ──────────────────────────────────────────────────────────────────

class CartItemRequest(BaseModel):
    quantity: int = Field(..., ge=1, le=99)


class CouponRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=20)


# ── Response pieces ───────────────────────────────────────────────────────────

class CartItemResponse(BaseModel):
    book_id: str
    title: str
    cover_image: Optional[str]
    price: float
    quantity: int
    line_total: float

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    coupon_code: Optional[str]
    discount: float
    subtotal: float
    tax: float
    total: float

    model_config = {"from_attributes": True}
