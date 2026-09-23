"""Pydantic schemas for the Reviews API."""
from pydantic import BaseModel, Field


class ReviewRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    text: str = Field(..., min_length=1, max_length=100)


class ReviewResponse(BaseModel):
    id: str
    book_id: str
    user_id: str
    user_name: str
    rating: int
    text: str

    model_config = {"from_attributes": True}
