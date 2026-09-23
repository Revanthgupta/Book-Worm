from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Author(Base):
    __tablename__ = "authors"

    id = Column(String(10), primary_key=True)  # 'a1' … 'a9'
    name = Column(String(200), nullable=False)
    photo = Column(Text)
    bio = Column(Text)

    # Relationships
    books = relationship("Book", back_populates="author")
    followed_by = relationship("FollowedAuthor", back_populates="author", cascade="all, delete-orphan")
