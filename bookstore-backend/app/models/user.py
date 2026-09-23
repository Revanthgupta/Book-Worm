from sqlalchemy import Boolean, CheckConstraint, Column, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(40), primary_key=True)  # 'u1','u2','u3' for demo; UUID string for new
    name = Column(String(200), nullable=False)
    email = Column(String(320), nullable=False, unique=True)
    hashed_password = Column(String(255), nullable=False)
    gift_points = Column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint("gift_points >= 0", name="ck_users_gift_points_non_negative"),
    )

    # Relationships
    cart = relationship("Cart", back_populates="user", uselist=False)
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    gift_point_ledger = relationship("GiftPointLedger", back_populates="user", cascade="all, delete-orphan")
    followed_authors = relationship("FollowedAuthor", back_populates="user", cascade="all, delete-orphan")
