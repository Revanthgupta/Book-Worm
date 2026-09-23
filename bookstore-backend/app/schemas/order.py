"""Pydantic schemas for the Orders API."""
from typing import Optional

from pydantic import BaseModel


class OrderItemResponse(BaseModel):
    id: str
    book_id: Optional[str]
    book_title: str
    author_name: str
    price_at_purchase: float
    quantity: int
    format: str
    cover_image: Optional[str]
    delivery_date: str

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: str
    user_id: str
    subtotal: float
    tax: float
    discount: float
    redeemed_points_amount: int
    total: float
    status: str
    payment_method: str
    coupon_code: Optional[str]
    address_id: Optional[str]
    delivery_date: str          # formatted "Mon, 21 Jul"
    points_awarded: bool
    created_at: str
    items: list[OrderItemResponse]

    model_config = {"from_attributes": True}
