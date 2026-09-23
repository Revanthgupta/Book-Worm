from sqlalchemy import (
    CheckConstraint,
    Column,
    ForeignKey,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True)  # UUID string
    book_id = Column(String(25), ForeignKey("books.id"), nullable=False)
    user_id = Column(String(40), ForeignKey("users.id"), nullable=False)
    rating = Column(SmallInteger, nullable=False)
    text = Column(String(100), nullable=False)
    user_name = Column(String(200), nullable=False)  # snapshot
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating"),
        CheckConstraint("length(trim(text)) >= 1", name="ck_reviews_text_nonempty"),
        UniqueConstraint("user_id", "book_id", name="uq_reviews_user_book"),
    )

    # Relationships
    book = relationship("Book", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
