from sqlalchemy import CheckConstraint, Column, ForeignKey, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True)  # UUID string
    order_id = Column(String(30), ForeignKey("orders.id"), nullable=False, unique=True)
    method = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False)
    transaction_id = Column(String(50))
    amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint("status IN ('success', 'failed')", name="ck_payments_status"),
    )

    # Relationships
    order = relationship("Order", back_populates="payment")
