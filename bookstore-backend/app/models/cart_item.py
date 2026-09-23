from sqlalchemy import CheckConstraint, Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(String(36), primary_key=True)  # UUID string
    cart_id = Column(String(36), ForeignKey("carts.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(String(25), ForeignKey("books.id"), nullable=False)
    quantity = Column(Integer, nullable=False)

    __table_args__ = (
        CheckConstraint("quantity >= 1", name="ck_cart_items_quantity"),
        UniqueConstraint("cart_id", "book_id", name="uq_cart_items_cart_book"),
    )

    # Relationships
    cart = relationship("Cart", back_populates="items")
    book = relationship("Book", back_populates="cart_items")
