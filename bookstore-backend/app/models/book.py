from sqlalchemy import Boolean, CheckConstraint, Column, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Book(Base):
    __tablename__ = "books"

    # ISBN is the primary key — e.g. '978-81-000001-0-1'
    id = Column(String(25), primary_key=True)
    title = Column(String(300), nullable=False)
    author_id = Column(String(10), ForeignKey("authors.id"), nullable=False)
    publisher = Column(String(200))
    format = Column(String(20))
    price = Column(Numeric(10, 2), nullable=False)
    cover_image = Column(Text)
    synopsis = Column(Text)
    back_cover_text = Column(Text)
    language = Column(String(30))
    rating = Column(Numeric(3, 2))
    sells = Column(Integer, default=0, server_default="0")
    featured = Column(Boolean, default=False, server_default="false")
    bestseller = Column(Boolean, default=False, server_default="false")
    new_launch = Column(Boolean, default=False, server_default="false")

    __table_args__ = (
        CheckConstraint("format IN ('Paperback', 'Hard Cover', 'eBook')", name="ck_books_format"),
        CheckConstraint("rating >= 1.0 AND rating <= 5.0", name="ck_books_rating"),
    )

    # Relationships
    author = relationship("Author", back_populates="books")
    book_categories = relationship("BookCategory", back_populates="book", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="book")
    wishlist_items = relationship("Wishlist", back_populates="book")
    reviews = relationship("Review", back_populates="book", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="book")
