from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from app.database import Base


class GiftPointLedger(Base):
    __tablename__ = "gift_point_ledger"

    id = Column(String(36), primary_key=True)  # UUID string
    user_id = Column(String(40), ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # positive = award, negative = deduction
    reason = Column(String(50), nullable=False)
    order_id = Column(String(30), ForeignKey("orders.id"), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="gift_point_ledger")
    order = relationship("Order", back_populates="gift_point_ledger")
