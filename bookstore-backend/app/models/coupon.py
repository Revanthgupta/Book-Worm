from sqlalchemy import Boolean, Column, Numeric, String
from sqlalchemy.orm import relationship

from app.database import Base


class Coupon(Base):
    __tablename__ = "coupons"

    code = Column(String(20), primary_key=True)
    discount_amount = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")

    # Relationships
    carts = relationship("Cart", back_populates="coupon")
