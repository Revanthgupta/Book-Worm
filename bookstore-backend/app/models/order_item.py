from sqlalchemy import CheckConstraint, Column, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True)  # UUID string
    order_id = Column(String(30), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(String(25), ForeignKey("books.id"), nullable=True)  # nullable: book may be deleted
    book_title = Column(String(300), nullable=False)       # snapshot
    author_name = Column(String(200), nullable=False)      # snapshot
    price_at_purchase = Column(Numeric(10, 2), nullable=False)  # snapshot
    quantity = Column(Integer, nullable=False)
    format = Column(String(20), nullable=False)            # snapshot
    cover_image = Column(Text)                             # snapshot
    delivery_date = Column(String(20), nullable=False)     # formatted string, e.g. "Mon, 21 Jul"

    __table_args__ = (
        CheckConstraint("quantity >= 1", name="ck_order_items_quantity"),
    )

    # Relationships
    order = relationship("Order", back_populates="items")
    book = relationship("Book", back_populates="order_items")
