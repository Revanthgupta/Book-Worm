from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from app.database import Base


class Address(Base):
    __tablename__ = "addresses"

    id = Column(String(36), primary_key=True)  # UUID string
    user_id = Column(String(40), ForeignKey("users.id"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    address_line = Column(String(500), nullable=False)
    email = Column(String(320), nullable=False)
    city = Column(String(100), nullable=False)
    pin = Column(String(6), nullable=False)
    phone_country_code = Column(String(10), nullable=False, default="+91", server_default="'+91'")
    phone = Column(String(20), nullable=False)
    state = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False, default="India", server_default="'India'")
    is_default = Column(Boolean, default=False, server_default="false")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="addresses")
    orders = relationship("Order", back_populates="address")
