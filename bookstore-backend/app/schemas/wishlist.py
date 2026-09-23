"""Pydantic schemas for the Wishlist API."""
from typing import Optional

from pydantic import BaseModel


class WishlistItemResponse(BaseModel):
    book_id: str
    title: str
    cover_image: Optional[str]
    price: float
    author_name: str

    model_config = {"from_attributes": True}
