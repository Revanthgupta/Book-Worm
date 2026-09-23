from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from app.database import Base


class Cart(Base):
    __tablename__ = "carts"

    id = Column(String(36), primary_key=True)  # UUID string
    user_id = Column(String(40), ForeignKey("users.id"), nullable=False, unique=True)
    coupon_code = Column(String(20), ForeignKey("coupons.code"), nullable=True)
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="cart")
    coupon = relationship("Coupon", back_populates="carts")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
