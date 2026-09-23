"""Wishlist router."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.wishlist import WishlistItemResponse
from app.services import wishlist_service

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@router.get("", response_model=list[WishlistItemResponse])
def list_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return wishlist_service.list_wishlist(db, current_user.id)


@router.post("/{isbn}", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    isbn: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return wishlist_service.add_to_wishlist(db, current_user.id, isbn)


@router.delete("/{isbn}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    isbn: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wishlist_service.remove_from_wishlist(db, current_user.id, isbn)
