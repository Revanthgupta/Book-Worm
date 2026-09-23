from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from app.database import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    user_id = Column(String(40), ForeignKey("users.id"), primary_key=True)
    book_id = Column(String(25), ForeignKey("books.id"), primary_key=True)
    added_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="wishlist_items")
    book = relationship("Book", back_populates="wishlist_items")
