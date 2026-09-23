"""Followed Authors service — follow, unfollow, list."""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.followed_author import FollowedAuthor


def list_followed(db: Session, user_id: str) -> list[dict]:
    rows = (
        db.query(FollowedAuthor)
        .options(joinedload(FollowedAuthor.author))
        .filter(FollowedAuthor.user_id == user_id)
        .order_by(FollowedAuthor.followed_at)
        .all()
    )
    return [
        {
            "author_id": row.author.id,
            "name": row.author.name,
            "photo": row.author.photo,
            "bio": row.author.bio,
        }
        for row in rows
    ]


def follow_author(db: Session, user_id: str, author_id: str) -> dict:
    from app.models.author import Author  # local import

    author = db.get(Author, author_id)
    if author is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Author not found")

    existing = db.get(FollowedAuthor, (user_id, author_id))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already following this author")

    db.add(FollowedAuthor(user_id=user_id, author_id=author_id))
    db.commit()
    return {"author_id": author.id, "name": author.name, "photo": author.photo, "bio": author.bio}


def unfollow_author(db: Session, user_id: str, author_id: str) -> None:
    row = db.get(FollowedAuthor, (user_id, author_id))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not following this author")
    db.delete(row)
    db.commit()
