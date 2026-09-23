from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class BookCategory(Base):
    __tablename__ = "book_categories"

    book_id = Column(String(25), ForeignKey("books.id", ondelete="CASCADE"), primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True)

    # Relationships
    book = relationship("Book", back_populates="book_categories")
    category = relationship("Category", back_populates="book_categories")
