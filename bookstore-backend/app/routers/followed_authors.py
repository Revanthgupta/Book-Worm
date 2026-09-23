"""Followed Authors router."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.services import followed_author_service

router = APIRouter(prefix="/api/authors/followed", tags=["followed-authors"])


@router.get("", response_model=list[dict])
def list_followed(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return followed_author_service.list_followed(db, current_user.id)


@router.post("/{author_id}", status_code=status.HTTP_201_CREATED)
def follow_author(
    author_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return followed_author_service.follow_author(db, current_user.id, author_id)


@router.delete("/{author_id}", status_code=status.HTTP_204_NO_CONTENT)
def unfollow_author(
    author_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    followed_author_service.unfollow_author(db, current_user.id, author_id)
