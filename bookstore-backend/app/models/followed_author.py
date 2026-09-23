from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from app.database import Base


class FollowedAuthor(Base):
    __tablename__ = "followed_authors"

    user_id = Column(String(40), ForeignKey("users.id"), primary_key=True)
    author_id = Column(String(10), ForeignKey("authors.id"), primary_key=True)
    followed_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="followed_authors")
    author = relationship("Author", back_populates="followed_by")
