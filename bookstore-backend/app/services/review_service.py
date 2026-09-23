"""Review service — create and list with UNIQUE(user_id, book_id) enforcement."""
import uuid

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.review import Review
from app.schemas.review import ReviewRequest, ReviewResponse


def list_reviews(db: Session, isbn: str) -> list[ReviewResponse]:
    rows = (
        db.query(Review)
        .filter(Review.book_id == isbn)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [ReviewResponse.model_validate(r) for r in rows]


def create_review(db: Session, user_id: str, user_name: str, isbn: str, data: ReviewRequest) -> ReviewResponse:
    from app.models.book import Book  # local import

    book = db.get(Book, isbn)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    try:
        review = Review(
            id=str(uuid.uuid4()),
            book_id=isbn,
            user_id=user_id,
            rating=data.rating,
            text=data.text,
            user_name=user_name,
        )
        db.add(review)
        db.commit()
        db.refresh(review)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this book",
        )

    return ReviewResponse.model_validate(review)
