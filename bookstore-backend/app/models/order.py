from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    # Format: 'ORD-{unix_ms}' — matches frontend ORD-${Date.now()}
    id = Column(String(30), primary_key=True)
    user_id = Column(String(40), ForeignKey("users.id"), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax = Column(Numeric(10, 2), nullable=False)
    discount = Column(Numeric(10, 2), nullable=False, default=0, server_default="0")
    redeemed_points_amount = Column(Integer, nullable=False, default=0, server_default="0")
    total = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), nullable=False, default="Processing", server_default="'Processing'")
    payment_method = Column(String(20), nullable=False)
    coupon_code = Column(String(20), nullable=True)
    address_id = Column(String(36), ForeignKey("addresses.id"), nullable=True)
    delivery_date = Column(Date, nullable=False)  # order_date + 7 calendar days
    points_awarded = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')",
            name="ck_orders_status",
        ),
    )

    # Relationships
    user = relationship("User", back_populates="orders")
    address = relationship("Address", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False)
    gift_point_ledger = relationship("GiftPointLedger", back_populates="order")
